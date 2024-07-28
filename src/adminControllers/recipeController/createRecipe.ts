import { Request, Response } from "express";
import * as yup from 'yup';
import { validation } from "../../middleware/validation";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { prisma } from '../../index';
import { Prisma } from "@prisma/client";

export const createMyRecipeValidator = validation(getSchema => ({
    body: getSchema(yup.object().shape({
        userId: yup.string().optional(),
        name: yup.string().min(3).optional(),
        description: yup.string().min(3).optional(),
        prepTime: yup.number().optional(),
        cookTime: yup.number().optional(),
        serving: yup.number().optional(),
        imageUrl: yup.string().optional(),
        categories: yup.array().of(yup.string()).optional(),
        isPublic: yup.boolean().optional(),
        forSale: yup.boolean().optional(),
        price: yup.number().optional(),
        nutrients: yup.array().of(yup.object({
            calories: yup.number().optional(),
            fat: yup.number().optional(),
            protein: yup.number().optional(),
            carbohydrate: yup.number().optional(),
        })).optional(),
        ingredients: yup.array().of(yup.object({
            name: yup.string().optional(),
            quantity: yup.number().optional(),
            unit: yup.string().optional(),
        })).optional(),
        instructions: yup.array().of(yup.object({
            title: yup.string().optional(),
            subtitle: yup.string().optional(),
            description: yup.string().optional(),
        })).optional(),
    })),
}));

export const createMyRecipe = async (req: Request, res: Response) => {
    try {
        const imageUrl = req.body.imageFile ? await uploadImage(req.body.imageFile) : null;
        const {
            userId,
            name,
            description,
            prepTime,
            cookTime,
            serving,
            categories,
            nutrients,
            ingredients,
            instructions,
            isPublic,
            forSale,
            price
        } = req.body;

        const parsedNutrients = JSON.parse(JSON.stringify(nutrients));
        const parsedIngredients = JSON.parse(JSON.stringify(ingredients));
        const parsedInstructions = JSON.parse(JSON.stringify(instructions));

        const forSaleBool = typeof forSale === 'string' ? forSale.toLowerCase() === 'true' : forSale;
        const isPublicBool = typeof isPublic === 'string' ? isPublic.toLowerCase() === 'true' : isPublic;

        const newRecipe: Prisma.RecipeUncheckedCreateInput = {
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
                })),
            },
            ingredients: {
                create: parsedIngredients.map((ingredient: any) => ({
                    name: ingredient.name,
                    quantity: parseFloat(ingredient.quantity),
                    unit: ingredient.unit,
                })),
            },
            instructions: {
                create: parsedInstructions.map((instruction: any) => ({
                    title: instruction.title,
                    subtitle: instruction.subtitle,
                    description: instruction.description,
                })),
            },
            imageUrl: imageUrl as string,
            userId: userId,
            lastUpdate: new Date(),
            isPublic: isPublicBool,
            forSale: forSaleBool,
            price: parseFloat(price) || 0.0,
        };

        const recipe = await prisma.recipe.create({
            data: newRecipe,
            include: {
                user: true,
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

const uploadImage = async (file: any) => {
    const uploadResponse = await cloudinary.v2.uploader.upload(file);
    return uploadResponse.url;
};
