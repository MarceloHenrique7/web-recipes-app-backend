import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"
import { prisma } from "../../index"

export const createNotification = async (req: Request, res: Response) => {
    try {
        const { userId, recipientUserId, recipeId, type, } = req.body

        // Em nossa aplicação permitimos que o user salve sua propia receita mas não queremos criar uma notificação para ele mesmo, então verificamos se o id do user que criou a notificação (salvou a receita), verificamos se não é igual ao do user que vai ser enviada a notificação, se for igual retornamos OK.
        if (userId === recipientUserId) return res.status(StatusCodes.OK).send()

        const userToSave = await prisma.user.findUnique( { where: { id: userId }  } )
        const userSendNotification = await prisma.user.findUnique( { where: { id: recipientUserId }  } )
        const recipeSaved = await prisma.recipe.findUnique( { where: { id: recipeId }  } )
        
        if (!userToSave || !userSendNotification) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not Found" })
        }

        if (!recipeSaved) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not Found" })
        }

        if ( type === 'SELL' ) {
            const notification = await prisma.notification.create({
                data: req.body
            })
            return res.status(StatusCodes.CREATED).json(notification)
        }

        if ( type === 'SAVE' ) {
            const notification = await prisma.notification.create({
                data: req.body
            })
            
            await prisma.user.update({
                where: { id: userId },
                data: {
                    savedRecipes: {
                        push: recipeId
                    }
                }
            })
            return res.status(StatusCodes.CREATED).json(notification)
        }

    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something Went Wrong" })
    }
}

