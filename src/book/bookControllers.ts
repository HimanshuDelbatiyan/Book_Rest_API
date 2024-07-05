import { Request, Response, NextFunction, raw } from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
import createHttpError from "http-errors";
import BookModel from "../book/bookModel";
import fs from "fs";
import { AuthRequest } from "../middleware/authenticate";


// This method will insert the new book into the "books" collection as well 
// as upload the uploaded documents to "Cloudinary Cloud"
const createBook = async (req:Request,res:Response,next:NextFunction) =>
{
   try
   {
      const {title, genre,description}  = req.body;

      // Note: As user is uploading the multiple files so multiple files
      //data will be attached to the request object after processing by the multer
      console.log("files",req.files);

      // This is not necessary but the TypScript will show error which can be ignored
      const files = req.files as {[filename:string]:Express.Multer.File[]};

      // Getting the Cover Image Type, location and name
      const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
      const filename = files.coverImage[0].filename;
      const filePath = path.resolve(__dirname,"../../public/data/uploads",filename);

      // Using the Cloudinary to upload the cover images to the cloud
      // Note: This method return the object of the uploaded document containing lots of information about the upload
      const uploadResult = await cloudinary.uploader.upload(filePath,
         {
            filename_override:filename, // Overriding the file name or can use UUID Package for unique name
            folder : "book-covers", // Specifying the folder
            format: coverImageMimeType, // Specifying the "Extension" of the file
            resource_type: "image" // Specifying the resource type like image video etc
         }
      )

      // Getting the Book File Type, location and name
      const bookFileName = files.file[0].filename;
      const bookFilePath = path.resolve(__dirname,"../../public/data/uploads", bookFileName)

      // Using the Cloudinary to upload the cover images to the cloud
      // Note: This method return the object of the uploaded document containing lots of information about the upload
      const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath,{
         resource_type: "raw", // Specifying the type of resource like "raw" is for "pdf's or text file"
         filename_override: bookFileName,
         folder: "book-pdfs",
         format: "pdf" // Specifying the "Extension" of the file
      })

      // --> FOCUS 
      // So what we are doing here is that we are indirectly accessing the value of the variable
      // Defined in the interface called AuthRequest and in the same way we set the value of this variable
      // We just need to have an Variable to inherit that type using "as" and then we can the do the normal operations
      const _req = req as AuthRequest

      console.log(_req.userId) // Log the user id into the console.

      // Creating a new Book Document
      const newBook = await BookModel.create({
         title,
         genre,
         author : _req.userId ,
         description,
         coverImage: uploadResult.secure_url, // Publicly Accessible Secure URL for Book Cover Image
         file: bookFileUploadResult.secure_url //
      })

      // Delete Temp Files from the local storage using the "fs" package
      await fs.promises.unlink(filePath)
      await fs.promises.unlink(bookFilePath)

      // Send the response to the user
      // Status: 201 Means a new resource created
      res.status(201).json({id: newBook._id})
   }
   catch(err)
   {
      console.log(err);
      next(createHttpError(500, "Error While uploading the files to the Cloud"))
   }
}

