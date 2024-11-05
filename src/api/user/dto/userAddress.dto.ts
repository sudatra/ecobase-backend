import { z } from "zod";

export const userAddressSchema = z.object({
    street: z.string().min(1, { message: "Street is required" }),
    locality: z.string().min(1, { message: "Locality is required" }),
    city: z.string().min(1, { message: "City is required" }),
    district: z.string().min(1, { message: "District is required" }),
    pincode: z.string().length(6, { message: "Pincode must be 6 digits" }),
    state: z.string().min(1, { message: "State is required" }),
    country: z.string().min(1, { message: "Country is required" }),
    userId: z.string().uuid({ message: "User ID must be a valid UUID" }),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    isActive: z.boolean().default(true).optional(),
});

export type UserAddressDTO = z.infer<typeof userAddressSchema>;