import express, { Router } from "express";


import { jwtCheck, jwtParse } from "../middleware/auth";
import { createTransationWallet } from "../controllers/transactionController/createTransactionWallet";
import { getTransactionsWallet } from "../controllers/transactionController/getTransactionsWallet";
import stripeController from "../controllers/transactionController/stripeController";
import bodyParser from "body-parser";


const router = Router();

// O usuário optou pela opção de pagamento pela carteira (Wallet)
router.get("/", jwtCheck, jwtParse, getTransactionsWallet)
router.post("/create/wallet", jwtCheck, jwtParse, createTransationWallet)

// O usuário optou pela opção de pagamento pelo cartão
router.post("/checkout/create-checkout-session", jwtCheck, jwtParse, stripeController.createCheckoutSession)
router.post("/checkout/webhook", bodyParser.raw({ type: 'application/json' }), stripeController.stripeWebHookHandler)

export default router;