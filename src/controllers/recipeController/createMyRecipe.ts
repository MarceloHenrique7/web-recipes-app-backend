import { Request, Response } from "express";
import * as yup from 'yup';
import { validation } from "../../middleware/validation";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { prisma } from '../../index';

export const createMyRecipeValidator = validation(getSchema => ({
    body: getSchema(yup.object().shape({
        name: yup.string().min(3).optional(), 
        description: yup.string().min(3),
        prepTime: yup.number(),
        cookTime: yup.number(),
        serving: yup.number(),
        imageUrl: yup.string(),
        categories: yup.array().of(yup.string()),
        isPublic: yup.boolean().optional(),
        forSale: yup.boolean().optional(),
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


export const createMyRecipe = async (req: Request, res: Response) => {
    try {
        const imageUrl = req.file ? await uploadImage(req.file as Express.Multer.File) : null;

        const {
            name,
            description,
            prepTime,
            cookTime,
            serving,
            categories,
            nutrients,
            ingredients,
            instructions,
            userId,
            forSale,
            isPublic,
            price
        } = req.body;
        
        const parsedNutrients = JSON.parse(JSON.stringify(nutrients))
        const parsedIngredients = JSON.parse(JSON.stringify(ingredients))
        const parsedInsctructions = JSON.parse(JSON.stringify(instructions))
        const forSaleBool = forSale.toLowerCase() == 'true'
        const isPublicBool = isPublic.toLowerCase() == 'true'
        const recipe = await prisma.recipe.create({
            data: {
                name,
                description,
                prepTime,
                cookTime,
                serving,
                categories,
                nutrients: {
                    create: parsedNutrients.map((nutrient: any) => ({
                        calories: parseFloat(nutrient.calories),
                        fat: parseFloat(nutrient.fat),
                        protein: parseFloat(nutrient.protein),
                        carbohydrate: parseFloat(nutrient.carbohydrate),
                        
                    }))
                },
                ingredients: {
                    create: parsedIngredients.map((ingredient: any) => ({
                        name: ingredient.name,
                        quantity: parseFloat(ingredient.quantity),
                        unit: ingredient.unit,
                    }))
                },
                instructions: {
                    create: parsedInsctructions.map((instruction: any) => ({
                        title: instruction.title,
                        subtitle: instruction.subtitle,
                        description: instruction.description
                    }))
                },
                imageUrl: imageUrl as string,
                userId: new mongoose.Types.ObjectId(userId).toString(),
                lastUpdate: new Date(),
                isPublic: isPublicBool,
                forSale: forSaleBool,
                price: parseFloat(price) || 0.0,
            },
        });

        res.status(StatusCodes.CREATED).send(recipe);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.BAD_REQUEST).json({
            message: "Algo deu errado",
        });
    }
};

const uploadImage = async (file: Express.Multer.File) => {
    const image = file
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url
}
