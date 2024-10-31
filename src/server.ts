import express from 'express';
import { connectToDatabase, disconnectFromDatabase } from './utils/db';
import dotenv from 'dotenv';
import passport from './auth/middlewares/passportConfig';
import authRoutes from './auth/routes/authRoutes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(passport.initialize());

app.use('/auth', authRoutes)
 
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



