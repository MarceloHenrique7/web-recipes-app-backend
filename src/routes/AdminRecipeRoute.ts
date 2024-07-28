import { jwtCheck, jwtParse } from "../middleware/auth";
import { Router } from "express";
import { MyRecipeController } from "../adminControllers/recipeController";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage()

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024
    }
})

router.get('/recipe',
    jwtCheck,
    jwtParse,
    MyRecipeController.getAllRecipes
)

router.get('/recipe/:id',
    MyRecipeController.getMyRecipe)
    
router.post('/recipe',
    upload.single("imageFile"),
    jwtCheck,
    MyRecipeController.createMyRecipeValidator,
    MyRecipeController.createMyRecipe)

router.put('/recipe/:id',
    upload.single("imageFile"),
    jwtCheck,
    jwtParse,
    MyRecipeController.updateMyRecipeValidator,
    MyRecipeController.updateMyRecipe)

router.delete('/recipe/:id',
    jwtCheck,
    jwtParse,
    MyRecipeController.deleteMyRecipe)

export default router;
