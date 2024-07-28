import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { prisma } from "../../index"

export const getNotificationsById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const notification = await prisma.notification.findUnique({where: { id: id }})

        if (!notification) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Notification not Found" })
        }

        res.status(StatusCodes.OK).json(notification)

    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something Went Wrong" })
    }
}


