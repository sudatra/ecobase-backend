import jwt from "jsonwebtoken";
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client'

const jwt_secret = process.env.JWT_SECRET || 'jwt_secret';

export const generateAccessToken = (user: User) => {
    return jwt.sign(
        { userId: user.id },
        jwt_secret,
        { expiresIn: '3h' }
    )
};

export const generateRefreshToken = (user: User) => {
    return jwt.sign(
        { userId: user.id },
        jwt_secret,
        { expiresIn: '7d' }
    );
}

export const generateHashedPassword = async (password: string) => {
    const saltKey = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, saltKey);
};

export const comparePasswords = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
}