// Updates the existing book with the new information
// Pending does not delete the old uploads to cloud
const updateBook = async (req:Request, res:Response, next:NextFunction) =>
   {
      const {title, genre,description}  = req.body;

      // Getting the ID sent with the URL
      const bookId = req.params.bookId

      // Finding the book associated with that ID
      const book = await BookModel.findOne({_id:bookId})

      if(!book) // If empty
      {
         return next(createHttpError(404,"Error: No Book Found"))
      }

      // Indirectly Value Accessing
      const _req = req as AuthRequest;

      // Access Checking
      if(book.author.toString() !== _req.userId)
      {
         // 403 --> Forbidden / Not rights to make the changes
         return next(createHttpError(403,"Error: No Rights to make changes"))
      }

      // Split the Cover Image stored URL based on "/"
      const coverFileSplits = book.coverImage.split("/");
      // Then find the public id of the upload
      const oldCoverImagePublicId = coverFileSplits.at(-2) +
      "/" + (coverFileSplits.at(-1)?.split(".").at(-2))

      console.log("OLD Cover Cloudinary Public ID", oldCoverImagePublicId)

      // Split the Book File Stored URL based on "/"
      const bookFileSplits = book.file.split("/");
      // Then find the Public ID
      const oldBookFilePublicId = bookFileSplits.at(-2) + "/"
      + bookFileSplits.at(-1)

      console.log("OLD File Cloudinary Public ID", oldBookFilePublicId)


      // For Book Cover
      let completeCoverImage = "";
      // For Book File
      let completeFileName = ""

      // Not Needed but alright
      const files = req.files as {[filename:string]:Express.Multer.File[]};

      // Cloud Book Cover Image
      try
      {
         // if the user sends the cover image
         if(files.coverImage)
         {

            // Getting the name,type and path
            const fileName = files.coverImage[0].filename;
            const coverMimeType = files.coverImage[0].mimetype.split("/").at(-1);
            const filePath = path.resolve(__dirname, "../../public/data/uploads" , fileName)

            // Image name with extension
            completeCoverImage = `${fileName}.${coverMimeType}`;

            // Uploading the image to the cloud using the cloudinary
            const uploadResult = await cloudinary.uploader.upload(filePath,
               {
                  filename_override:fileName, folder:"book-covers",
                  format:coverMimeType,
                  resource_type: "image"
               });

            completeCoverImage = uploadResult.secure_url;

            // Delete the Temp File
            await fs.promises.unlink(filePath);

            try // Removing the OLD UPLOADS From the Cloud
            {
               await cloudinary.uploader.destroy(oldCoverImagePublicId);
            }
            catch(err)
            {
               return next(createHttpError(500, "Error While deleting the Cover Image from the Cloud"))
            }
         }
      }
      catch(err)
      {
         return next(createHttpError(500,"Error While uploading the Cover file to cloud"))
      }

      // Cloud Book File
      try
      {
         if(files.file)
         {
            // Getting the file name and path
            const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", files.file[0].filename)
            const bookFileName = files.file[0].filename;

            // Uploading the file to cloud
            const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath,
            {
               resource_type: "raw", // This is must for PDF's File
               filename_override: bookFileName,
               folder: "book-pdfs",
               format:"pdf"
            })

            completeFileName = uploadResultPdf.secure_url;

            // Delete the Temp File Stored at LocalStorage
            await fs.promises.unlink(bookFilePath);

            try // Removing the OLD UPLOADS From the Cloud
            {
               await cloudinary.uploader.destroy
               (oldBookFilePublicId, {resource_type: "raw"});
               // Note: Have to do this for file type PDF's like defining the resource
            }
            catch(err)
            {
               return next(createHttpError(500, "Error While deleting the File PDF from the Cloud"))
            }
         }
      } catch(err)
      {
         return next(createHttpError(500,"Error While uploading the Pdf to cloud"))
      }

      // Database
      try
      {
         // Find the book associated with the ID sent with the URL
         const updatedBook = await BookModel.findOneAndUpdate({_id: bookId},
            {
               title,
               genre,
               description,
               author:_req.userId,
               // using the ternary operator
               // if the user uploads a new cover image then that will be used otherwise old will be used
               // same with the book pdf file
               coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
               file: completeFileName ? completeFileName : book.file
            }
         ,{new:true}) // By passing the "new" as we are saying that return the updated document not the before updating

         // Status Code --> 200 means update is successful
         res.status(200).json(updatedBook); // Return the updated book document as response
      }catch(err)
      {
         return next(createHttpError(500, "Error while updating the document in Database"))
      }
   }


