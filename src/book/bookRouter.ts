import express from "express";
import { createBook ,updateBook, listBooks, getSingleBook, deleteBook} from "./bookControllers";
import multer from "multer";
import authenticate from "../middleware/authenticate";
import path from "path";
// Creating the Router instance.
const bookRouter = express.Router();

const upload = multer({

    // Note: By using the ".resolve" we are saying that inside the directory we are perform the specified operation
    dest: path.resolve(__dirname, "../../public/data/uploads"),
    limits : {fileSize:3e7} // 30mb
})

// Note: .fields method is used when we want to accept the file uploads from multiple fields.
// as well as specifying the number of files which user can upload from the each field.
bookRouter.post("/",authenticate,upload.fields([
    {name:"coverImage", maxCount:1},
    {name: "file", maxCount:1}
]),createBook)

bookRouter.patch("/:bookId",authenticate, upload.fields([
    {name:"coverImage", maxCount:1},
    {name: "file", maxCount:1}
]),updateBook)

bookRouter.get("/",listBooks)

bookRouter.get("/:bookId",getSingleBook)

bookRouter.delete("/:bookId",authenticate, deleteBook)



export default bookRouter;