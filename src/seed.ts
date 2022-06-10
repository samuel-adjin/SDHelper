import { PrismaClient } from "@prisma/client";
import dotenv from 'dotenv';
import bcrypt from "bcrypt"

dotenv.config();
const prisma = new PrismaClient();
const seedSuperAdmin = async () => {
    try {
        const Super_admin_email = await prisma.user.findFirst({
            where: {
                email: process.env.SUPER_ADMIN_EMAIL
            }
        });
        if (Super_admin_email) {
            return null;
        }
        const password = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD!,10);
        await prisma.user.create({
            data: {
                email: process.env.SUPER_ADMIN_EMAIL!,
                username: process.env.SUPER_ADMIN_USERNAME!,
                password: password,
                role: "SUPER_ADMIN",
                isVerfiied: true
            }
        });
        console.log(process.env.SUPER_ADMIN_PASSWORD +" "+ process.env.SUPER_ADMIN_USERNAME + " " +  process.env.SUPER_ADMIN_EMAIL)
    } catch (error) {
        console.log({ error })
    }
}

seedSuperAdmin()
    .catch((e) => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })