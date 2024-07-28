import { Request, Response } from "express";
import * as yup from 'yup';
import { validation } from "../../middleware/validation";
import cloudinary from "cloudinary";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../index";

export const updateMyRecipeValidator = validation(getSchema => ({
    body: getSchema(yup.object().shape({
        name: yup.string().min(3).optional(),
        description: yup.string().min(3),
        prepTime: yup.number(),
        cookTime: yup.number(),
        serving: yup.number(),
        imageUrl: yup.string(),
        categories: yup.array().of(yup.string()),
        isPublic: yup.boolean(),
        forSale: yup.boolean(),
        price: yup.number(),
        nutrients: yup.array().of(yup.object({
            calories: yup.number(),
            fat: yup.number(),
            protein: yup.number(),
            carbohydrate: yup.number(),
        })),
        ingredients: yup.array().of(yup.object({
            name: yup.string(),
            quantity: yup.number(),
            unit: yup.string(),
        })),
        instructions: yup.array().of(yup.object({
            title: yup.string(),
            subtitle: yup.string(),
            description: yup.string(),
        })),
    })),
}));

export const updateMyRecipe = async (req: Request, res: Response) => {


    try {
        const recipeId = req.params.id;
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: {
                nutrients: true,
                ingredients: true,
                instructions: true,
            },
        });

        if (!recipe) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "Recipe not found" });
        }

        const {
            nutrients,
            ingredients,
            instructions,
            price,
            forSale,
            isPublic
        } = req.body;

        const parsedNutrients = JSON.parse(JSON.stringify(nutrients));
        const parsedIngredients = JSON.parse(JSON.stringify(ingredients));
        const parsedInstructions = JSON.parse(JSON.stringify(instructions));

        const forSaleBool = typeof forSale === 'string' ? forSale.toLowerCase() === 'true' : forSale;
        const isPublicBool = typeof isPublic === 'string' ? isPublic.toLowerCase() === 'true' : isPublic;

        console.log("For sale", forSale);
        console.log("isPublic", isPublic);

        await prisma.recipe.update({
            where: {
                id: recipeId,
            },
            data: {
                name: req.body.name,
                description: req.body.description,
                prepTime: req.body.prepTime,
                cookTime: req.body.cookTime,
                serving: req.body.serving,
                categories: req.body.categories,
                forSale: forSaleBool,
                isPublic: isPublicBool,
                price: forSaleBool ? parseFloat(price) : 0.0,
                nutrients: {
                    deleteMany: {},
                    create: parsedNutrients.map((nutrient: any) => ({
                        calories: parseFloat(nutrient.calories),
                        fat: parseFloat(nutrient.fat),
                        protein: parseFloat(nutrient.protein),
                        carbohydrate: parseFloat(nutrient.carbohydrate),
                    })),
                },
                ingredients: {
                    deleteMany: {},
                    create: parsedIngredients.map((ingredient: any) => ({
                        name: ingredient.name,
                        quantity: parseFloat(ingredient.quantity),
                        unit: ingredient.unit,
                    })),
                },
                instructions: {
                    deleteMany: {},
                    create: parsedInstructions.map((instruction: any) => ({
                        title: instruction.title,
                        subtitle: instruction.subtitle,
                        description: instruction.description,
                    })),
                },
                lastUpdate: new Date(),
            },
        });

        if (req.body.imageFile) {
            const imageUrl =  await uploadImage(req.body.imageFile)
            await prisma.recipe.update({
                where: {
                    id: recipeId,
                },
                data: {
                    imageUrl: imageUrl,
                },
            });
        }

        res.status(StatusCodes.OK).send(recipe);
    } catch (error) {
        console.log(error);
        res.status(StatusCodes.BAD_REQUEST).json({
            message: "Something went wrong",
        });
    }
};

const uploadImage = async (file: any) => {
    const uploadResponse = await cloudinary.v2.uploader.upload(file);
    return uploadResponse.url;
};
