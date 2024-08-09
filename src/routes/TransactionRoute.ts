import { Router } from "express";


import { jwtCheck, jwtParse } from "../middleware/auth";
import { createTransationWallet } from "../controllers/transactionController/createTransactionWallet";
import { getTransactionsWallet } from "../controllers/transactionController/getTransactions";
import stripeController from "../controllers/transactionController/stripeController";


const router = Router();

// O usuário optou pela opção de pagamento pela carteira (Wallet)
router.get("/", jwtCheck, jwtParse, getTransactionsWallet)
router.post("/create/wallet", jwtCheck, jwtParse, createTransationWallet)

// O usuário optou pela opção de pagamento pelo cartão
router.post("/checkout/create-checkout-session", jwtCheck, jwtParse, stripeController.createCheckoutSession)
router.post("/checkout/webhook", stripeController.stripeWebHookHandler)

export default router;