import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import constant from "../../constant/constant";
import generator from "generate-password";
import jwt from "jsonwebtoken";
import emailHelper from '../../helpers/email';
import emailQueue from '../../jobs/emailJob';



const { user } = new PrismaClient();
const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await user.findMany({
            select: {
                email: true,
                username: true,
                id: true,
                role: true,
                isVerfiied: true,
                isLocked: true
            }
        });
        res.status(200).json({ success: true, data: users })
    } catch (error) {
        console.log({ error })
    }
}

const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const User = await user.delete({
            where: {
                id: parseInt(id)
            }
        })
        if (!User) {
            return res.status(200).json(constant.USER.ACTION_ERROR)
        }
        res.status(200).json({ sucess: true })
    } catch (error) {
        console.log({ error })
    }

}


const lockUserAccountStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const getUser = await user.findUnique({
            where: {
                id: parseInt(id)
            }
        });
        let lock: boolean | undefined = !getUser?.isLocked;
        const findUser = await user.update({
            where: {
                id: parseInt(id)
            },
            data: {
                isLocked: lock
            },
            select: {
                email: true,
                username: true,
                id: true,
                role: true
            }
        });
        if (!findUser) {
            return res.status(200).json(constant.USER.ACTION_ERROR)
        }
        res.status(200).json({ success: true, data: findUser });

    } catch (error) {
        console.log({ error })
    }
}


const updateUserRecord = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { email, username } = req.body;
        const findUser = await user.update({
            where: {
                id: parseInt(id)
            },
            data: {
                email,
                username
            }
        });
        if (!findUser) {
            return res.status(200).json(constant.USER.ACTION_ERROR)
        }
        res.status(200).json({ success: true, data: findUser });
    } catch (error) {
        console.log({ error })
    }
}

const findUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const User = await user.findUnique({
            where: {
                id: parseInt(id)
            },
            select: {
                email: true,
                username: true,
                id: true,
                role: true
            }
        })
        res.status(200).json({ success: true, data: User })
    } catch (error) {
        console.log({ error })
    }
}


const addRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body
        const User = await user.update({
            where: {
                id: parseInt(id)
            },
            data: {
                role
            },
            select: {
                email: true,
                username: true,
                id: true,
                role: true
            }
        });
        if (!User) {
            return res.status(200).json(constant.USER.ACTION_ERROR)
        }
        res.status(200).json({ success: true, data: User });

    } catch (error) {
        console.log({ error })
    }
}

const searchUserByEmailOrUsername = async (req: Request, res: Response) => {
    try {
        const { email, username } = req.body;
        let search: Object = {};
        if (email) {
            search = {
                where: {
                    email
                },
                select: {
                    email: true,
                    username: true,
                    id: true,
                    role: true
                }
            }
        }
        if (username) {
            search = {
                where: {
                    username
                },
                select: {
                    email: true,
                    username: true,
                    id: true,
                    role: true
                }
            }
        }

        const Users = await user.findMany(search)
        res.status(200).json({ success: true, data: Users })
    } catch (error) {
        console.log({ error })

    }
}

const SuperAdminCreateUser = async (req: Request, res: Response) => {
    try {

        const { email } = req.body;
        const emailExist = await user.findUnique({
            where: { email }
        });
        if (emailExist) {
            return res.status(400).json(constant.Auth.EmailError)
        }
       const password = generator.generate({
           length: 10,
           numbers:true,
           symbols:true,
           strict:true
       })
        const newUser = await user.create({
            data: {
                email,
                username:email,
                password,
                role:"ADMIN"
            }
        });
        // send email
        const emailToken = jwt.sign({email }, process.env.EMAIL_TOKEN!)
        const html = `<h3>Hello,${newUser.username}</h3>
           <p>An account with the username:${email} and password${password} has been created for you. After verifying account you are advised to change your password and username Click the link below to verify your email</p>
            <a href ="${req.protocol}://${req.headers.host}/api/v1/auth/verify-email?token=${emailToken}"> verify email </a>`

        const data = emailHelper.emailData(process.env.EMAIL_ADDRESS!, email, constant.EMAIL.EMAIL_SUBJECT, html);

        const emailData = await emailHelper.emailConfirmation(data)
        await emailQueue.add('emailJob', emailData);
        if (newUser) {
            res.status(201).json({ success: true, data: newUser })
        }

    } catch (error) {
        console.log({ error })
    }
}

export default { searchUserByEmailOrUsername, addRole, getAllUsers, deleteUser, lockUserAccountStatus, updateUserRecord, findUser, SuperAdminCreateUser }