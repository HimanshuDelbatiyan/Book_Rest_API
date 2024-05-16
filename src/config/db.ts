// Importing the mongoose which will let us interact with the MongoDB
import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () =>
{
    try
    {
        mongoose.connection.on("connected", () => {
            console.log("Connected SuccessFully to Database")
        })

        mongoose.connection.on("error",(err)=>
        {
            console.error("Error in Connecting to database ",err)
        })
        
        await mongoose.connect(config.mongoURL as string);
        
    }
    catch (err)
    {
        console.error("Failed to Connect to Database " + err)

        // Stop the server
        process.exit(1);
    }


}

export default connectDB;