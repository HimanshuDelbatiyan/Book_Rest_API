import express from "express";
import { createUser , loginUser} from "./userControllers";

// Creating the Router instance.
const userRouter = express.Router();

userRouter.post("/register", createUser)

userRouter.post("/login",loginUser)



export default userRouter;