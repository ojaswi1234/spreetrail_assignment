import { parse } from 'csv-parse/sync';
import prisma from '../utils/prisma';
import { SplitType } from '@prisma/client';

export interface Anomaly {
  rowNumber: number;
  rowData: any;
  type: string;
  description: string;
  actionTaken: string;
}

const EXCHANGE_RATE_USD_TO_INR = 83;

export const analyzeCSVData = async (buffer: Buffer, groupId: string) => {
  const content = buffer.toString();
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const users = await prisma.user.findMany();
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (!group) throw new Error('Group not found');

  const anomalies: Anomaly[] = [];
  const processedData: any[] = [];
  const seenEntries = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    const row = records[i] as any;
    const rowNum = i + 2; // +1 for 0-index, +1 for header row

    // 1. Detect Missing Payer or Amount
    if (!row.paid_by || !row.amount) {
      anomalies.push({
        rowNumber: rowNum,
        rowData: row,
        type: 'MISSING_DATA',
        description: 'Missing payer or amount',
        actionTaken: 'SKIPPED',
      });
      continue;
    }

    // 2. Parse Amount (handle commas like "1,200")
    let amount = parseFloat(row.amount.replace(/,/g, ''));
    if (isNaN(amount)) {
      anomalies.push({
        rowNumber: rowNum,
        rowData: row,
        type: 'INVALID_AMOUNT',
        description: `Could not parse amount: ${row.amount}`,
        actionTaken: 'SKIPPED',
      });
      continue;
    }

    // 3. Detect Zero Amount
    if (amount === 0) {
      anomalies.push({
        rowNumber: rowNum,
        rowData: row,
        type: 'ZERO_AMOUNT',
        description: 'Amount is zero',
        actionTaken: 'SKIPPED',
      });
      continue;
    }

    // 4. Normalize Name Variations
    const normalizedPayerName = row.paid_by.trim().toLowerCase();
    const payer = users.find((u: any) => u.name.toLowerCase() === normalizedPayerName || u.name.toLowerCase() === normalizedPayerName.split(' ')[0]);
    
    if (!payer) {
       anomalies.push({
        rowNumber: rowNum,
        rowData: row,
        type: 'UNKNOWN_USER',
        description: `Payer "${row.paid_by}" not found in system`,
        actionTaken: 'SKIPPED',
      });
      continue;
    }

    // 5. Detect Foreign Currency
    let currency = row.currency || 'INR';
    let exchangeRate = 1.0;
    let originalAmount = amount;
    
    if (currency === 'USD') {
      exchangeRate = EXCHANGE_RATE_USD_TO_INR;
      amount = amount * exchangeRate;
      anomalies.push({
        rowNumber: rowNum,
        rowData: row,
        type: 'FOREIGN_CURRENCY',
        description: `Converted USD to INR at rate of ${EXCHANGE_RATE_USD_TO_INR}`,
        actionTaken: 'NORMALIZED',
      });
    } else if (!row.currency) {
       anomalies.push({
        rowNumber: rowNum,
        rowData: row,
        type: 'MISSING_CURRENCY',
        description: 'Missing currency, assumed INR',
        actionTaken: 'NORMALIZED',
      });
    }

    // 6. Detect Settlement disguised as expense
    // Policy: If split_type is empty and split_with is a single person, it's a settlement
    if (!row.split_type && row.split_with && !row.split_with.includes(';')) {
      const recipientName = row.split_with.trim().toLowerCase();
      const recipient = users.find((u: any) => u.name.toLowerCase() === recipientName);
      if (recipient) {
         processedData.push({
          type: 'SETTLEMENT',
          data: {
            paidById: payer.id,
            paidToId: recipient.id,
            amount,
            date: parseDate(row.date),
            description: row.description
          },
          rowNum
        });
        anomalies.push({
          rowNumber: rowNum,
          rowData: row,
          type: 'SETTLEMENT_DETECTED',
          description: 'Row identified as a settlement rather than an expense',
          actionTaken: 'CONVERTED',
        });
        continue;
      }
    }

    // 7. Detect Duplicates
    const entryKey = `${row.date}|${payer.id}|${amount}|${row.description.toLowerCase()}`;
    if (seenEntries.has(entryKey)) {
      anomalies.push({
        rowNumber: rowNum,
        rowData: row,
        type: 'DUPLICATE_ENTRY',
        description: 'Near-identical entry already processed for this day',
        actionTaken: 'SKIPPED',
      });
      continue;
    }
    seenEntries.add(entryKey);

    // 8. Handle Split types and members
    const splitWithNames = row.split_with ? row.split_with.split(';').map((s: string) => s.trim().toLowerCase()) : [];
    let splitType: SplitType = (row.split_type || 'equal').toUpperCase() as SplitType;
    
    // Validate split type
    if (!['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARE'].includes(splitType)) {
       splitType = 'EQUAL';
    }

    const splitDetails = row.split_details ? row.split_details.split(';').map((s: string) => s.trim()) : [];
    
    // Check for former members in split
    const expenseDate = parseDate(row.date);
    const validSplitMembers = [];
    for (const name of splitWithNames) {
      const user = users.find((u: any) => u.name.toLowerCase() === name);
      if (user) {
        const membership = group.members.find((m: any) => m.userId === user.id);
        if (membership) {
          if (membership.leftAt && expenseDate > membership.leftAt) {
             anomalies.push({
              rowNumber: rowNum,
              rowData: row,
              type: 'FORMER_MEMBER_EXCLUDED',
              description: `${user.name} had moved out by this date.`,
              actionTaken: 'ADJUSTED',
            });
          } else if (membership.joinedAt && expenseDate < membership.joinedAt) {
             anomalies.push({
              rowNumber: rowNum,
              rowData: row,
              type: 'FUTURE_MEMBER_EXCLUDED',
              description: `${user.name} had not joined yet by this date.`,
              actionTaken: 'ADJUSTED',
            });
          } else {
            validSplitMembers.push(user);
          }
        } else {
          // If not in group but mentioned (e.g., "Kabir"), we might want to add them or skip
          validSplitMembers.push(user);
        }
      }
    }

    if (validSplitMembers.length === 0) {
       anomalies.push({
        rowNumber: rowNum,
        rowData: row,
        type: 'NO_VALID_MEMBERS',
        description: 'No valid members found for the split',
        actionTaken: 'SKIPPED',
      });
      continue;
    }

    // Prepare processed expense
    processedData.push({
      type: 'EXPENSE',
      data: {
        paidById: payer.id,
        amount,
        originalAmount,
        originalCurrency: currency,
        exchangeRate,
        description: row.description,
        date: expenseDate,
        splitType,
        notes: row.notes,
        splits: validSplitMembers.map((u: any) => {
           // Basic logic for shareValue from split_details if needed
           let shareValue = null;
           if (splitType !== 'EQUAL') {
              const detail = splitDetails.find((d: any) => d.toLowerCase().startsWith(u.name.toLowerCase()));
              if (detail) {
                const match = detail.match(/[\d.]+/);
                if (match) shareValue = parseFloat(match[0]);
              }
           }
           return { userId: u.id, shareValue };
        })
      },
      rowNum
    });
  }

  return { anomalies, processedData };
};

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return new Date(dateStr);
  
  // Try DD/MM/YYYY
  const dmY = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmY) return new Date(`${dmY[3]}-${dmY[2]}-${dmY[1]}`);
  
  // Try MMM DD (e.g., "Mar 14")
  const mD = dateStr.match(/^([a-zA-Z]{3})\s+(\d{1,2})$/);
  if (mD) {
    const months: Record<string, string> = { 'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12' };
    return new Date(`2026-${months[mD[1]]}-${mD[2].padStart(2, '0')}`);
  }

  return new Date(dateStr); // Fallback
}
