import express from "express";
// Creating the instance of Express Application
const app = express();

// Routes:
// HTTP Methods 
app.get("/",(req,res,next)=>
{
    // Sending an response of type "JSON".
    // and it is one of the principles of REST Architectural Style
    res.json({message: "Welcome to  PORT 3000"})
})


// Exporting the app instance as default export of app module
export default app;