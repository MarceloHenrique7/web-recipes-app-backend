import Stripe from "stripe";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../index";


const FRONTEND_URL = process.env.FRONTEND_URL as string;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;
const STRIPE_API_KEY = process.env.STRIPE_API_KEY as string;
const stripe = new Stripe(STRIPE_API_KEY);

export const getMyTransaction = async (req: Request, res: Response) => {
    try {
        const transactions = await prisma.transaction.findMany({ where: { userId: req.body.userId } });
        if (!transactions) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No transactions found" });
        }
        res.status(StatusCodes.OK).json(transactions);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error });
    }
};

type CheckoutSessionRequest = {
    transactionType: string;
    currency: string;
    method: string;
    amount: number;
    userId: string;
    recipeId: string;
};

const stripeWebHookHandler = async (req: Request, res: Response) => {
    let event;
    console.log("endpoint secret ---------->>>>");
    if (STRIPE_ENDPOINT_SECRET) {
        try {
            const sig = req.headers["stripe-signature"] as string;
            event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_ENDPOINT_SECRET);
        } catch (error: any) {
            console.log(error);
            return res.status(400).send(`Webhook erro: ${error.message}`);
        }

        if (event.type === 'checkout.session.completed') {


            console.log("O 'checkout.session.completed'");

            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;
            console.log("Metadata: ", metadata);
            
            const recipe = await prisma.recipe.findUnique({
                where: { id: metadata?.recipeId }
            })


            if (!recipe) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "Recipe not found"
                })
            }

            // Aqui criamos uma transação para quem está comprando a "recipe"
            const userBuyer = await prisma.user.findUnique({ where: { id: metadata?.userBuyerId } });
            if (!userBuyer) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "User not Found" });
            }
    
            const transaction = await prisma.transaction.create({
                data: {
                    userId: userBuyer.id,
                    recipeId: recipe.id,
                    amount: parseFloat(metadata?.amount as string),
                    method: metadata?.method as string,
                    status: "success",
                    currency: "usd",
                    transactionType: "PURCHASE"
                }
            });

            // Aqui criamos uma transação e uma notificação para quem está vendendo a "recipe"
            await prisma.transaction.create({
                data: {
                    userId: recipe.userId,
                    recipeId: recipe.id,
                    amount: transaction.amount,
                    method: transaction.method,
                    status: "success",
                    currency: "usd",
                    transactionType: "SALE"
                }
            });
    
            await prisma.notification.create({
                data: {
                    title: `${userBuyer?.name} buy your recipe!`,
                    subtitle: '',
                    description: 'check your earnings in your wallet',
                    type: "SELL",
                    isGeneral: false,
                    isRead: false,
                    readByUsers: [],
                    recipeId: recipe.id,
                    recipientUserId: recipe.userId,
                    userId: userBuyer?.id as string
                }
            });
    
            // verificamos se a wallet desse usuario que está vendendo a recipe existe
            const balanceOwnerOfRecipe = await prisma.wallet.findUnique({
                where: { userId: recipe.userId }
            });
    
            if (!balanceOwnerOfRecipe) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    message: "User balance not found"
                });
            }
            
            // atualizamos sua wallet com o valor da recipe (amount)
            await prisma.user.update({
                where: { id: recipe.userId },
                data: {
                    wallet: {
                        update: {
                            balance: balanceOwnerOfRecipe?.balance + transaction.amount
                        }
                    }
                }
            });
    
            
        }
        console.log(`Unhandled event type ${event.type}`);

        res.status(StatusCodes.OK).send();
    }
};



const createCheckoutSession = async (req: Request, res: Response) => {
    try {
        const checkoutSessionRequest: CheckoutSessionRequest = req.body;

        const recipe = await prisma.recipe.findUnique({ where: { id: checkoutSessionRequest?.recipeId } });

        if (!recipe) {
            throw new Error('Recipe not Found');
        }

        if (recipe.userId === checkoutSessionRequest.userId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "You can't buy yourself recipe" })
        }

        const session = await createSession(checkoutSessionRequest, recipe.id, req.body.userId);
        if (!session) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Error creating stripe session" });
        }

       
        res.json({ url: session.url });

    } catch (error: any) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error });
    }
};

const createSession = async (checkoutSessionRequest: CheckoutSessionRequest, recipeId: string, userBuyerId: string) => {
    if (!recipeId) {
        throw new Error("Recipe ID must be provided");
    }

    const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });

    console.log("Passando para o metadata", recipeId);

    if (!recipe) {
        throw new Error("Recipe not found");
    }

    const amountParsed = checkoutSessionRequest.amount * 100;

    const sessionData = await stripe.checkout.sessions.create({
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
            amount: checkoutSessionRequest.amount,
            method: checkoutSessionRequest.method,
            userBuyerId: userBuyerId
        },
        success_url: `${FRONTEND_URL}/transaction-status/${recipe.id}?success=true`,
        cancel_url: `${FRONTEND_URL}/details/${recipeId}?cancel=true`
    });


    return sessionData;
};

export default {
    stripeWebHookHandler,
    createCheckoutSession,
    getMyTransaction
};
