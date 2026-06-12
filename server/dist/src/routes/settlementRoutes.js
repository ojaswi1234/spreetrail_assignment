"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settlementController_1 = require("../controllers/settlementController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authMiddleware);
router.post('/', settlementController_1.recordSettlement);
router.get('/group/:groupId/balances', settlementController_1.getBalances);
exports.default = router;
//# sourceMappingURL=settlementRoutes.js.map