import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export const connectToDatabase = async () => {
    try {
        await prisma.$connect();
        console.log("Database Connected");
    }
    catch(error) {
        throw error;
    }
}
 
export const disconnectFromDatabase = async () => {
    try {
        await prisma.$disconnect();
        console.log("Database DisConnected");
    }
    catch(error) {
        console.error("Unable to disconnect from Database", error);
    }
}