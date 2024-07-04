import { jwtCheck, jwtParse } from "../middleware/auth";
import { Router } from "express";
import { MyRecipeController } from "../controllers/recipeController";
const router = Router();

router.get('/',
    MyRecipeController.getAllRecipes)
    
router.get('/:recipe',
    MyRecipeController.searchRecipe)

export default router;