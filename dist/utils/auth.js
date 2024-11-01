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
exports.comparePasswords = exports.generateHashedPassword = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_secret = process.env.JWT_SECRET || 'jwt_secret';
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ userId: user.id }, jwt_secret, { expiresIn: '1h' });
};
exports.generateToken = generateToken;
const generateHashedPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const saltKey = yield bcryptjs_1.default.genSalt(10);
    return yield bcryptjs_1.default.hash(password, saltKey);
});
exports.generateHashedPassword = generateHashedPassword;
const comparePasswords = (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcryptjs_1.default.compare(password, hashedPassword);
});
exports.comparePasswords = comparePasswords;
