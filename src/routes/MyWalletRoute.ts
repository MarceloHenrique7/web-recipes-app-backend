


import { Router } from "express";
import { myWalletController } from "../controllers/walletController";
import { jwtCheck, jwtParse } from "../middleware/auth";
const router = Router()

router.get('/', jwtCheck, jwtParse, myWalletController.getMyWallet)
router.put('/', jwtCheck, jwtParse, myWalletController.updateMyWallet)

export default router;
