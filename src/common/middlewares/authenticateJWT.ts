import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

export function authenticateJWT(req: Request, res: Response, next: NextFunction): any {
    const token = req.header('Authorization')?.split(' ')[1]

    if(!token) {
        return res.status(401).json({
            message: "Access Denied"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET!, (error, decoded) => {
        if(error) {
            return res.status(403).json({
                message: "Invalid Token"
            });
        }

        req.user = decoded;
        next();
    })
}