import express from "express";
import { createBook } from "./bookControllers";
import multer from "multer";
import path from "path";
// Creating the Router instance.
const bookRouter = express.Router();

const upload = multer({

    // Note: By using the ".resolve" we are saying that inside the directory we are perform the specified operation
    dest: path.resolve(__dirname, "../../public/data/uploads"),

    limits : {fileSize:3e7} // 30mb
})

bookRouter.post("/",upload.fields([
    {name:"CoverImage", maxCount:1},
    {name: "file", maxCount:1}
]),createBook)




export default bookRouter;