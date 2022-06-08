import { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import constant from '../../constant/constant';

const { program } = new PrismaClient();

//create a program
const AddNewProgram = async (req: Request, res: Response) => {
    try {
        const { title } = req.body;
        const titleCheck = await program.findUnique({
            where: { title }
        });
        if (titleCheck) {
            return res.status(400).json(constant.Program.TITLE)
        }

        const newProgram = await program.create({
            data: {
                title
            }
        })
        res.status(201).json({ success: true, data: newProgram })
    } catch (error) {
        console.log({ error })
    }
}
//get all programs
const showAllPrograms = async (req: Request, res: Response) => {
    try {
        const perPage = parseInt((req.query.limit as string), 10) || 2;
        let pageNumber = parseInt((req.query.pageNumber as string), 10) || 1;
        //pageNumber = (pageNumber-1)*perPage 
        let offset: number = Math.abs((pageNumber - 1) * perPage);
        const allPrograms = await program.findMany({

            orderBy: {
                title: 'asc',
            },
            skip: offset,
            take: perPage,
        });
        if (allPrograms.length < 0) {
            res.status(200).json({ sucess: true, msg: constant.Program.NOTHING_TO_SHOW })
        }

        const pageInfo =
        {
            // hasNextPage: allPrograms.length,
            pageNumber: pageNumber,
            allPrograms
        }
        res.status(200).json({ sucess: true, data: pageInfo })
    } catch (error) {

    }
}
// get a program with all the courses under it
const getProgram = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const getProgram = await program.findUnique({
            where: {
                id: parseInt(id)
            },
            include: { course: true }
        })
        res.status(200).json({ success: true, data: getProgram })
    } catch (error) {
        console.log({ error })
    }
}
// delete a program
const deleteProgram = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const removeProgram = await program.delete({
            where: {
                id: parseInt(id)
            }
        });
        if (!removeProgram) {
            return res.status(200).json(constant.Program.ERROR)
        }
        res.status(200).json({ success: true })
    } catch (error) {
        console.log({ error })
    }
}
// update a program
const updateProgram = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title } = req.body;
        const isExisting = await program.findFirst({
            where: { title }
        })
        if (isExisting) {
            return res.status(400).json(constant.Program.TITLE)
        }
        const updateProgram = await program.update({
            where: {
                id: parseInt(id)
            },
            data: {
                title
            }
        });
        if (!updateProgram) {
            return res.status(200).json(constant.Program.ERROR)
        }
        res.status(200).json({ success: true, data: updateProgram });
    } catch (error) {
        console.log({ error })
    }
}

const searchProgram = async (req: Request, res: Response) => {
    try {
        const perPage = parseInt((req.query.limit as string), 10) || 10;
        const { title } = req.body;
        const pageNumber = parseInt((req.query.pageNumber as string), 10) || 0;

        let offset: number = Math.abs((pageNumber - 1) * perPage);
        const findProgram = await program.findMany({
            take: perPage,
            skip: offset,
            where: {
                title: {
                    contains: title,
                    mode: "insensitive"
                }
            },
            orderBy: {
                title: 'asc',
            },
        });
        const pageInfo =
        {
            // hasNextPage: findProgram.length > perPage,
            pageNumber: pageNumber,
            findProgram
        }
        res.status(200).json({ success: true, data: pageInfo })
    } catch (error) {
        console.log({ error })
    }
}

export default { updateProgram, deleteProgram, getProgram, AddNewProgram, showAllPrograms, searchProgram }