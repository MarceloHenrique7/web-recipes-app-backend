import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../index';

export const getMyUser = async (req: Request, res: Response) => {
    try {
        let user;

        if (req.body.authId) {
            user = await prisma.user.findUnique({
                where: { auth0Id: req.body.authId },
                include: { wallet: true}
            });

            if (user) {
                return res.status(StatusCodes.OK).json(user);
            }
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Unable to Get a user" });
        }

        user = await prisma.user.findUnique({
            where: { id: req.body.userId },
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
