import { NextFunction, Request, Response } from "express";
import { prisma } from "../common/utils/db";
import {
  generateHashedPassword,
  comparePasswords,
  generateToken,
} from "../common/utils/auth";
import passport from "passport";

export const registerUser = async (req:Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists!!",
      });
    }

    const hashedPassword = await generateHashedPassword(password);
    const newUser = await prisma.user.create({
      data: {
        ...req.body,
        email: email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "User registered successfully!!",
      user: newUser,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to register user!!",
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials - Email" });
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials - Password" });
    }

    const token = generateToken(user);
    console.log("login token generated: ", token)
    return res.json({ token: token });
  } catch (error) {
    return res.status(500).json({
      error: "Login failed",
    });
  }
};

export const loginWithGoogleOAUTH = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })(req, res, next);
};

export const googleOAUTHCallback = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user as { user: any, token: string };
    return res.json({ user: user.user, token: user.token });
  }
  catch(error) {
    return res.status(400).json({ error: "Google OAuth Login failed" });
  }
}
