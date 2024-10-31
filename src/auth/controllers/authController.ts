import { Request, Response } from "express";
import { prisma } from "../../utils/db";
import {
  generateHashedPassword,
  comparePasswords,
  generateToken,
} from "../../utils/auth";

export const registerUser = async (
  req:Request,
  res: Response
): Promise<any> => {
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

export const loginUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user || !comparePasswords(password, user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user);
    return res.json({ token: token });
  } catch (error) {
    return res.status(500).json({
      error: "Login failed",
    });
  }
};
