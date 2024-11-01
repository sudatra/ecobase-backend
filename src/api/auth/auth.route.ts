import express, {type Router} from "express";
import {z} from "zod";
import { authController } from "./auth.controller";

export const authRouter :Router = express.Router();


authRouter.post("/login", authController.login);
authRouter.post("/register", authController.register);