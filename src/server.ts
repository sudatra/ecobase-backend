import express from 'express';
import { connectToDatabase, disconnectFromDatabase } from './utils/db';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
 
process.on('SIGINT', async () => {
    await disconnectFromDatabase(); 
    process.exit(0);
});

 
connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    }); 
}).catch((err) => {
    console.log(`Error occured: ${err}`)
})



