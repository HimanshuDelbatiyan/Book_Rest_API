import mongoose from "mongoose";
import { User } from "./userTypes";

// here we are also defining the type of the Schema we are defining which is like the user interface
const userSchema = new mongoose.Schema<User>({
    name: {type:String,require:true},
    email: {type:String, unique:true, require:true},
    password: {type:String,require:true}
},{
    timestamps:true,
    collection: "user"
})


const Model = mongoose.model<User>("user",userSchema)


export default Model;

