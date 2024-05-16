import express, { Request, Response , NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";
import { config } from "./config/config";
import GlobalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./user/userRouter";




// Creating the instance of Express Application
const app = express();

// This middleware will parse the requests containing the JSON Data if we don't use this then this will cause error
// cause we will not able to access the json data associated with the request
app.use(express.json())

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


app.use("/api/users/", userRouter)




// ------------> Global Error Handler:
app.use(GlobalErrorHandler)



// Exporting the app instance as default export of app module
export default app;