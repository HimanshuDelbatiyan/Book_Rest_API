import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import UserModel from "./userModel";
import bcrypt from "bcrypt"
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";
import { create } from "domain";

const createUser = async (req:Request,res:Response,next:NextFunction) =>
{
    const {name, email, password} = req.body;
    // Validation
    if(!name || !email || !password)
    {
        const error = createHttpError(400, "All fields are required")

        return next(error); // Pass the Error to Global Error Handler
    }

    try
    {
        // Database Call (Fetching the user based on email field.)
        const user = await UserModel.findOne({email})
        
        // Process
        if(user)
        {
            const error = createHttpError(400,"User Already exists with this email");
    
            return next(error)
        }
    }
    catch(err)
    {
        // Note: 500 Status Code means internal server error.
        return next(createHttpError(500,"Error While getting the user"))
    }

    let newUser: User;

    try{
    //password --> hash
    const hashedPassword = await bcrypt.hash(password,10)

    newUser = await UserModel.create({
        name,email,password:hashedPassword
    })
    }
    catch(err)
    {
        // Note: 500 Status Code means internal server error.
        return next(createHttpError(500, "Error while creating the user"))
    }


    try
    {
        // Defining the payload part of the token
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
        // Note: 201 Status Code is used when a new resource is created.
        res.status(201).json({accessToken:token})
    }
    catch(err)
    {
        return next(createHttpError(500,"Error:While signing the JWT token"))
    }    
}

const loginUser = async (req:Request,res:Response,next:NextFunction) =>
{
    const {email, password} = req.body;

    if(!email || !password)
    {
        // Note: Here 400 Status Code means that the error is generated because user sent the wrong data etc
        return next(createHttpError(400,"All Fields are required"))
    }

    try
    {
        const user = await UserModel.findOne({email})

        if(!user)
        {
            //Note: Status Code 404 is used when something is not found
            return next(createHttpError(404,"User not Found"))
        }

        // Comparing the user sent password against the one stored in the database as well as hashing the password for matching purpose.
        const isMatch = await bcrypt.compare(password,user.password as string);


        if(!isMatch)
        {
            return next(createHttpError(400,"Username or password is incorrect"))
        }

        try
        {
            // Token Generation---> JWT (JsonWebtoken)
            // Note: .sign(method) by default use the HS256 algorithm for token generation
            const token = sign({sub:user._id}, config.jwtSecret as string, {
                expiresIn:'7d',
                algorithm: "HS256" // Specifying the algorithm
            })

            res.status(201).json({accessToken:token})
        }
        catch(err)
        {
            return next(createHttpError(500,"Error While generating the JWT Token"))
        }
    }
    catch(err)
    {
        return next(createHttpError(500, "Error While searching the user"))
    }

}

export { createUser, loginUser }