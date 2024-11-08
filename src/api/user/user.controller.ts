import { NextFunction, Request, RequestHandler, Response } from "express";
import { userService } from "./user.service";
import { handleServiceResponse } from "@/common/utils/http.handlers";

class UserController {
    public fetchUserDetails: RequestHandler = async (req: Request, res: Response) => {
        const { email } = req.body;

        const serviceResponse = await userService.fetchUserDetails(email);
        handleServiceResponse(serviceResponse, res);
    }
}

export const userController = new UserController();