import app from './src/app';
import {config} from "./src/config/config"
import connectDB from './src/config/db';

const startServer = () =>
    {

        // Connecting to the Database
        connectDB();    

        // Using the port stored inside the environment variables.
        const port = config.port;

        app.listen(port,()=>
        {
            console.log(`Server is listening on PORT ${port}`)
        })
    }

    startServer()