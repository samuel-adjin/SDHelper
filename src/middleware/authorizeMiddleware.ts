import e, {NextFunction, Request,Response} from "express";
import { PrismaClient } from "@prisma/client";
import constant from "constant/constant";


const {user} = new PrismaClient();

const checkRole = async(role:string[]|string,req:Request,res:Response,next:NextFunction)=>{
    try {
        let isArray:Boolean = Array.isArray(role);
              
        const userId:number|undefined = req.user?.userId;
        const findUser = await user.findUnique({
            where:{
                id:userId
            }
        });
        if(!isArray && role ===findUser?.role!){
           return next();
        }
        if(isArray && !role.includes(findUser?.role!)){
           return  next();
        }
        return res.status(401).json({success:false,msg:"Invalid user"})
       
    } catch (error) {
        console.log({error})
    }
}


export default {checkRole}