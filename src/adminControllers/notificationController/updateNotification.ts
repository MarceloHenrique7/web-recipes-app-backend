import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../index";

export const updateNotification = async (req: Request, res: Response) => {
    try {

        const id  = req.params?.id;

        console.log(id)

        const { 
            title, subtitle, description,
            type, recipeId, createdAt,
            isGeneral, isRead, recipientUserId,
            userId, 
         } = req.body.data;

        const existNotification = await prisma.notification.findUnique({where: { id: id }})

        if (!existNotification) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Notification not Found" })
        }


        const notification = await prisma.notification.update({
            where: { id: existNotification.id },
            data: {
                title: title,
                subtitle: subtitle,
                description: description,
                type: type,
                recipeId: recipeId,
                createdAt: createdAt,
                isGeneral: isGeneral,
                isRead: isRead,
                recipientUserId: recipientUserId,
                userId: userId,
                readByUsers: {
                    push: req.body.currentUserId
                }
            }
        });

        res.status(StatusCodes.NO_CONTENT).json(notification);

    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something Went Wrong" })
    }
}



