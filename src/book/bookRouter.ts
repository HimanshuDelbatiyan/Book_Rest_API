import express from "express"; 
// Importing the Router Handlers 
import { createBook ,updateBook, listBooks, getSingleBook, deleteBook} from "./bookControllers";
import multer from "multer";
// Authentication Method
import authenticate from "../middleware/authenticate";
import path from "path";

// Creating the Router instance.
const bookRouter = express.Router();

// Defining and Configuring the Multer (An API for Handling the media uploaded by the user)
const upload = multer(
    {
        // Note: By using the ".resolve" we are saying that inside the directory we are perform the specified operation
        dest: path.resolve(__dirname, "../../public/data/uploads"),
        limits : {fileSize:3e7} // Specifying the "Individual File Size"
    }
)

// Note: .fields method is used when we want to accept the file uploads from multiple fields.
// as well as specifying the number of files which user can upload from the each field.
// Importantly, we have already defined the "File Size Limit for each"
// ---------------> POST Method (Create)
bookRouter.post("/",authenticate,upload.fields([
    {name:"coverImage", maxCount:1},
    {name: "file", maxCount:1}
]),createBook)

//-------------> Patch Method (Update)
bookRouter.patch("/:bookId",authenticate, upload.fields([
    {name:"coverImage", maxCount:1},
    {name: "file", maxCount:1}
]),updateBook)

// -----------> GET Method (List all the books)
bookRouter.get("/",listBooks)
//-----------> GET Method (Retrieve Single Book)
bookRouter.get("/:bookId",getSingleBook)
// ----------> Delete Method (Deletes an Single Book)
bookRouter.delete("/:bookId",authenticate, deleteBook)

// Importing to be used by other modules
export default bookRouter;