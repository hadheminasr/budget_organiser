import mongoose from "mongoose";
export const connectDB = async () => {
    try{
        console.log("mongo_uri :" , process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MnogoDB connected : ${conn.connection.host}`);

    } catch (error){
        console.log("error connection to MongoDB : ", error.message);
        process.exit(1)//1: faillure ; 0 :success
    }
};