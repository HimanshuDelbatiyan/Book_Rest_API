import mongoose from "mongoose";
import { Book } from "./bookTypes";

const Schema = mongoose.Schema;
                            // Type Specification (It is important so that we only have the specific format document stored inside the
                            // Collection.
const bookSchema = new Schema<Book>
(
    {
        title:{type:String,required:true},
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user", // Specifying to which Collection This ID will belong to
            required: true
        },
        description:{type:String,required:true},
        coverImage: {type:String, required:true},
        file: {type:String,required:true},
        genre: {type:String,required:true},
    },
    {
        // IMP
        timestamps: true, // This will automatically adds the timeStamp like createdAt and UpdatedAt etc.
        collection:"book" // Specifying the collection for which this "Schema" is generated
    }
)
                            // Type Specification
const Model = mongoose.model<Book>("book",bookSchema);

export default Model;

