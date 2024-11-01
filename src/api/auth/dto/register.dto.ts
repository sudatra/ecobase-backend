import { z } from "zod";

export const RegisterSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters long" }).optional(),
    referrerId: z.string().uuid().optional(),
    aadharNumber: z.string().optional(),
    panNumber: z.string().optional(),
    aadharImageLink: z.string().url().optional(),
    panImageLink: z.string().url().optional(),
    isMembershipActive: z.boolean().optional(),
    isActive: z.boolean().optional()
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;