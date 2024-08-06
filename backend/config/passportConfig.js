import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/UserModel.js';

// Funzione per caricare le variabili d'ambiente se necessario
function loadEnvIfNeeded() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const envPath = path.resolve(__dirname, '../.env');

    try {
      const envConfig = fs.readFileSync(envPath, 'utf8')
        .split('\n')
        .filter(line => line.trim() !== '' && !line.startsWith('#'))
        .reduce((acc, line) => {
          const [key, value] = line.split('=');
          acc[key.trim()] = value.trim();
          return acc;
        }, {});

      Object.assign(process.env, envConfig);
    } catch (error) {
      console.error('Error loading .env file:', error);
    }
  }
}

// Carica le variabili d'ambiente se necessario
loadEnvIfNeeded();

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials are missing');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          user = new User({
            googleId: profile.id,
            nome: profile.name.givenName,
            cognome: profile.name.familyName,
            email: profile.emails[0].value,
            avatar: profile.photos[0].value,
          });
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;