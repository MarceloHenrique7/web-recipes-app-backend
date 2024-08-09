import { jwtCheck, jwtParse } from "../middleware/auth";
import { Router } from "express";
import { MyRecipeController } from "../controllers/recipeController";
import multer from "multer";
const router = Router();

const storage = multer.memoryStorage()

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
})

router.get('/',
    jwtCheck,
    jwtParse,
    MyRecipeController.getAllMyRecipe
)

router.get('/:id',
    MyRecipeController.getMyRecipe)
    
router.post('/',
    upload.single("imageFile"),
    jwtCheck,
    jwtParse,
    MyRecipeController.createMyRecipeValidator,
    MyRecipeController.createMyRecipe)
    
router.put('/:_id',
    upload.single("imageFile"),
    jwtCheck,
    jwtParse,
    MyRecipeController.updateMyRecipeValidator,
    MyRecipeController.updateMyRecipe)

router.delete('/:_id',
    jwtCheck,
    jwtParse,
    MyRecipeController.deleteMyRecipe)

export default router;