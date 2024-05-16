import app from './src/app';

const startServer = () =>
    {
        const port = 3001;

        app.listen(port,()=>
        {
            console.log(`Server is listening on PORT ${port}`)
        })
    }

    startServer()