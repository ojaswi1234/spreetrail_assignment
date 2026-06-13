import { Request, Response } from 'express';
import { analyzeCSVData } from '../services/importService';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const analyzeImport = async (req: AuthRequest, res: Response) => {
  try {
    const { groupId } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await analyzeCSVData(req.file.buffer, groupId);
    
    // Create an ImportLog to track this draft
    const importLog = await prisma.importLog.create({
      data: {
        fileName: req.file.originalname,
        status: 'DRAFT',
        anomalies: {
          create: result.anomalies.map(a => ({
            rowNumber: a.rowNumber,
            rowData: JSON.stringify(a.rowData),
            anomalyType: a.type,
            description: a.description,
            actionTaken: a.actionTaken
          }))
        }
      },
      include: { anomalies: true }
    });

    res.json({ importLogId: importLog.id, ...result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error analyzing CSV', error: error.message });
  }
};

export const executeImport = async (req: AuthRequest, res: Response) => {
  try {
    const { importLogId, groupId, processedData } = req.body;

    // Use a transaction to ensure all or nothing
    await prisma.$transaction(async (tx: any) => {
      for (const item of processedData) {
        if (item.type === 'EXPENSE') {
          const { amount, splits, date, ...rest } = item.data;
          
          // Calculate owedAmount here again to be safe
          let processedSplits = [];
          if (rest.splitType === 'EQUAL') {
            const perPerson = amount / splits.length;
            processedSplits = splits.map((s: any) => ({
              userId: s.userId,
              owedAmount: parseFloat(perPerson.toFixed(2)),
              shareValue: null
            }));
          } else if (rest.splitType === 'EXACT') {
             processedSplits = splits.map((s: any) => ({
              userId: s.userId,
              owedAmount: s.shareValue,
              shareValue: s.shareValue
            }));
          } else if (rest.splitType === 'PERCENTAGE') {
             processedSplits = splits.map((s: any) => ({
              userId: s.userId,
              owedAmount: parseFloat(((s.shareValue / 100) * amount).toFixed(2)),
              shareValue: s.shareValue
            }));
          } else if (rest.splitType === 'SHARE') {
            const totalShares = splits.reduce((acc: number, s: any) => acc + s.shareValue, 0);
             processedSplits = splits.map((s: any) => ({
              userId: s.userId,
              owedAmount: parseFloat(((s.shareValue / totalShares) * amount).toFixed(2)),
              shareValue: s.shareValue
            }));
          }

          await tx.expense.create({
            data: {
              ...rest,
              amount,
              date: new Date(date),
              groupId,
              splits: { create: processedSplits }
            }
          });
        } else if (item.type === 'SETTLEMENT') {
          const { date, ...rest } = item.data;
          await tx.settlement.create({
            data: {
              ...rest,
              date: new Date(date),
              groupId
            }
          });
        }
      }

      await tx.importLog.update({
        where: { id: importLogId },
        data: { status: 'COMPLETED' }
      });
    });

    res.json({ message: 'Import successful' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: 'Error executing import', error: error.message });
  }
};

export const getImportReport = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const log = await prisma.importLog.findUnique({
      where: { id },
      include: { anomalies: true }
    });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching import report', error });
  }
};
