import mongoose from 'mongoose'
import dotenv, { config } from "dotenv"
dotenv.config({
    path: './.env'
})

const dbname = "quiz"

const connectDB = async () => {
    try {
        const ok = await mongoose.connect(`${process.env.MONGO_URI}/${dbname}`);
        console.log(`MongoDB connected succesfully:-  ${ok.connection.host}`);
    } catch (err) {
        console.error(`Error is:::-> `, error);
        process.exit(1);
    }
};

export default connectDB;
