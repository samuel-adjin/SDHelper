import { Request,Response,NextFunction } from "express";
import constant from "../constant/constant";
import auth from "../controller/Auth/auth";
import jwt from "jsonwebtoken";

const verifyToken = async (req:Request,res:Response,next:NextFunction)=>{
    try {
        const authHeader = req.headers.authorization;
        if(typeof authHeader !== 'string' || authHeader === ''|| !authHeader.startsWith('Bearer ')|| !authHeader){
            return res.status(400).json(constant.TOKEN.INVALID_TOKEN)
        }
        const acessToken = authHeader.split(' ')[1];
        const verifyToken = jwt.verify(acessToken,process.env.ACCESS_TOKEN!);
        if(!verifyToken){
            return res.status(400).json(constant.TOKEN.EXPIRED_TOKEN)
        }
        const{username,role,email,userId} = verifyToken as jwt.JwtPayload;
        req.user ={username,role,userId,email};
        next();
    } catch (error) {
        console.log({error})
    }
}

const verifyRefreshToken = async (req:Request,res:Response,next:NextFunction)=>{
        try {
            const refreshToken = req.headers['X-HEADER-TOKEN'];
            if(!refreshToken || typeof refreshToken !== 'string' || refreshToken === ''){
                return res.status(400).json(constant.TOKEN.INVALID_TOKEN)
            }
            const verifyToken = jwt.verify(refreshToken,process.env.REFRESH_TOKEN!);
        if(!verifyToken){
            return res.status(400).json(constant.TOKEN.EXPIRED_TOKEN)
        }
        const{username,role,email,userId} = verifyToken as jwt.JwtPayload;
        req.user ={username,role,userId,email};
        next();
        } catch (error) {
            
        }
}


export default {verifyRefreshToken,verifyToken}