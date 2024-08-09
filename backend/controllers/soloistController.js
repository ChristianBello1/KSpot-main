import { Soloist } from '../models/SoloistModel.js';
import { Comment } from '../models/CommentModel.js';

export const createSoloist = async (req, res) => {
  try {
    let soloistData = req.body;
    
    // Gestione dei dati dei social media
    if (soloistData.socialMedia) {
      try {
        soloistData.socialMedia = JSON.parse(soloistData.socialMedia);
      } catch (error) {
        console.error("Errore nel parsing dei dati social media:", error);
        soloistData.socialMedia = {};
      }
    }

    // Gestione dei campi height e weight
    if (soloistData.height === 'N/A') {
      soloistData.height = 'N/A';
    } else {
      soloistData.height = parseFloat(soloistData.height) || null;
    }

    if (soloistData.weight === 'N/A') {
      soloistData.weight = 'N/A';
    } else {
      soloistData.weight = parseFloat(soloistData.weight) || null;
    }

    if (req.file) {
      soloistData.photo = req.file.path;
    }

    const newSoloist = new Soloist(soloistData);
    const savedSoloist = await newSoloist.save();
    res.status(201).json(savedSoloist);
  } catch (error) {
    console.error("8. Errore dettagliato nella creazione del solista:", error);
    res.status(400).json({ message: error.message });
  }
};

export const updateSoloist = async (req, res) => {
  try {
    let updates = {};
    if (req.body.soloistData) {
      updates = JSON.parse(req.body.soloistData);

      // Gestione dei campi height e weight
      if (updates.height === 'N/A') {
        updates.height = 'N/A';
      } else if (updates.height) {
        updates.height = parseFloat(updates.height) || null;
      }

      if (updates.weight === 'N/A') {
        updates.weight = 'N/A';
      } else if (updates.weight) {
        updates.weight = parseFloat(updates.weight) || null;
      }
    }

    if (req.file) {
      updates.photo = req.file.path;
    }

    const soloist = await Soloist.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!soloist) {
      return res.status(404).json({ message: 'Solista non trovato' });
    }
    res.json(soloist);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del solista:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getAllSoloists = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};
    const soloists = await Soloist.find(query);
    res.json(soloists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSoloistById = async (req, res) => {
  try {
    const soloist = await Soloist.findById(req.params.id)
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'nome cognome' },
          { 
            path: 'replies',
            populate: { path: 'author', select: 'nome cognome' }
          }
        ]
      });
    if (!soloist) {
      return res.status(404).json({ message: 'Solista non trovato' });
    }
    res.json(soloist);
  } catch (error) {
    console.error('Errore nel recupero del solista:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteSoloist = async (req, res) => {
  try {
    const soloist = await Soloist.findByIdAndDelete(req.params.id);
    if (!soloist) {
      return res.status(404).json({ message: 'Solista non trovato' });
    }
    res.json({ message: 'Solista eliminato con successo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchSoloists = async (query) => {
  try {
    const soloists = await Soloist.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { stageName: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ]
    });
    return soloists.map(soloist => ({...soloist.toObject(), type: 'soloist'}));
  } catch (error) {
    console.error('Errore nella ricerca dei solisti:', error);
    throw error;
  }
};

export const addComment = async (req, res) => {
  try {
    const { soloistId } = req.params;
    const { text, parentCommentId } = req.body;
    const userId = req.user._id;

    const soloist = await Soloist.findById(soloistId);
    if (!soloist) {
      return res.status(404).json({ message: 'Solista non trovato' });
    }

    const newComment = new Comment({
      text,
      author: userId,
      parentComment: parentCommentId
    });

    await newComment.save();

    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment) {
        parentComment.replies.push(newComment._id);
        await parentComment.save();
      }
    }

    // Inizializza l'array comments se non esiste
    if (!soloist.comments) {
      soloist.comments = [];
    }

    soloist.comments.push(newComment._id);
    await soloist.save();

    const populatedComment = await Comment.findById(newComment._id).populate('author', 'nome cognome');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Errore nell\'aggiunta del commento:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { soloistId, commentId } = req.params;
    const userId = req.user._id;

    const soloist = await Soloist.findById(soloistId);
    if (!soloist) {
      return res.status(404).json({ message: 'Solista non trovato' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commento non trovato' });
    }

    if (comment.author.toString() !== userId.toString() && req.user.ruolo !== 'admin') {
      return res.status(403).json({ message: 'Non autorizzato a eliminare questo commento' });
    }

    // Rimuovi il commento dal gruppo
    soloist.comments.pull(commentId);
    await soloist.save();

    // Se è una risposta, rimuovila dal commento genitore
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId }
      });
    }

    // Elimina il commento e tutte le sue risposte
    await Comment.deleteMany({ $or: [{ _id: commentId }, { parentComment: commentId }] });

    res.json({ message: 'Commento eliminato con successo' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { soloistId, commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commento non trovato' });
    }

    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const replyToComment = async (req, res) => {
  try {
    const { soloistId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const soloist = await Group.findById(soloistId);
    if (!soloist) {
      return res.status(404).json({ message: 'Solista non trovato' });
    }

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: 'Commento non trovato' });
    }

    const newReply = new Comment({
      text,
      author: userId,
      parentComment: commentId
    });

    await newReply.save();

    parentComment.replies.push(newReply._id);
    await parentComment.save();

    // Aggiungi la nuova risposta anche all'array comments del gruppo/solista
    soloist.comments.push(newReply._id);
    await soloist.save();

    const populatedReply = await Comment.findById(newReply._id)
      .populate('author', 'nome cognome');

    res.status(201).json(populatedReply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};