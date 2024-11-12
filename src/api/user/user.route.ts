import express, { type Router } from "express";
import { userController } from "./user.controller";
import { authenticateJWT } from "@/common/middlewares/authenticateJWT";

export const userRouter: Router = express.Router();

userRouter.get("/user", authenticateJWT, userController.fetchUserDetails);