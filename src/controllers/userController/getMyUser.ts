import { Request, Response } from "express";
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../../index';

export const getMyUser = async (req: Request, res: Response) => {
    try {

        if (req.body.authId) {
            const user = prisma.user.findUnique({ where: { auth0Id: req.body.authId }, include: { wallet: true } })

            if (user) {
                return res.status(StatusCodes.OK).json(user)
            }
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Unable to Get a user" })
        }

        const currentUser = await prisma.user.findUnique({ where: { id: req.body.userId }, include: { wallet: true }})
 
        res.status(StatusCodes.OK).json(currentUser)
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Unable to Get a user" })
    }
}