"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
router.post('/register', authController_1.registerUser);
router.post('/login', authController_1.loginUser);
// protected-route JWT Authorization checking
// router.get('/protected-route', authenticateJWT, (req: Request, res: Response) => {
//     res.json({ message: "You have access to this protected route", user: req.user });
// })
router.get('/google/login', authController_1.loginWithGoogleOAUTH);
router.get('/google/calback', passport_1.default.authenticate("google", { session: false }), authController_1.googleOAUTHCallback);
exports.default = router;
