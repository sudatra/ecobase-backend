import { NextFunction, Request, RequestHandler, Response } from "express";
import { authService } from "./auth.service";
import { handleServiceResponse } from "@/common/utils/http.handlers";
import passport from '../../common/middlewares/passportConfig'
import { logger } from "@/server";

class AuthController {
  public register: RequestHandler = async (req: Request, res: Response) => {
    const serviceResponse = await authService.registerUser(req.body);
    handleServiceResponse(serviceResponse, res);
  }

  public login: RequestHandler = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const serviceResponse = await authService.loginUser({ email, password });
    handleServiceResponse(serviceResponse, res);
  }

  public loginWithGoogleOAUTH: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  }

  public googleOAUTHCallback: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("google", async (err: any, user: any, info: any) => {
      if (err || !user) {
          logger.error(err)
          return res.status(400).json({ error: "Google OAuth Login failed" });
      }

      const serviceResponse = await authService.loginWithGoogle(user);
      handleServiceResponse(serviceResponse, res);
    })(req, res, next);
  }
}


export const authController = new AuthController();
