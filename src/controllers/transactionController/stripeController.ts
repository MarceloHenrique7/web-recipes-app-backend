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

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            
            const recipeId = event.data.object.metadata?.recipeId;
            if (!recipeId) {
                console.log("Nao foi possivel obter o recipeId")
                return res.status(StatusCodes.BAD_REQUEST).json({ message: "RecipeId not found in metadata" });
            }

            const transaction = await prisma.transaction.findFirst({ where:  {recipeId: recipeId} })
            if (!transaction) {
                return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Transaction not Found" })
            }
    
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    amount: session.amount_total as number,
                    status: "paid"
                }
            })
    
        }
    
        res.status(StatusCodes.OK).send()
    }


}

const createCheckoutSession = async (req: Request, res: Response) => {

    try {
        const checkoutSessionRequest: CheckoutSessionRequest = req.body;

        const recipe = await prisma.recipe.findUnique({ where: { id: checkoutSessionRequest.recipeId } })

        if (!recipe) {
            throw new Error('Recipe not Found')
        }



        const transaction = await prisma.transaction.create({
            data: {
                userId: checkoutSessionRequest.userId,
                recipeId: checkoutSessionRequest.recipeId,
                amount: checkoutSessionRequest.amount,
                method: checkoutSessionRequest.method,
                status: "success",
                currency: "usd",
                transactionType: "PURCHASE"
            }
        })

        const session = await createSession(checkoutSessionRequest, recipe.id, transaction.id)

        if (!session) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json( { message: "Error creating stripe section" } )
        }

        res.json({ url: session.url })

    } catch (error: any) {
        console.log(error)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message: error.raw.message} )
    }

}


const createSession = async (checkoutSessionRequest: CheckoutSessionRequest, recipeId: string, transactionId: string, ) => {
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
            recipeId,
            transactionId
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