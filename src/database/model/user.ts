import mongoose from "mongoose";


const user = new mongoose.Schema({
    auth0Id: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
})

