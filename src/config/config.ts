// Importing the package which will allows us to manage the "Environment Variable" in a simple way
import { config as conf} from "dotenv";
// By Executing this method we are reading the environment variables defined within the ".env" file
// and adding them to the "Current Running Application " "process.env" object
// Which are then accessible to use.
conf();

// Note: By Starting the name with the underscore we are 
// Specifying that this object is "PRIVATE"
// JUST AN CONVENTION
const _config = 
{
    port: process.env.PORT,
    mongoURL: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudSecret: process.env.CLOUDINARY_SECRET,
    frontEndDomain : process.env.FRONTEND_DOMAIN
}

// By using the "Object.freeze()" we are making the object.
// Readonly. 
// This method takes the object as argument and return a readonly object.
export const config = Object.freeze(_config);