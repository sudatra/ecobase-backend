import { StatusCodes } from "http-status-codes";
import { User } from "@prisma/client";
import { ServiceResponse } from "@/common/models/service.response";
import { prisma } from "@/common/utils/db";
import { comparePasswords, generateHashedPassword, generateToken } from "@/common/utils/auth";
import { RegisterDTO } from "./dto/register.dto";
import { LoginDTO } from "./dto/login.dto";
import { logger } from "@/server";
import { userService } from "../user/user.service";


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
            const userReferrerId = registerDTO?.referrerId;
            let newUser: any;

            const existingHierarchy = await prisma.hierarchy.findFirst();

            if(!existingHierarchy) {
                newUser = await prisma.user.create({
                    data: {
                        ...registerDTO,
                        email: email,
                        password: hashedPassword,
                    },
                });

                await prisma.slabInfo.create({
                    data: {
                        userId: newUser.id,
                        slabNumber: 1,
                        repurchaseLevel: 1,
                        level: 1
                    }
                });
                
                await prisma.hierarchy.create({
                    data: {
                        userId: newUser.id,
                        parentId: null,
                        slabNumber: 1,
                        siblings: [],
                        order: 1
                    }
                });

                return ServiceResponse.success("root User registered successfully and Heirarchy created!!", newUser, StatusCodes.CREATED)
            }

            newUser = await prisma.user.create({
                data: {
                    ...registerDTO,
                    email: email,
                    password: hashedPassword,
                },
            });
            
            if(userReferrerId && userReferrerId !== null) {
                const referrer = await prisma.user.findFirst({
                    where: { id: userReferrerId }
                });

                if(referrer) {
                    const updatedDirectJoinees = [...referrer.directJoinees, newUser.id];
                    await prisma.user.update({
                        where: { id: userReferrerId },
                        data: { directJoinees: updatedDirectJoinees }
                    })
                }
            }

            const hierarchy = await userService.addUserHierarchy(newUser, userReferrerId);

            return ServiceResponse.success("User registered successfully and hierarchy created!!", newUser, StatusCodes.CREATED)
        }
        catch (error) {
            const errorMessage = `Error registering user: $${(error as Error).message}`;
            logger.error(errorMessage);
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
        } catch (ex) {
            const errorMessage = `Error logging in user: $${(ex as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure("Login failed", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async loginWithGoogle(user: any): Promise<ServiceResponse<any>> {
        try {
            const { user: userInfo, token } = user;
            return ServiceResponse.success("Google login successfull", { user: userInfo, token }, StatusCodes.ACCEPTED);
        }
        catch (error) {
            const errorMessage = `Error during Google OAuth login: ${(error as Error).message}`;
            logger.error(errorMessage);
            return ServiceResponse.failure("Google OAuth Login failed", null, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

export const authService = new AuthService();