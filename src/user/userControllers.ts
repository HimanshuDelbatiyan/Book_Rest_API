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

        return next(error); // Pass the Error to Global Error Handler
    }
    // Database Call (Fetching the user based on email field.)
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

    const payload = {
        sub: newUser._id
    }

    // Token Generation---> JWT (JsonWebtoken)
    // Note: .sign(method) by default use the HS256 algorithm for token generation
    const token = sign(payload, config.jwtSecret as string, {
        expiresIn:'7d',
        algorithm: "HS256" // Specifying the algorithm
    })

    // Response sending the generated token as response to the user.
    res.json({accessToken:token})
}

export { createUser }