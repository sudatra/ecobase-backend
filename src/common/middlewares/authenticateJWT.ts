import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { prisma } from "../utils/db";
import { generateAccessToken } from "../utils/auth";

export function authenticateJWT(req: Request, res: Response, next: NextFunction): any {
    const token = req.header('Authorization')?.split(' ')[1];
    const refreshToken = req.header('x-refresh-token');

    if(!token) {
        return res.status(401).json({
            message: "User Unauthorized - Access Denied"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET!, async (error, decodedToken) => {
        if(error) {
            if(error.name === 'TokenExpiredError' && refreshToken) {
                try {
                    const decodedRefreshToken = jwt.verify(refreshToken, process.env.JWT_SECRET!) as jwt.JwtPayload;

                    const user = await prisma.user.findFirst({
                        where: { id: String(decodedRefreshToken.userId) }
                    });

                    if(user) {
                        const newAccessToken = generateAccessToken(user);

                        res.setHeader('Authorization', `Bearer ${refreshToken}`);
                        req.user = decodedRefreshToken;

                        next();
                    }
                    else {
                        return res.status(401).json({
                            message: "Invalid Refresh Token - User Not Found"
                        });
                    }
                }
                catch(error) {
                    return res.status(403).json({
                        message: "Invalid Token"
                    });
                }
            }
        }
        else {
            req.user = decodedToken;
            next();
        }
    })
}