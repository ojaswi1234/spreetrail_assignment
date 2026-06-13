"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImportReport = exports.executeImport = exports.analyzeImport = void 0;
const importService_1 = require("../services/importService");
const prisma_1 = __importDefault(require("../utils/prisma"));
const analyzeImport = async (req, res) => {
    try {
        const { groupId } = req.body;
        if (!req.file)
            return res.status(400).json({ message: 'No file uploaded' });
        const result = await (0, importService_1.analyzeCSVData)(req.file.buffer, groupId);
        // Create an ImportLog to track this draft
        const importLog = await prisma_1.default.importLog.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error analyzing CSV', error: error.message });
    }
};
exports.analyzeImport = analyzeImport;
const executeImport = async (req, res) => {
    try {
        const { importLogId, groupId, processedData } = req.body;
        // Use a transaction to ensure all or nothing
        await prisma_1.default.$transaction(async (tx) => {
            for (const item of processedData) {
                if (item.type === 'EXPENSE') {
                    const { amount, splits, date, ...rest } = item.data;
                    // Calculate owedAmount here again to be safe
                    let processedSplits = [];
                    if (rest.splitType === 'EQUAL') {
                        const perPerson = amount / splits.length;
                        processedSplits = splits.map((s) => ({
                            userId: s.userId,
                            owedAmount: parseFloat(perPerson.toFixed(2)),
                            shareValue: null
                        }));
                    }
                    else if (rest.splitType === 'EXACT') {
                        processedSplits = splits.map((s) => ({
                            userId: s.userId,
                            owedAmount: s.shareValue,
                            shareValue: s.shareValue
                        }));
                    }
                    else if (rest.splitType === 'PERCENTAGE') {
                        processedSplits = splits.map((s) => ({
                            userId: s.userId,
                            owedAmount: parseFloat(((s.shareValue / 100) * amount).toFixed(2)),
                            shareValue: s.shareValue
                        }));
                    }
                    else if (rest.splitType === 'SHARE') {
                        const totalShares = splits.reduce((acc, s) => acc + s.shareValue, 0);
                        processedSplits = splits.map((s) => ({
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
                }
                else if (item.type === 'SETTLEMENT') {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error executing import', error: error.message });
    }
};
exports.executeImport = executeImport;
const getImportReport = async (req, res) => {
    try {
        const id = req.params.id;
        const log = await prisma_1.default.importLog.findUnique({
            where: { id },
            include: { anomalies: true }
        });
        res.json(log);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching import report', error });
    }
};
exports.getImportReport = getImportReport;
