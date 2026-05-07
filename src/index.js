import 'dotenv/config';
import { connectAuthDatabase } from './config/database.js';
import app from './app.js';


const startServer = async () => {
    try {
        await connectAuthDatabase();
        app.on("error",(error) => {
            console.error("ERROR",error)
            throw error;
        });
        app.listen( process.env.PORT , () => {
            console.log(`Server is running on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("MongoDB Connection failed",error)
    }
};

startServer();