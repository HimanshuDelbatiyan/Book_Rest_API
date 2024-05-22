import { Request, Response, NextFunction, raw } from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
import createHttpError from "http-errors";
import BookModel from "../book/bookModel";
import fs from "fs";
import { AuthRequest } from "../middleware/authenticate";

const createBook = async (req:Request,res:Response,next:NextFunction) =>
{

   try
   {

      const {title, genre}  = req.body;

      // Note: As user is uploading the multiple files so multiple files
      //data will be attached to the request object after processing by the multer
      console.log("files",req.files);

      //?????
      const files = req.files as {[filename:string]:Express.Multer.File[]};

      const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
      const filename = files.coverImage[0].filename;
      const filePath = path.resolve(__dirname,"../../public/data/uploads",filename);

      const uploadResult = await cloudinary.uploader.upload(filePath,{
         filename_override:filename,
         folder : "book-covers",
         format: coverImageMimeType
      }) 
      
      const bookFileName = files.file[0].filename;
      const bookFilePath = path.resolve(__dirname,"../../public/data/uploads", bookFileName)
      const bookFileFormat = files.file[0].mimetype;
      
      const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath,{
         resource_type: "raw",
         filename_override: bookFileName,
         folder: "book-pdfs",
         format: "pdf"
      }) 

      //?????????????????????????
      const _req = req as AuthRequest

      //@ts-ignore
      console.log(req.userId)

      const newBook = await BookModel.create({
         title,
         genre,
         //@ts-ignore
         author : req.userId ,
         coverImage: uploadResult.secure_url,
         file: bookFileUploadResult.secure_url

      })

      // Delete Temp Files from the local storage

      await fs.promises.unlink(filePath)
      await fs.promises.unlink(bookFilePath)

      res.status(210).json({id: newBook._id})
   }
   catch(err)
   {
      console.log(err);
      next(createHttpError(500, "Error While uploading the files to the Cloud"))
   }
}

const updateBook = async (req:Request, res:Response, next:NextFunction) =>
   {
      const {title, genre}  = req.body;

      const bookId = req.params.bookId

      const book = await BookModel.findOne({_id:bookId})

      if(!book)
      {
         return res.status(404).json({message:"Book Not Found"})
      }
      

      // Access Checking
      //@ts-ignore
      if(book.author.toString() !== req.userId)
      {
         // 403 --> Unauthorized
         return res.status(403).json({message:"Unauthorized"})
      }

      let completeCoverImage = "";


           //?????
      const files = req.files as {[filename:string]:Express.Multer.File[]};

      // @ts-ignore
      if(files.coverImage)
      {
         const fileName = files.coverImage[0].filename;
         const coverMimeType = files.coverImage[0].mimetype.split("/").at(-1);

         const filePath = path.resolve(__dirname, "../../public/data/uploads" , fileName)

         completeCoverImage = `${fileName}.${coverMimeType}`;

         const uploadResult = await cloudinary.uploader.upload(filePath,{filename_override:fileName, folder:"book-covers",format:coverMimeType});

         completeCoverImage = uploadResult.secure_url;

         await fs.promises.unlink(filePath);

      }


      let completeFileName = ""
      if(files.file)
      {  
         const bookFilePath = path.resolve(__dirname, "../../public/data/uploads", files.file[0].filename)

         const bookFileName = files.file[0].filename;

         const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath,{resource_type: "raw", filename_override: bookFileName, folder: "book-pdfs",format:"pdf"})


         completeFileName = uploadResultPdf.secure_url;

         await fs.promises.unlink(bookFilePath);
      
      }

      const updatedBook = await BookModel.findOneAndUpdate({_id: bookId},{
         title,
         genre,
         coverImage: completeCoverImage ? completeCoverImage : book.coverImage,

      },{new:true})


      res.json(updatedBook);
   }

const listBooks = async (req:Request, res:Response, next: NextFunction) =>
   {
      try 
      {
         const book = await BookModel.find(); 

         res.json(book)
      } 
      catch (error) 
      {
         return next(createHttpError(500, "Error While getting books"))
         
      }
   }

const getSingleBook = async (req:Request, res: Response, next: NextFunction) => 
{
   const bookId = req.params.bookId;

   try 
   {
      const book = await BookModel.findOne({_id: bookId});

      if(!book)
      {
         return next(createHttpError(404, "No Books are associated with this id"))
      }
      res.json(book);
   }
    catch (error) 
   {
      return next(createHttpError(500, "Error While getting a book"))
      
   }
}

const deleteBook = async (req:Request, res: Response, next:NextFunction) =>
   {
      const bookId = req.params.bookId;

      const book = await BookModel.findOne({_id:bookId});

      if(!book)
      {  
         return next(createHttpError(404, "Book Not Found"))
      }
      
      //@ts-ignore
      if(book.author.toString() !== req.userId)
      {
         return next(createHttpError(403, "Unauthenticated Operation"))
      }

      const coverFileSplits = book.coverImage.split("/");
      const coverImagePublicId = coverFileSplits.at(-2) + 
      "/" + (coverFileSplits.at(-1)?.split(".").at(-2))

      console.log("Cover Public ID", coverImagePublicId)


      const bookFileSplits = book.file.split("/")
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

export {createBook, updateBook, listBooks, getSingleBook, deleteBook}