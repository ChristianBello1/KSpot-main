import mongoose from 'mongoose';
import { Comment } from './CommentModel.js';

// Schema per i membri
const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  photo: { type: String },
  stageName: { type: String },
  birthday: { type: Date },
  zodiacSign: { type: String },
  height: { type: Number },
  weight: { type: Number },
  mbtiType: { type: String },
  nationality: { type: String },
  instagram: { type: String },
  bio: { type: String },
  position: { type: [String] }
}, { _id: true });

// Schema principale per il gruppo
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
    twitter: String,
    facebook: String
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

groupSchema.index({ name: 1, type: 1 });
groupSchema.index({ 'members.name': 1 });

export const Group = mongoose.model('Group', groupSchema);