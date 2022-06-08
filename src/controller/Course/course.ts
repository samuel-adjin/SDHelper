import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import constant from "../../constant/constant";
import fileUpload from "../../helpers/upload";
import path from "path";


const { course } = new PrismaClient();

const createCourse = async (req: Request, res: Response) => {
    try {
        
        let docfile: string;
        //upload file with course details
        const courseDoc = fileUpload.upload.single("doc");
        courseDoc(req, res, async (err: any) => {
            if (err) {
                throw err;
            }
            if (req.file === undefined) {
                return res.status(400).json("No file selected");
            } else {
                const { name,programId } = req.body;
                docfile = req.file.path;
                const courses = await course.create({
                    data: {
                        name,
                        programId:parseInt(programId),
                        docfile
                    }
                });
                res.status(201).json({ success: true, data: courses })

            }
        })


    } catch (error) {
        console.log({ error })
    }
}

const getAllCourse = async (req: Request, res: Response) => {
    try {
        const perPage = parseInt((req.query.limit as string), 10) || 2;
        let pageNumber = parseInt((req.query.pageNumber as string), 10) || 1;
        //pageNumber = (pageNumber-1)*perPage 
        let offset: number = Math.abs((pageNumber - 1) * perPage);
        const courses = await course.findMany({
            
            orderBy: {
                name: 'asc',
            },
            skip: offset,
            take: perPage,
        });
        const pageInfo =
        {
            // hasNextPage: allPrograms.length,
            pageNumber: pageNumber,
            courses
        }
        res.status(200).json({ success: true, data: pageInfo })
    } catch (error) {
        console.log({ error })
    }
}

const getACourse = async (req: Request, res: Response) => {
    try {
        const { id: couserId } = req.params;
        const getCourse = await course.findUnique({
            where: {
                id: parseInt(couserId)
            }
        });
        if (!getCourse) {
            return res.status(400).json(constant.COURSE.NOT_FOUND);
        }
        res.status(200).json({ success: true, data: getCourse })
    } catch (error) {
        console.log({ error })
    }
}

const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { id: courseId } = req.params;
        const getCourse = await course.findUnique({ where: { id: parseInt(courseId) } })
        fileUpload.deleteFile(getCourse?.docfile!)
        const Course = await course.delete({
            where: {
                id: parseInt(courseId)
            }
        })
        if (!Course) {
            return res.status(400).json(constant.USER.ACTION_ERROR);
        }
        res.status(200).json({ success: true, data: Course });

    } catch (error) {
        console.log({ error })
    }
}


const SearchCourseByName = async (req: Request, res: Response) => {
    try {
        const perPage = parseInt((req.query.limit as string), 10) || 2;
        let pageNumber = parseInt((req.query.pageNumber as string), 10) || 1;
        //pageNumber = (pageNumber-1)*perPage 
        let offset: number = Math.abs((pageNumber - 1) * perPage);        
        const { name } = req.body;
        const courses = await course.findMany({
            take: perPage,
            skip: offset,
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                }
            }
        });
        const pageInfo =
        {
            // hasNextPage: allPrograms.length,
            pageNumber: pageNumber,
            courses
        }
        res.status(200).json({ success: true, data: pageInfo })
    } catch (error) {
        console.log({ error })
    }
}

const UpdateCourse = async (req: Request, res: Response) => {
    try {
        const { id: courseId } = req.params;
        const { name } = req.body;
        const Course = await course.update({
            where: {
                id: parseInt(courseId)
            },
            data: {
                name
            }
        })
        if (!Course) {
            return res.status(400).json(constant.USER.ACTION_ERROR)
        }
        res.status(200).json({ success: true, data: Course });
    } catch (error) {

    }
}


const changeUploadedDoc = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;
        let docfile: string;
        const getCourse = await course.findUnique({ where: { id: parseInt(id) } })
        const courseDoc = fileUpload.upload.single("doc");

        courseDoc(req, res, async (err: any) => {
            if (err) {
                throw err;
            }
            if (req.file === undefined) {
                return res.status(400).json("No file selected");
            } else {
                docfile = req.file.path;
                fileUpload.deleteFile(getCourse?.docfile!)
                const Course = await course.update({
                    where: { id: parseInt(id) },
                    data: {
                        docfile
                    }
                });
                res.status(201).json({ success: true, data: Course })
            }
        })
    
    } catch (error) {
        console.log({error})
    }
}


const downloadFile = async(req:Request,res:Response)=>{
    try {
        
        const{id:courseId} =req.params;
        const findCourse = await course.findUnique({
            where:{id:parseInt(courseId)}
        })
        const filePath = findCourse?.docfile!;
        res.download(filePath)
    } catch (error) {
        console.log({error})
    }
}


    export default {
         SearchCourseByName, 
         deleteCourse, 
         getACourse, 
         getAllCourse, 
         UpdateCourse, 
         createCourse,
         changeUploadedDoc,
         downloadFile
        }