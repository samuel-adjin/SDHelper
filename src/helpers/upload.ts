import {Request,Response} from 'express'
import { FileFilterCallback } from 'multer';
import multer from 'multer';
import path from 'path';
import fs from "fs"

const storage = multer.diskStorage({
    // destination: (req:Request,file:Express.Multer.File,cb:any)=>{
    //     cb(null,"src/uploads")
    // },
    destination: 'src/uploads',
    filename: (req:Request,file:Express.Multer.File,cb:any)=>{
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null,file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const checkFile = (file:Express.Multer.File,cb:any)=>{
    const filetypes = /jpeg|jpg|png|gif|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if(extname && mimetype){
        return cb(null,true)
    }else{
        return cb("Error: Only images are allowed",false)
    }

}


const upload = multer({
    storage, 
    fileFilter:function(req:Request,file:Express.Multer.File,cb:any)
    {
    checkFile(file,cb)
    }
});

const deleteFile = (filePath:string)=>{
    fs.unlink(filePath,(err: any)=>{
        if(err){
            throw err;
        }
    })
}


export default {upload,deleteFile}