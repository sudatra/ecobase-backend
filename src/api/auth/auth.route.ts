import express, { type Router } from "express";
import { authController } from "./auth.controller";

export const authRouter: Router = express.Router();

authRouter.post("/login", authController.login);
authRouter.post("/register", authController.register);
authRouter.get("/google", authController.loginWithGoogleOAUTH);
authRouter.get("/google/callback", authController.googleOAUTHCallback)