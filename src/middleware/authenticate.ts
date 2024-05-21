import { Response,Request, NextFunction } from "express"
import createHttpError from "http-errors"
import jwt from "jsonwebtoken"
import { config } from "../config/config"

export interface AuthRequest extends Request
{
    userId: String
}


const authenticate = (req:Request,res:Response,next:NextFunction) =>
    {
        const token = req.header('Authorization')

        if(!token)
            {
                // 401 --> Not Authenticated
                return next(createHttpError(401,"Authorization Token is Required"))
            }

        const parsedToken = token?.split(' ')[1];

        try {
            const decoded = jwt.verify(parsedToken as string,config.jwtSecret as string)

            console.log('decoded',decoded)


            //????????????//
            const _req = req as AuthRequest;

            _req.userId = decoded.sub as string;


        next();

        } catch (error) 
        {
            return next(createHttpError(401,"Token Expired"))
        }
    }

    export default authenticate;