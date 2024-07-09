import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../index";




export const createTransationWallet = async (req: Request, res: Response) => {
    try {
        
        const {
            userId,
            recipeId,
            status,
            method,
            amount,
            currency,
            transactionType
        } = req.body;


        const user = await prisma.user.findUnique({ where: { id: userId }, include: { wallet: true, recipes: true } })
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not Found" })
            // para verificar se o user logado existe
        }

        const balance = user.wallet?.balance // obter o valor da carteira do user

        if ( !balance ) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Balance is insufficient" })
        }
        
        const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })
        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not Found" })
            // verificar se a recipe que esta sendo comprada existe
        }


        const isBuyingOwnRecipe = user.recipes.some((recipeUser) => recipeUser.userId === recipe.userId)
            // pegamos todas recipes do user logado
            // depois verificamos se o usuario não está tentando comprar sua propia recipe
        if (isBuyingOwnRecipe) { 
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "You can't buy yourself recipe" })
        }  


        if (balance < amount) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Balance not is sufficient" })
        }

        const balanceUpdate = balance - amount

        const transaction = await prisma.transaction.create({
            data: {
                userId: userId,
                recipeId: recipeId,
                amount: amount,
                currency: currency,
                method: method,
                status: "paid",
                transactionType: transactionType
            }
        })

        await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                wallet: {
                    update: {
                        balance: balanceUpdate
                    }
                }
            }
        })


        res.status(StatusCodes.CREATED).json(transaction)

    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" })
    }
}

