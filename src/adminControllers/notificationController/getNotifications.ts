import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { prisma } from "../../index"

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const notifications = await prisma.notification.findMany({})
        
        const totalCount = await prisma.notification.count()

        res.set('Content-Range', `users 0-${notifications.length}/${totalCount}`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Range');
        
        res.status(StatusCodes.OK).json(notifications)

    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something Went Wrong" })
    }
}


