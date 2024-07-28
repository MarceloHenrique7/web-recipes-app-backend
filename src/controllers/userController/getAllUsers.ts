import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../index';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({})

        if (users) {
            const totalUsers = users.length; 
            res.set('Content-Range', `users 0-${users.length}/${totalUsers}`);
            return res.status(StatusCodes.OK).json(users);
        }
        


        return res.status(StatusCodes.NOT_FOUND).json({ message: "Unable to Get a users" });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Unable to Get a user" });
    }
};


export default getAllUsers;