import { StatusCodes } from "http-status-codes";
import { User } from "@prisma/client";
import { ServiceResponse } from "@/common/models/service.response";
import { prisma } from "@/common/utils/db";
import { comparePasswords, generateHashedPassword, generateToken } from "@/common/utils/auth";
import { RegisterDTO } from "./dto/register.dto";
import { LoginDTO } from "./dto/login.dto";


class AuthService {
    async registerUser(registerDTO: RegisterDTO): Promise<ServiceResponse<any>> {
        const { email, password } = registerDTO;
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: email },
            });

            if (existingUser) {
                return ServiceResponse.failure("User Already Exists!!", null, StatusCodes.BAD_REQUEST)
            }

            const hashedPassword = await generateHashedPassword(password as string);
            const newUser = await prisma.user.create({
                data: {
                    ...registerDTO,
                    email: email,
                    password: hashedPassword,
                },
            });

            return ServiceResponse.success("User registered successfully!!", newUser, StatusCodes.CREATED)
        } catch (error) {
            return ServiceResponse.failure(
                "An error occurred while registering users.",
                null,
                StatusCodes.INTERNAL_SERVER_ERROR,
            );
        }
    }



    async loginUser(loginDTO: LoginDTO): Promise<ServiceResponse<any>> {
        const { email, password } = loginDTO;
        
        try {
            const user = await prisma.user.findUnique({
                where: { email: email },
            });

            if (!user) {
                return ServiceResponse.failure("Invalid credentials - Email", null, StatusCodes.BAD_REQUEST);
            }

            const isPasswordValid = await comparePasswords(password, user.password as string);
            if (!isPasswordValid) {
                return ServiceResponse.failure("Invalid credentials - Password", null, StatusCodes.BAD_REQUEST);
            }

            const token = generateToken(user);
            return ServiceResponse.success("Logged In Successfully", { token: token }, StatusCodes.ACCEPTED)
        } catch (error) {
            return ServiceResponse.failure("Login failed", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const authService = new AuthService();