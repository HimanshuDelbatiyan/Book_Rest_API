import express from "express";
import { createBook } from "./bookControllers";
// Creating the Router instance.
const bookRouter = express.Router();

bookRouter.post("/", createBook)




export default bookRouter;