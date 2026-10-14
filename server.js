import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import helmet from 'helmet';
import router from './app/routes.js';
import connectDB from './app/config/databse.js';
import morgan from 'morgan';

const app = express();

connectDB();

// Helmet helps you secure your Express apps by setting various HTTP headers
app.use(helmet());

//Enable CORS
app.use(cors({
    origin: process.env.CLIENT_URL.split(',') ?? false,
}))

//HTTP request logger
if(process.env.NODE_ENV == 'development') app.use(morgan('dev'));

// Parse incoming request bodies
app.use(express.json({'limit': '50mb'}));

// Define a simple route to check if the API is running
app.get('/', (req, res)=>{
    res.send('API is running...')
});

//API routes
app.use('/api',router)

// Start the server
app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
});

//error handling
app.use((req, res)=>res.sendStatus(404).json({ message: 'Route not found'}))

app.use((err, req, res, next)=> {
    console.error(err);
    res.sendStatus(500).json({ message: 'Internal server error' });
})