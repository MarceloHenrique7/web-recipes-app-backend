import { Response, Request } from "express"
import { StatusCodes } from "http-status-codes"
import { prisma } from "../../index";


export const deleteNotification = async (req: Request, res: Response) => {
    
    try {
        const { recipeId, userId } = req.body;
        const existingUser = await prisma.user.findUnique({ where: { id: userId } })
        const existingNotification = await prisma.notification.findFirst({
            where: {
              AND: [
                { recipeId: recipeId },
                { userId: userId },
              ],
            },
            include: {
              user: true,
            },
          });
          

        if ( !existingNotification ) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "notification not found" })
        }
        if ( !existingUser ) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "user not found" })
        }

        await prisma.notification.delete({ where: { id: existingNotification.id } })
        
        const updatedArraySave = existingUser.savedRecipes.filter((item) => item != recipeId)
        await prisma.user.update({ 
          where: { id: existingUser.id },
          data: {
            savedRecipes: updatedArraySave || []
          }
         })
         
        res.status(StatusCodes.NO_CONTENT).send()

    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong" })
    }

}
