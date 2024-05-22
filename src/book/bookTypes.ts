// Importing the User Type
// Which specifies the thing need to be specified when defining an "User"
import { User } from "../user/userTypes";


// Defining an interface which will specify what things need to be specified
// When defining an "Book" as well as with their type
export interface Book
{
    _id:string;

    title:string;

    author: User;

    genre:string;

    coverImage: string;

    file: string;

}