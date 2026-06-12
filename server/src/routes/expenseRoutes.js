"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenseController_1 = require("../controllers/expenseController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.post('/', expenseController_1.createExpense);
router.get('/group/:groupId', expenseController_1.getGroupExpenses);
router.get('/:expenseId/chat', expenseController_1.getExpenseChat);
router.post('/:expenseId/chat', expenseController_1.postChatMessage);
exports.default = router;
//# sourceMappingURL=expenseRoutes.js.map