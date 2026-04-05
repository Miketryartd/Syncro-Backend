import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import 'dotenv/config';

import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const port = 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static('uploads'));

const STORAGE_MODE = process.env.STORAGE_MODE || 'local';
let upload: multer.Multer;

if (STORAGE_MODE === 'local') {
    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, process.env.LOCAL_UPLOAD_PATH || "uploads"),
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        },
    });
    upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });
} else if (STORAGE_MODE === 'cloud') {
    const { v2: cloudinary } = await import('cloudinary');
    const { CloudinaryStorage } = await import('multer-storage-cloudinary');
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
        api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
    });
    const storage = new CloudinaryStorage({
        cloudinary,
        params: { folder: 'user_uploads', allowed_formats: ['jpg', 'png', 'pdf'] } as any,
    });
    upload = multer({ storage });
} else {
    upload = multer();
}

const allowedOrigins = [process.env.FRONTEND_URL_PROD, process.env.FRONTEND_URL];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed for this origin'));
        }
    },
    credentials: true,
}));

mongoose.connect(process.env.MONGO_URI_SIKRET_KEY as string)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Backend is running!'));

app.use('/', authRoutes);
app.use('/', fileRoutes(upload));
app.use('/', quizRoutes);
app.use('/', userRoutes);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));