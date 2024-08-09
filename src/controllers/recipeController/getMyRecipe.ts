import { StatusCodes } from "http-status-codes"
import { Request, Response } from "express"

import { prisma } from '../../index';


export const getMyRecipe = async (req: Request, res: Response) => {

    try {
        const recipe = await prisma.recipe.findUnique({
            where: { id: req.params.id },
            include: {
                nutrients: true,
                ingredients: true,
                instructions: true
            }
        })
        
        if(!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "recipe not found" })
        }

        res.json(recipe)
    } catch (error) {
        console.log("error", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "ERROR FETCHING RECIPE" })
    }
}


export const getAllMyRecipe = async (req: Request, res: Response) => {
    try {
        const recipes = await prisma.recipe.findMany({where: {userId: req.body.userId}, 
            include: {
                nutrients: true,
                ingredients: true,
                instructions: true
            }
        })

        if (!recipes) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "recipe not found" })
        }
        res.json(recipes)
    } catch (error) {
        console.log("error", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "ERROR FETCHING RECIPE" })
    }
}

export const getAllRecipes = async (req: Request, res: Response) => {
    try {
        const recipes = await prisma.recipe.findMany({include: {
            nutrients: true,
            ingredients: true,
            instructions: true
        }})

        if (!recipes) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "recipe not found" })
        }

        res.json(recipes)
    } catch (error) {
        console.log("error", error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "ERROR FETCHING RECIPE" })
    }
}