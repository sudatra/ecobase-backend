import { NextFunction, Request, RequestHandler, Response } from "express";
import { prisma } from "../../common/utils/db";
import {
  generateHashedPassword,
  comparePasswords,
  generateToken,
} from "../../common/utils/auth";
import passport from "passport";
import { authService } from "./auth.service";
import { handleServiceResponse } from "@/common/utils/http.handlers";


class AuthController {
  public register: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await authService.registerUser(req.body);
    handleServiceResponse(serviceResponse, res);
  }
  public login: RequestHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const serviceResponse = await authService.loginUser(email, password);
    handleServiceResponse(serviceResponse, res);
  }
}


export const authController = new AuthController();


// export const loginWithGoogleOAUTH = (req: Request, res: Response, next: NextFunction) => {
//   passport.authenticate("google", {
//     scope: ["profile", "email"]
//   })(req, res, next);
// };

// export const googleOAUTHCallback = async (req: Request, res: Response): Promise<any> => {
//   try {
//     const user = req.user as { user: any, token: string };
//     return res.json({ user: user.user, token: user.token });
//   }
//   catch (error) {
//     return res.status(400).json({ error: "Google OAuth Login failed" });
//   }
// }
