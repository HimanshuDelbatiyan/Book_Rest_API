import { Request, Response, NextFunction, raw } from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
import createHttpError from "http-errors";

const createBook = async (req:Request,res:Response,next:NextFunction) =>
{

   try
   {
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
         folder: "book_pdfs",
         format: "pdf"
      }) 
      

      









      res.json({CoverResult: uploadResult, pdfResult: bookFileUploadResult})
   }
   catch(err)
   {
      console.log(err);
      next(createHttpError(500, "Error While uploading the files to the Cloud"))
   }
}

export {createBook}