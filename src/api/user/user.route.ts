import express, { type Router } from "express";
import { userController } from "./user.controller";

export const userRouter: Router = express.Router();

userRouter.get("/user", userController.fetchUserDetails);