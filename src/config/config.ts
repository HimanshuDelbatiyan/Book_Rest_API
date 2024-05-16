import { config as conf} from "dotenv";
// Implementing the .env file inside we have defined the environment variables.
conf();

// Note: By Starting the name with the underscore we are 
// Specifying that this object is "PRIVATE"
const _config = 
{
    port: process.env.PORT,
    mongoURL: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV
}

// By using the "Object.freeze()" we are making the object.
// Readonly. 
// This method takes the object as argument and return a readonly object.
export const config = Object.freeze(_config);