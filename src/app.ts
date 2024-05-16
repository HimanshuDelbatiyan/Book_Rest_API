import express, { Request, Response , NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";
import { config } from "./config/config";
import GlobalErrorHandler from "./middleware/globalErrorHandler";
// Creating the instance of Express Application
const app = express();

// Routes:
// HTTP Methods 
app.get("/",(req,res,next)=>
{
    const error = createHttpError(400,"Something Went Wrong")

    throw error; // This error will be cached by the Global Error Handler

    // Sending an response of type "JSON".
    // and it is one of the principles of REST Architectural Style
    res.json({message: "Welcome to  PORT 3000"})
})

// ------------> Global Error Handler:
app.use(GlobalErrorHandler)



// Exporting the app instance as default export of app module
export default app;