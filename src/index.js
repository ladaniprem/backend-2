//require('dotenv').config({path:'./.env'}) consistance break karta hai 
import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=> {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App is listening on port ${process.env.PORT}`);
    })
})
.catch((Error) => {
    console.log("mongodb connection failed", Error);
})