import { Request, Response } from "express";
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import constant from "../../constant/constant";
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
import emailHelper from '../../helpers/email';
import emailQueue from '../../jobs/emailJob';
import jwtHelper from '../../helpers/jwt';
dotenv.config();


const { user } = new PrismaClient();
const register = async (req: Request, res: Response) => {
    try {
        const { username, email, plainPassword, confirmPassword } = req.body;
        const emailExist = await user.findUnique({
            where: { email }
        });
        if (emailExist) {
            return res.status(400).json(constant.Auth.EmailError)
        }
        if (plainPassword !== confirmPassword) {
            return res.status(400).json(constant.Auth.passwordMatchError);
        }
        const usernameExist = await user.findUnique({
            where: {
                username
            }
        });
        if (usernameExist) {
            return res.status(400).json(constant.Auth.UsernameError)
        }
        const password = await bcrypt.hash(plainPassword, 10);
        const newUser = await user.create({
            data: {
                email,
                username,
                password
            }
        });
        // send email
        const emailToken = jwt.sign({ username, email }, process.env.EMAIL_TOKEN!)
        const html = `<h3>Hello,${newUser.username}</h3>
           <p>Thanks for signing up with farad, Click the link below to verify your email</p>
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

const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const existingUser = await user.findUnique({
            where: {
                username
            }
        })
        if (!existingUser) {
            return res.status(400).json(constant.Auth.IncorrectCredential)
        }
        const verifyPassword = await bcrypt.compare(password, existingUser?.password);
        if (!verifyPassword) {
            return res.status(400).json(constant.Auth.IncorrectCredential)
        }

        if (!existingUser.isVerfiied) {
            return res.status(400).json(constant.Auth.emailNotVerified)
        }

        if (existingUser.isLocked) {
            return res.status(400).json(constant.Auth.accountLocked)
        }
        //Generate Jwt Tokens

        const userData: Object = { username, userId: existingUser.id, email: existingUser.email, role: existingUser.role };
        const access_token = jwtHelper.generateJwt(userData, process.env.ACCESS_TOKEN!, `${process.env.ACCESS_EXPIRES}s`);
        const refresh_token = jwtHelper.generateJwt(userData, process.env.REFRESH_TOKEN!, `${process.env.REFRESH_EXPIRES}d`)
        res.status(200).json({ success: true, data: { access_token, refresh_token } });
    } catch (error) {
        console.log({ error })
    }
}

// verify email
const verifyEmail = async (req: Request, res: Response) => {
    {
        try {
            const { token } = req.query;
            // res.json({token})
            if (typeof token != 'string') {
                return res.status(400).json(constant.Auth.InvalidLink)
            }

            const decodedToken = jwt.verify(token, process.env.EMAIL_TOKEN!);

            if (!decodedToken) {
                return res.status(400).json(constant.Auth.InvalidLink)
            }
            const { email } = decodedToken as JwtPayload;
            const existingUser = await user.findUnique({
                where: {
                    email
                }
            });
            if (!existingUser) {
                return res.status(400).json(constant.Auth.UserNotFound)
            }
            const verifyUserEmail = await user.update({
                where: { email },
                data: {
                    isVerfiied: true
                }
            })

            if (verifyUserEmail) {
                return res.status(200).json({ success: true, msg: constant.Auth.EmailVerified })
            }

        } catch (error) {
            console.log({ error });

        }
    }
}
//ResetLink
const resetLink = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const getUser = await user.findUnique({
            where: { email }
        });
        if (!email) {
            return res.status(400).json(constant.Auth.InvalidEmail)
        }
        const resetLink = jwt.sign({ email }, process.env.RESET_LINK!);
        //send email with reset Link
        const html = `<h3>Hello,${getUser?.username}</h3>
        <p>You have requested to reset your password, Click the link below to reset your password</p>
         <a href ="${req.protocol}://${req.headers.host}/api/v1/auth/reset-password?token=${resetLink}"> verify email </a>`
        const data = emailHelper.emailData(process.env.EMAIL_ADDRESS!, email, constant.EMAIL.PASSWORD_RESET, html);
        const emailData = await emailHelper.emailConfirmation(data)
        emailQueue.add('emailJob', emailData);
        res.status(200).json({ success: true, msg: constant.EMAIL.RESET_SUCCESS })
    } catch (error) {
        console.log({ error })
    }
}


//password reset
const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;
        const { plainPassword, confirmPassword } = req.body;
        if (typeof token != 'string') {
            return res.status(400).json(constant.Auth.InvalidLink)
        }
        const decodedLink = jwt.verify(token, process.env.RESET_LINK!)
        const { email } = decodedLink as jwt.JwtPayload
        const userExist = await user.findUnique({ where: { email } });
        if (!email) {
            return res.status(400).json(constant.Auth.UserNotFound)
        }

        if (plainPassword !== confirmPassword) {
            return res.status(400).json(constant.Auth.passwordMatchError);
        }
        const password = await bcrypt.hash(plainPassword, 10);
        const User = await user.update({
            where: { email },
            data: {
                password
            }
        });
        res.status(200).json({ success: true, msg: constant.Auth.PasswordResetSuccess })
    } catch (error) {
        console.log({ error });

    }

}

//generate tokens using refresh token
const token = async (req: Request, res: Response) => {
    try {
        const id = req.user?.userId;
        const findUser = await user.findUnique({
            where: {
                id
            }
        });
        if (!user) {
            return res.status(400).json({ success: false, msg: constant.Auth.INVALIDUSER })
        }

        const userData: Object = { email: findUser?.email, role: findUser?.role, userId: findUser?.id, username: findUser?.username };
        const access_token = jwtHelper.generateJwt(userData, process.env.ACCESS_TOKEN!, `${process.env.ACCESS_EXPIRES}s`);
        const refresh_token = jwtHelper.generateJwt(userData, process.env.REFRESH_TOKEN!, `${process.env.REFRESH_EXPIRES}d`)
        res.status(200).json({ success: true, data: { access_token, refresh_token } });
    } catch (error) {
        console.log({ error });
    }
}

export default { register, login, verifyEmail, resetLink, resetPassword, token }