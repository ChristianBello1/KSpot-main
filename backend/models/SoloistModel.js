import mongoose from 'mongoose';
import { Comment } from './CommentModel.js';

const soloistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  stageName: String,
  birthday: Date,
  zodiacSign: String,
  height: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function(v) {
        return v === 'N/A' || (typeof v === 'number' && v > 0) || (typeof v === 'string' && !isNaN(parseFloat(v)) && parseFloat(v) > 0);
      },
      message: props => `${props.value} non è un'altezza valida!`
    }
  },
  weight: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function(v) {
        return v === 'N/A' || (typeof v === 'number' && v > 0) || (typeof v === 'string' && !isNaN(parseFloat(v)) && parseFloat(v) > 0);
      },
      message: props => `${props.value} non è un peso valido!`
    }
  },
  mbtiType: String,
  nationality: String,
  bio: String,
  company: String,
  debutDate: Date,
  photo: String,
  type: {
    type: String,
    enum: ['male-solo', 'female-solo'],
    required: true
  },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  socialMedia: {
    youtube: String,
    x: String,
    instagram: String
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export const Soloist = mongoose.model('Soloist', soloistSchema);