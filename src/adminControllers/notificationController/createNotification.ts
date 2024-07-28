import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../index";

export const createNotification = async (req: Request, res: Response) => {
    try {
        const { userId, recipientUserId, recipeId, type, title, subtitle, description } = req.body;

        const userToSave = await prisma.user.findUnique({ where: { id: userId } });
        const userSendNotification = await prisma.user.findUnique({ where: { id: recipientUserId } });
        const recipeSaved = await prisma.recipe.findUnique({ where: { id: recipeId } });

        if (!userToSave || !userSendNotification) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not Found" });
        }

        if (!recipeSaved) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not Found" });
        }

        if (type === 'SELL') {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    recipientUserId,
                    recipeId,
                    type,
                    title,
                    subtitle,
                    description,
                    createdAt: new Date(),
                    isRead: false,
                    isGeneral: false,
                    readByUsers: []
                }
            });
            return res.status(StatusCodes.CREATED).json(notification);
        }

        if (type === 'SAVE') {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    recipientUserId,
                    recipeId,
                    type,
                    title,
                    subtitle,
                    description,
                    createdAt: new Date(),
                    isRead: false,
                    isGeneral: false,
                    readByUsers: []
                }
            });

            await prisma.user.update({
                where: { id: userId },
                data: {
                    savedRecipes: {
                        push: recipeId
                    }
                }
            });

            return res.status(StatusCodes.CREATED).json(notification);
        }

    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something Went Wrong" });
    }
};
