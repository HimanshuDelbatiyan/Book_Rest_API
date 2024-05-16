import express from "express";
import { createUser } from "./userControllers";

// Creating the Router instance.
const userRouter = express.Router();

userRouter.post("/register", createUser)




export default userRouter;