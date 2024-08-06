import { verifyJWT } from '../utils/jwt.js';
import User from '../models/UserModel.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
// console.log("Auth Header:", authHeader); // Log per debug

    if (!authHeader) {
      return res.status(401).json({ message: 'Token mancante' });
    }

    const parts = authHeader.split(' ');
// console.log("Auth Header parts:", parts);

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Formato del token non valido' });
    }

    const token = parts[1];
// console.log("Token estratto:", token);

    const decoded = await verifyJWT(token);
// console.log("Token decodificato:", decoded);

    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Utente non trovato' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Errore di autenticazione:", error);
    res.status(401).json({ message: 'Token non valido', error: error.message });
  }
};

export const checkAdminPermission = (req, res, next) => {
  if (req.user && req.user.ruolo === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Accesso negato. Richiesti permessi di amministratore." });
  }
};