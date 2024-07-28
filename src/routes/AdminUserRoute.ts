import { jwtCheck, jwtParse } from "../middleware/auth";
import { Router } from "express";
import { myUserController } from "../adminControllers/userController";

const router = Router();

// User Routes
router.get("/user", jwtCheck, jwtParse, myUserController.getAllUsers)
router.get("/user/:id", jwtCheck, jwtParse, myUserController.getMyUser)
router.post("/user", myUserController.createUserValidation, myUserController.createUserAuth0, myUserController.createMyUser)
router.put("/user/:id", jwtCheck, jwtParse, myUserController.updateCurrentUser)
router.delete("/user/:id", jwtCheck, jwtParse, myUserController.deleteUser)

export default router;