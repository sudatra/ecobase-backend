import express, {type Router} from "express";
import {z} from "zod";
import { authController } from "./auth.controller";

export const authRouter :Router = express.Router();


authRouter.post("/auth/login", authController.login);
authRouter.post("/auth/register", authController.register);