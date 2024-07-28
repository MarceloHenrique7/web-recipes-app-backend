import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../index';

export const getMyUser = async (req: Request, res: Response) => {
    try {

        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: { wallet: true }
        });

        if (user) {
            return res.status(StatusCodes.OK).json(user);
        }
        
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Unable to Get a user" });
    } catch (error) {
        console.error("Error fetching user:", error); // Mensagem de depuração
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Unable to Get a user" });
    }
};
