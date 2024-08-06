import mongoose from "mongoose";
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cognome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  avatar: { type: String },
  ruolo: { 
    type: String, 
    enum: ['utente', 'admin'],
    default: 'utente'
  },
  googleId: { type: String, unique: true, sparse: true },
  permessi: {
    aggiungiGruppo: { type: Boolean, default: false },
    modificaGruppo: { type: Boolean, default: false },
    eliminaGruppo: { type: Boolean, default: false },
    gestisciCommenti: { type: Boolean, default: false }
  },
  preferiti: [{
    type: { type: String, enum: ['Group', 'Soloist'] },
    id: { type: mongoose.Schema.Types.ObjectId, refPath: 'preferiti.type' }
  }]
}, {
  timestamps: true,
  collection: "users"
});


userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("User", userSchema);
