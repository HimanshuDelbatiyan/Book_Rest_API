import mongoose from "mongoose";
import { Book } from "./bookTypes";

const Schema = mongoose.Schema;

const bookSchema = new Schema<Book>
(
    {
        title:{type:String,required:true},
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        coverImage: {type:String, required:true},
        file: {type:String,required:true},
        genre: {type:String,required:true},
    },
    {
        timestamps: true, // This will automatically adds the timeStamp like createdAt and UpdatedAt etc.
        collection:"book"
    }
)

const Model = mongoose.model<Book>("book",bookSchema);

export default Model;

