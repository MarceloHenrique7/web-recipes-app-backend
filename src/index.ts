import express, { Request, Response } from 'express';
import myUserRoute from './routes/MyUserRoute'
import myRecipeRoute from './routes/MyRecipeRoute'
import RecipeRoute from './routes/RecipeRoute'
import TransactionRoute from './routes/TransactionRoute'
import cors from 'cors'
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const app = express();

app.use(cors())

app.use(bodyParser.raw({ type: 'application/json' }))
app.use(express.json())

app.use("/", RecipeRoute)
app.use("/api/recipe/search", RecipeRoute)
app.use("/api/my/user", myUserRoute)
app.use("/api/my/recipe", myRecipeRoute)
app.use("/api/transaction", TransactionRoute)

export const prisma = new PrismaClient();

const PORT = 8080;
const CONNECT_URL_STRING = process.env.CONNECT_URL_STRING

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

app.get("/health", (req: Request, res: Response) => {
    res.send("Health Ok!")
})

mongoose.connect(CONNECT_URL_STRING as string)
.then(() => {
    console.log("connected to database")
}).catch((err)=> {
    console.log(err)
})

let server;
if(!module.parent) {
    server = app.listen(PORT, () => console.log(`server started in port ${PORT}`))
}

export { app, server };