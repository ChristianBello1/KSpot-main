import User from '../models/UserModel.js';
import { Group } from '../models/GroupModel.js';
import { Soloist } from '../models/SoloistModel.js';
import mongoose from 'mongoose';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('gruppiPreferiti')
      .populate('solistiPreferiti');
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json(user);
  } catch (error) {
    console.error('Errore nel recupero del profilo:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        ...req.body,
        avatar: req.file ? req.file.path : req.user.avatar
      },
      { new: true }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { artistId, artistType } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    if (!user.preferiti) {
      user.preferiti = [];
    }

    const existingFavorite = user.preferiti.find(fav => fav.id.toString() === artistId && fav.type === artistType);
    if (!existingFavorite) {
      // Assicurati che artistType sia 'Group' o 'Soloist'
      const validType = artistType === 'Group' ? 'Group' : 'Soloist';
      user.preferiti.push({ id: artistId, type: validType });
    }

    await user.save();
    res.json(user.preferiti);
  } catch (error) {
    console.error('Errore nell\'aggiunta del preferito:', error);
    res.status(500).json({ message: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { artistId, artistType } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    user.preferiti = user.preferiti.filter(fav => 
      !(fav.id.toString() === artistId && fav.type === artistType)
    );

    await user.save();
    
    // Restituisci la lista aggiornata dei preferiti
    res.json(user.preferiti);
  } catch (error) {
    console.error('Errore nella rimozione del preferito:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('preferiti.id');
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    const favorites = user.preferiti ? user.preferiti.map(fav => ({
      id: fav.id._id,
      name: fav.id.name,
      type: fav.type,
      coverImage: fav.id.coverImage || fav.id.photo
    })) : [];
    res.json(favorites);
  } catch (error) {
    console.error('Errore nel recupero dei preferiti:', error);
    res.status(500).json({ message: 'Errore nel recupero dei preferiti', error: error.message });
  }
};