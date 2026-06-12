"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const settlementRoutes_1 = __importDefault(require("./routes/settlementRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*', // For development, allow all origins
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Socket.io logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('join-expense', (expenseId) => {
        socket.join(expenseId);
        console.log(`User joined expense chat: ${expenseId}`);
    });
    socket.on('send-message', (data) => {
        // data: { expenseId, userId, message, userName }
        io.to(data.expenseId).emit('new-message', data);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/groups', groupRoutes_1.default);
app.use('/api/expenses', expenseRoutes_1.default);
app.use('/api/settlements', settlementRoutes_1.default);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map