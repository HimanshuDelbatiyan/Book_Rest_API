import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import UserModel from "./userModel";

const createUser = async (req:Request,res:Response,next:NextFunction) =>
{
    const {name, email, password} = req.body;
    // Validation
    if(!name || !email || !password)
    {
        const error = createHttpError(400, "All fields are required")

        return next(error);
    }
    // Database Call
    const user = await UserModel.findOne({email})
    // Process
    if(user)
    {
        const error = createHttpError(400,"User Already exists with this email")

        return next(error)
    }

    // Response

    res.json({message:"User Registered"})
}

export { createUser }