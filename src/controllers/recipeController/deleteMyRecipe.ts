import { Response, Request } from "express"
import { StatusCodes } from "http-status-codes"
import { prisma } from "../../index";


export const deleteMyRecipe = async (req: Request, res: Response) => {
    
    try {
        
        const recipeId = req.params?._id;

        const existingRecipe = await prisma.recipe.findUnique({ where: { id: recipeId } })

        if ( !existingRecipe ) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "recipe not found" })
        }

        if ( req.body.userId !== existingRecipe.userId ) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "This recipe doesn't belong to you" })
        }

        await prisma.recipe.delete({ where: { id: recipeId } })
         
        res.status(StatusCodes.NO_CONTENT).send()

    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "something went wrong" })
    }

}