import {v2 as cloudinary} from "cloudinary";
import { config } from "./config";

// Configuration
cloudinary.config({ 
    cloud_name: config.cloudName, 
    api_key: config.apiKey, 
    api_secret: config.cloudSecret
});

export default cloudinary;