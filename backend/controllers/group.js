import { Group } from '../models/GroupModel.js';
import { Comment } from '../models/CommentModel.js';

export const getAllGroups = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type) {
      query.type = type;
    }
    const groups = await Group.find(query);
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
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
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    res.json(group);
  } catch (error) {
    console.error('Errore nel recupero del gruppo:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createGroup = async (req, res, next) => {
  try {
    let groupData = JSON.parse(req.body.groupData);
    
    if (req.file) {
      groupData.coverImage = req.file.path;
    }

    const newGroup = new Group(groupData);
    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error("9. Errore dettagliato nella creazione del gruppo:", error);
    next(error);
  }
};

export const updateGroup = async (req, res) => {
  try {
    let updates = JSON.parse(req.body.groupData);
    
    if (req.file) {
      updates.coverImage = req.file.path;
    }
    
    const group = await Group.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    res.json(group);
  } catch (error) {
    console.error('Errore nell\'aggiornamento del gruppo:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    res.json({ message: 'Gruppo eliminato con successo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMemberToGroup = async (req, res) => {
  try {
    console.log('Dati ricevuti:', req.body);
    console.log('File ricevuto:', req.file);

    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    
    // Validazione dei campi obbligatori
    const requiredFields = ['name', 'stageName', 'birthday', 'position'];
    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `Il campo ${field} è obbligatorio` });
      }
    }

    const newMember = {
      name: req.body.name,
      stageName: req.body.stageName,
      birthday: req.body.birthday,
      zodiacSign: req.body.zodiacSign,
      height: req.body.height === 'N/A' ? 'N/A' : parseFloat(req.body.height) || null,
      weight: req.body.weight === 'N/A' ? 'N/A' : parseFloat(req.body.weight) || null,
      mbtiType: req.body.mbtiType,
      nationality: req.body.nationality,
      instagram: req.body.instagram,
      bio: req.body.bio,
      position: Array.isArray(req.body.position) ? req.body.position : req.body.position.split(',').map(item => item.trim()),
    };

    if (req.file) {
      newMember.photo = req.file.path;
    }

    group.members.push(newMember);
    
    const updatedGroup = await group.save();
    if (!updatedGroup) {
      throw new Error('Errore nel salvare il gruppo aggiornato');
    }

    res.status(201).json(updatedGroup);
  } catch (error) {
    console.error('Errore nell\'aggiunta del membro:', error);
    res.status(400).json({ message: 'Errore nell\'aggiunta del membro', error: error.message });
  }
};

export const searchGroups = async (query) => {
  try {
    const groups = await Group.find({
      name: { $regex: query, $options: 'i' }
    });
    return groups.map(group => ({...group.toObject(), type: 'group'}));
  } catch (error) {
    console.error('Errore nella ricerca dei gruppi:', error);
    throw error;
  }
};

export const getGroupMembers = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    res.json(group.members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }

    const member = group.members.id(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Membro non trovato' });
    }

    Object.keys(req.body).forEach(key => {
      if (key === 'height' || key === 'weight') {
        const value = req.body[key];
        member[key] = value === 'N/A' ? 'N/A' : parseFloat(value) || null;
      } else {
        member[key] = req.body[key];
      }
    });

    if (req.file) {
      member.photo = req.file.path;
    }

    await group.save();

    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }
    const member = group.members.id(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Membro non trovato' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, parentCommentId } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
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
    if (!group.comments) {
      group.comments = [];
    }

    group.comments.push(newComment._id);
    await group.save();

    const populatedComment = await Comment.findById(newComment._id).populate('author', 'nome cognome');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Errore nell\'aggiunta del commento:', error);
    res.status(400).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { groupId, commentId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Commento non trovato' });
    }

    if (comment.author.toString() !== userId.toString() && req.user.ruolo !== 'admin') {
      return res.status(403).json({ message: 'Non autorizzato a eliminare questo commento' });
    }

    // Rimuovi il commento dal gruppo
    group.comments.pull(commentId);
    await group.save();

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
    const { groupId, commentId } = req.params;
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
    const { groupId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Gruppo non trovato' });
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
    group.comments.push(newReply._id);
    await group.save();

    const populatedReply = await Comment.findById(newReply._id)
      .populate('author', 'nome cognome');

    res.status(201).json(populatedReply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};