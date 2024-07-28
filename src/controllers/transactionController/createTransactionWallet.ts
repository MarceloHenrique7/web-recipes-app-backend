import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../index";


export const createTransationWallet = async (req: Request, res: Response) => {
    try {
    
        const { userId, recipeId, amount, currency, method, transactionType } = req.body;

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

        const userBuyer = await prisma.user.findUnique({ where: { id: recipe?.userId } })
        const currentWalletUserBuyer = await prisma.wallet.findUnique({ where: { id: userBuyer?.walletId as string } })
        if (!userBuyer || !currentWalletUserBuyer) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "User not Found" })
            // para verificar se o user comprador existe
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



        await prisma.notification.create({
            data: {
                title: `you sold a recipe to ${user.name}`,
                subtitle: '',
                description: 'check your earnings in your wallet',
                type: "SELL",
                isGeneral: false,
                isRead: false,
                readByUsers: [],
                recipeId: recipe.id,
                recipientUserId: recipe.userId,
                userId: user.id
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

        await prisma.transaction.create({
            data: {
                userId: recipe.userId,
                recipeId: recipeId,
                amount: amount,
                currency: currency,
                method: method,
                status: "success",
                transactionType: "SALE"
            }
        })


        await prisma.user.update({
            where: {
                id: userBuyer.id
            },
            data: {
                wallet: {
                    update: {
                        balance: currentWalletUserBuyer?.balance + transaction.amount
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

