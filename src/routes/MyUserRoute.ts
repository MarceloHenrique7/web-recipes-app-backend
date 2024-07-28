import { jwtCheck, jwtParse } from "../middleware/auth";
import { Router } from "express";
import { myUserController } from "../controllers/userController";

const router = Router();

router.get("/all", jwtCheck, jwtParse, myUserController.getAllUsers)
router.get("/", jwtCheck, jwtParse, myUserController.getMyUser)
router.post("/", myUserController.createUserValidation , myUserController.createMyUser)
router.put("/", jwtCheck, jwtParse, myUserController.updateCurrentUser)

export default router;