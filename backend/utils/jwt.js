// Importa la libreria jsonwebtoken per gestire i JSON Web Tokens
import jwt from 'jsonwebtoken';

// Funzione per generare un token JWT
export const generateJWT = (payload) => {
  // Restituisce una Promise per gestire l'operazione in modo asincrono
  return new Promise((resolve, reject) => 
    // Utilizza il metodo sign di jwt per creare un nuovo token
    jwt.sign(
      payload, // Il payload contiene i dati che vogliamo includere nel token (es. ID utente)
      process.env.JWT_SECRET, // La chiave segreta usata per firmare il token, memorizzata nelle variabili d'ambiente
      { expiresIn: "1 day" }, // Opzioni: imposta la scadenza del token a 1 giorno
      (err, token) => {
        // Callback che gestisce il risultato dell'operazione
        if (err) reject(err); // Se c'è un errore, rifiuta la Promise
        else resolve(token);  // Altrimenti, risolve la Promise con il token generato
      }
    )
  );
};

// Funzione per verificare un token JWT
export const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("Errore nella verifica del JWT:", err);
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};