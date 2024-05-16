import { HttpError } from "http-errors";
import { Request,Response, NextFunction } from "express";
import { config } from "../config/config";

// ------------> Global Error Handler:
const GlobalErrorHandler =(err:HttpError,req:Request,res:Response,next:NextFunction) => 
{
  
    const StatusCode = err.statusCode || 500;

    return res.status(StatusCode).json({
        message: err.message,
        // Do not do this in Production
        errorStack: config.env === "development" ? err.stack : "" // Stack contains the detailed information about the error
    })
}

export default GlobalErrorHandler;