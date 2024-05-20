import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import UserModel from "./userModel";
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

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
        const error = createHttpError(400,"User Already exists with this email");

        return next(error)
    }

    //password --> hash
    const hashedPassword = await bcrypt.hash(password,10)

    const newUser = await UserModel.create({
        name,email,password:hashedPassword
    })

    // Token Generation---> JWT (JsonWebtoken)
    const token = sign({sub:newUser._id}, config.jwtSecret as string, {expiresIn:'7d'})

    // Response
    res.json({id:token})
}

export { createUser }