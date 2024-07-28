import Stripe from "stripe" // importamos o stripe que instalamos
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../index";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);

const FRONTEND_URL = process.env.FRONTEND_URL as string

const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string



export const getMyTransaction = async (req: Request, res: Response) => {

    try {
        
        const transactions = await prisma.transaction.findMany({ where: { userId: req.body.userId } })
        if (!transactions) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No transactions found" })
        }

        res.status(StatusCodes.OK).json(transactions)

    } catch (error) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error })
    }
}

type CheckoutSessionRequest = {
    transactionType: string;
    currency: string;
    method: string;
    amount: number;
    userId: string;
    recipeId: string
}

const stripeWebHookHandler = async (req: Request, res: Response) => {
    let event;

    if (STRIPE_ENDPOINT_SECRET) {
        try {
            const sig = req.headers["stripe-signature"] as string;
            
            event = STRIPE.webhooks.constructEvent(req.body, sig, STRIPE_ENDPOINT_SECRET)
    
        } catch (error: any) {
            console.log(error)
            return res.status(400).send(`Webhook erro: ${error.message}` )
        }
    
        res.status(StatusCodes.OK).send()
    }


}

const createCheckoutSession = async (req: Request, res: Response) => {

    try {
        const checkoutSessionRequest = req.body;

        console.log(checkoutSessionRequest)


        const recipe = await prisma.recipe.findUnique({ where: { id: checkoutSessionRequest?.recipeId } })

        if (!recipe) {
            throw new Error('Recipe not Found')
        }
        const userBuyer = await prisma.user.findUnique({ where: { id: req.body.userId } })

        if (!userBuyer) {
            return res.status(StatusCodes.NOT_FOUND).json( { message: "User not Found" } )
        }


        const transaction = await prisma.transaction.create({
            data: {
                userId: userBuyer.id,
                recipeId: recipe.id,
                amount: checkoutSessionRequest.amount,
                method: checkoutSessionRequest.method,
                status: "success",
                currency: "usd",
                transactionType: "PURCHASE"
            }
        })



        await prisma.transaction.create({
            data: {
                userId: recipe.userId,
                recipeId: recipe.id,
                amount: checkoutSessionRequest.amount,
                method: checkoutSessionRequest.method,
                status: "success",
                currency: "usd",
                transactionType: "SALE"
            }
        })
        
        await prisma.notification.create({
            data: {
                title: `${userBuyer.name} buy your recipe!`,
                subtitle: '',
                description: 'check your earnings in your wallet',
                type: "SELL",
                isGeneral: false,
                isRead: false,
                readByUsers: [],
                recipeId: recipe.id,
                recipientUserId: recipe.userId,
                userId: userBuyer.id
            }
        })

        console.log("createCheckoutSession ---->>>" + recipe.id, transaction.id)
        const session = await createSession(checkoutSessionRequest, recipe.id, transaction.id)

        if (!session) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( { message: "Error creating stripe section" } )
        }

        res.json({ url: session.url })

    } catch (error: any) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error} )
    }

}


const createSession = async (checkoutSessionRequest: CheckoutSessionRequest, recipeId: string, transactionId: string, ) => {
    
    if (!recipeId || !transactionId) {
        throw new Error("Recipe ID and Transaction ID must be provided");
    }
    
    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } })

    console.log("Passando para o metadata", recipeId, transactionId)

    if (!recipe) {
        throw new Error("Recipe not found")
    }

    const amountParsed = checkoutSessionRequest.amount * 100

    const sessionData = await STRIPE.checkout.sessions.create({

        line_items: [
            {
                price_data: {
                    currency: "usd",
                    unit_amount: amountParsed,
                    product_data: {
                        name: recipe.name,
                    },
                },
                quantity: 1
            }
        ],
        shipping_options: [
            {
                shipping_rate_data: {
                    display_name: "Delivery",
                    type: "fixed_amount",
                    fixed_amount: {
                        amount: 0,
                        currency: "usd"
                    }
                }
            }
        ],
        mode: "payment",
        metadata: {
            recipeId: recipeId,
            transactionId: transactionId
        },
        success_url: `${FRONTEND_URL}/transaction-status/${recipe.id}?success=true`,
        cancel_url: `${FRONTEND_URL}/details/${recipeId}?cancel=true`
    })
    return sessionData;
}


export default {
    stripeWebHookHandler,
    createCheckoutSession,
    getMyTransaction
}