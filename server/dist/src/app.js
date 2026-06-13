"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const settlementRoutes_1 = __importDefault(require("./routes/settlementRoutes"));
const importRoutes_1 = __importDefault(require("./routes/importRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*'
}));
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/groups', groupRoutes_1.default);
app.use('/api/expenses', expenseRoutes_1.default);
app.use('/api/settlements', settlementRoutes_1.default);
app.use('/api/imports', importRoutes_1.default);
exports.default = app;
