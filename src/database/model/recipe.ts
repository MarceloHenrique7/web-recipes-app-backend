import mongoose, { InferSchemaType } from "mongoose";

const nutrient = new mongoose.Schema({
    calories: { type: Number, required: true },
    fat: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbohydrate: { type: Number, required: true },
})

const ingredient = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
})

const instruction = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String, required: true },
})



const recipe = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    prepTime: {type: Number, required: true},
    cookTime: {type: Number, required: true},
    serving: {type: Number, required: true},
    imageUrl: {type: String, required: true},
    categories: [{ type: String, required: true }],
    nutrients: [nutrient],
    ingredients: [ingredient],
    instructions: [instruction],
    lastUpdate: { type: Date, required: true }
})

export type RecipeType = InferSchemaType<typeof recipe>

const Recipe = mongoose.model("Recipe", recipe)

export default Recipe;