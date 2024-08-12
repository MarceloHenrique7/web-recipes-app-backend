import express from 'express';
import myUserAdminRoute from './routes/AdminUserRoute';
import myRecipeAdminRoute from './routes/AdminRecipeRoute';
import NotificationsRoute from './routes/NotificationRoute';
import bodyParser from 'body-parser';
import myUserRoute from './routes/MyUserRoute';
import myRecipeRoute from './routes/MyRecipeRoute';
import myWalletRoute from './routes/MyWalletRoute';
import RecipeRoute from './routes/RecipeRoute';
import TransactionRoute from './routes/TransactionRoute';
import cors from 'cors';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
const app = express();

export const prisma = new PrismaClient();
const corsOptions = {
    origin: '*',
    credentials: true,
    exposedHeaders: ['Content-Range'],
    optionSuccessStatus: 200,
};

// Use express.raw for the Stripe webhook route
app.use('/api/transaction/checkout/webhook', express.raw({ type: 'application/json' }));

app.use(bodyParser.json({ limit: '10mb' })); // Ajuste o limite conforme necessário
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.use(cors(corsOptions));
app.use(express.json());

app.use("/", RecipeRoute);
app.use("/api/recipe/search", RecipeRoute);
app.use("/api/my/user", myUserRoute);
app.use("/api/my/recipe", myRecipeRoute);
app.use("/api/my/wallet", myWalletRoute);
app.use("/api/transaction", TransactionRoute);

// Route for admin handle with users
app.use("/admin/api", myUserAdminRoute);
// Route for admin handle with recipes
app.use("/admin/api", myRecipeAdminRoute);
// Route for admin handle with notifications
app.use("/api/notification", NotificationsRoute);

const PORT = 8080;
const CONNECT_URL_STRING = process.env.CONNECT_URL_STRING;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/health", (req, res) => {
    res.send("Health Ok!");
});

mongoose.connect(CONNECT_URL_STRING as string)
    .then(() => {
        console.log("connected to database");
    }).catch((err) => {
        console.log(err);
    });

let server;
if (!module.parent) {
    server = app.listen(PORT, () => console.log(`server started in port ${PORT}`));
}

export { app, server };
