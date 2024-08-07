import express from 'express';
import User from '../models/UserModel.js';
import { generateJWT } from '../utils/jwt.js';
import passport from '../config/passportConfig.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { avatarUploader } from '../middlewares/cloudinaryUploader.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const router = express.Router();

router.post('/register', avatarUploader.single('avatar'), async (req, res) => {
  try {
    const { nome, cognome, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata' });
    }
    
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = req.file.path;
    }

    const newUser = new User({ nome, cognome, email, password, avatar: avatarUrl });
    await newUser.save();
    
    const token = await generateJWT({ id: newUser._id });
    const userData = newUser.toObject();
    delete userData.password;
    
    res.status(201).json({ token, user: userData, message: "Registrazione effettuata con successo" });
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Credenziali non valide' });
    }
    
    const token = await generateJWT({ id: user._id });
    res.json({ token, message: "Login effettuato con successo" });
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login` }),
  async (req, res) => {
    try {
      const token = await generateJWT({ id: req.user._id });
      res.redirect(`${FRONTEND_URL}/login?token=${token}`);
    } catch (error) {
      console.error("Errore nella generazione del token per Google OAuth:", error);
      res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

router.get('/me', authMiddleware, (req, res) => {
  console.log("Richiesta /me ricevuta");
  const userData = req.user.toObject();
  delete userData.password;
  res.json(userData);
});

export default router;