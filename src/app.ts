import express, { Request, Response , NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";
import GlobalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";

// Creating the instance of Express Application
const app = express();

// This middleware will parse the requests containing the JSON Data 
// if we don't use this then this will cause error
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
    res.json({message: "Welcome to Home Page",})
})


// Mounting the Router instance to the an Specific URL.
// Although this is a middleware which will be executed for each requests.
app.use("/api/users/", userRouter)
app.use("/api/books/",bookRouter)

// ------------> Global Error Handler:
app.use(GlobalErrorHandler)



// Exporting the app instance as default export of app module
export default app;