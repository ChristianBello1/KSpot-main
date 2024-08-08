import mongoose from 'mongoose';
import { Comment } from './CommentModel.js';

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String },
  stageName: { type: String },
  birthday: { type: Date },
  zodiacSign: { type: String },
  height: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function(v) {
        return v === 'N/A' || (typeof v === 'number' && v > 0);
      },
      message: props => `${props.value} non è un'altezza valida!`
    }
  },
  weight: {
    type: mongoose.Schema.Types.Mixed,
    validate: {
      validator: function(v) {
        return v === 'N/A' || (typeof v === 'number' && v > 0);
      },
      message: props => `${props.value} non è un peso valido!`
    }
  },
  mbtiType: { type: String },
  nationality: { type: String },
  instagram: { type: String },
  bio: { type: String },
  position: { type: [String] }
}, { _id: true });

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String },
  members: [memberSchema],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  type: {
    type: String,
    enum: ['male-group', 'female-group'],
    required: true
  },
  debutDate: { type: Date },
  company: { type: String },
  fanclubName: { type: String },
  socialMedia: {
    youtube: String,
    x: String,
    instagram: String
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

groupSchema.index({ name: 1, type: 1 });
groupSchema.index({ 'members.name': 1 });

export const Group = mongoose.model('Group', groupSchema);