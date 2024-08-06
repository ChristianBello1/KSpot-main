import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Controllo delle variabili d'ambiente di Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary environment variables are missing');
  process.exit(1);
}

// Log delle variabili d'ambiente di Cloudinary (solo per debug, rimuovere in produzione)
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '****' : undefined
});

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import session from "express-session";
import mainRoutes from "./routes/mainRoutes.js";
import authRoutes from './routes/authRoutes.js';
import soloistRoutes from './routes/soloistRoutes.js';
import passport from './config/passportConfig.js';

// ... resto del codice rimane invariato

import {
  badRequestHandler,
  unauthorizedHandler,
  notFoundHandler,
  genericErrorHandler,
} from "./middlewares/errorHandlers.js";

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connesso"))
  .catch((err) => {
    console.error("Errore di connessione MongoDB:", err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api", mainRoutes); // Questo ora include le rotte admin
app.use("/api/soloists", soloistRoutes);

// Gestore di errori globale
app.use((err, req, res, next) => {
  console.error('Errore del server:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Altri gestori di errore
app.use(badRequestHandler);
app.use(unauthorizedHandler);
app.use(notFoundHandler);
app.use(genericErrorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
  console.log("Rotte disponibili:");
  console.table(
    listEndpoints(app).map((route) => ({
      path: route.path,
      methods: route.methods.join(", "),
    }))
  );
});