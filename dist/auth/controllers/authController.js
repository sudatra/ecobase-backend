"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleOAUTHCallback = exports.loginWithGoogleOAUTH = exports.loginUser = exports.registerUser = void 0;
const db_1 = require("../../utils/db");
const auth_1 = require("../../utils/auth");
const passport_1 = __importDefault(require("passport"));
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const existingUser = yield db_1.prisma.user.findUnique({
            where: { email: email },
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists!!",
            });
        }
        const hashedPassword = yield (0, auth_1.generateHashedPassword)(password);
        const newUser = yield db_1.prisma.user.create({
            data: Object.assign(Object.assign({}, req.body), { email: email, password: hashedPassword }),
        });
        return res.status(201).json({
            message: "User registered successfully!!",
            user: newUser,
        });
    }
    catch (error) {
        return res.status(500).json({
            error: "Failed to register user!!",
        });
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield db_1.prisma.user.findUnique({
            where: { email: email },
        });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials - Email" });
        }
        const isPasswordValid = yield (0, auth_1.comparePasswords)(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials - Password" });
        }
        const token = (0, auth_1.generateToken)(user);
        console.log("login token generated: ", token);
        return res.json({ token: token });
    }
    catch (error) {
        return res.status(500).json({
            error: "Login failed",
        });
    }
});
exports.loginUser = loginUser;
const loginWithGoogleOAUTH = (req, res, next) => {
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"]
    })(req, res, next);
};
exports.loginWithGoogleOAUTH = loginWithGoogleOAUTH;
const googleOAUTHCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        return res.json({ user: user.user, token: user.token });
    }
    catch (error) {
        return res.status(400).json({ error: "Google OAuth Login failed" });
    }
});
exports.googleOAUTHCallback = googleOAUTHCallback;