// This method lists all the books present in the database
const listBooks = async (req:Request, res:Response, next: NextFunction) =>
   {
      const sleep = await new Promise((resolve,reject)=>{setTimeout(resolve,5000)})

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 9;

      console.log(page)
      console.log(limit)

      const skipDocuments = (page - 1) * limit;


      try {


         // Here, the ".populate()" method replaces the referenced field/specified path with the actual document from the other collection.
         // Which for now is the "author" field.

         const book = await BookModel.find().populate("author", "name").skip(skipDocuments).limit(limit)

         // Response to the user.
         res.json(book);
      }
      catch (error)
      {
         return next(createHttpError(500, "Error While getting books"))
      }
   }


// Retrieves the single book and sent that book document as response to the user
const getSingleBook = async (req:Request, res: Response, next: NextFunction) =>
{
   // Getting the book id from the URL
   const bookId = req.params.bookId;

   try
   {
      // Find the specific book
      const book = await BookModel.findOne({_id: bookId}).populate("author","name");

      if(!book) // if empty
      {
         return next(createHttpError(404, "No Books are associated with this id"))
      }
      // just send the retrieved book document
      res.json(book);
   }
    catch (error)
   {
      return next(createHttpError(500, "Error While getting a book"))
   }
}

// Deletes the specific Book from the modal as well as remove the media associated with book from the cloud
const deleteBook = async (req:Request, res: Response, next:NextFunction) =>
   {
      const bookId = req.params.bookId; // Getting the book id from the URL

      // Retrieving the specific book
      const book = await BookModel.findOne({_id:bookId});

      if(!book) // if empty
      {
         return next(createHttpError(404, "Book Not Found"))
      }

      const _req = req as AuthRequest;

      if(book.author.toString() !== _req.userId)
      {
         return next(createHttpError(403, "Unauthenticated Operation"))
      }

      // Split the Cover Image stored URL based on "/"
      const coverFileSplits = book.coverImage.split("/");
      // Then find the public id of the upload
      const coverImagePublicId = coverFileSplits.at(-2) +
      "/" + (coverFileSplits.at(-1)?.split(".").at(-2))

      console.log("Cover Public ID", coverImagePublicId)


      // Split the Book File Stored URL based on "/"
      const bookFileSplits = book.file.split("/");
      // Then find the Public ID
      const bookFilePublicId = bookFileSplits.at(-2) + "/"
      + bookFileSplits.at(-1)

      console.log("File Public ID", bookFilePublicId)

      try
      {
         await cloudinary.uploader.destroy(coverImagePublicId);

         await cloudinary.uploader.destroy
         (bookFilePublicId, {resource_type: "raw"});
         // Note: Have to do this for file type PDF's

         await BookModel.deleteOne({_id:bookId})

         // Status Code for Deleting the resource 204
         res.sendStatus(204)
      }
      catch(err)
      {
         return next(createHttpError(500, "Error While deleting the files from the Cloud"))
      }
   }

/**
 * This method takes the following parameters and list the specific user book
  * @param req
 * @param res
 * @param next
 */
const listSpecificBooks  = async (req:Request,res:Response,next:NextFunction) =>
{
   const sleep = await new Promise((resolve,reject)=>{setTimeout(resolve,5000)})

   const page = Number(req.query.page) || 1;
   const limit = Number(req.query.limit) || 10;

   console.log(page)
   console.log(limit)

   const skipDocuments = (page - 1) * limit;

   try {

      const _req = req as AuthRequest

      // Here, the ".populate()" method replaces the referenced field/specified path with the actual document from the other collection.
      // Which for now is the "author" field.
      const books = await BookModel.find({author:_req.userId}).populate("author", "name").skip(skipDocuments).limit(limit)

      // Response to the user.
      res.json(books);
   }
   catch (error)
   {
      return next(createHttpError(500, "Error While getting books"))
   }
}

export {createBook, updateBook, listBooks, getSingleBook, deleteBook,listSpecificBooks}