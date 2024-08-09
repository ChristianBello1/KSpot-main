import express from 'express';
import { authMiddleware, checkAdminPermission } from '../middlewares/authMiddleware.js';
import { groupUploader, soloistUploader, memberUploader, avatarUploader } from '../middlewares/cloudinaryUploader.js';
import * as groupController from '../controllers/group.js';
import * as userController from '../controllers/user.js';
import * as soloistController from '../controllers/soloistController.js';

const router = express.Router();

// Rotte pubbliche
router.get('/groups', groupController.getAllGroups);
router.get('/groups/:id', groupController.getGroupById);
router.get('/soloists', soloistController.getAllSoloists);
router.get('/soloists/:id', soloistController.getSoloistById);

// Rotta di ricerca pubblica
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const groups = await groupController.searchGroups(q);
    const soloists = await soloistController.searchSoloists(q);
    const results = [...groups, ...soloists];
    res.json(results.length > 0 ? results : { message: "Nessun risultato trovato" });
  } catch (error) {
    console.error("Errore nella ricerca:", error);
    res.status(500).json({ message: "Errore durante la ricerca" });
  }
});

// rotte protette
router.use(authMiddleware);

// Rotte per il profilo utente e i preferiti
router.get('/profile', userController.getProfile);
router.post('/favorites', userController.addFavorite);
router.delete('/favorites', userController.removeFavorite);
router.get('/favorites', userController.getFavorites);

// Rotte per l'aggiornamento del profilo utente
router.patch('/profile', avatarUploader.single('avatar'), userController.updateProfile);
router.delete('/profile', authMiddleware, userController.deleteAccount);

// Rotte per l'amministrazione dei gruppi (solo per admin)
router.post('/groups', 
  checkAdminPermission, 
  groupUploader.single('coverImage'),
  groupController.createGroup
);

router.put('/groups/:id', 
  checkAdminPermission, 
  groupUploader.single('coverImage'),
  groupController.updateGroup
);

router.post('/groups/:groupId/members', 
  checkAdminPermission, 
  memberUploader.single('photo'), 
  groupController.addMemberToGroup
);

router.get('/groups/:groupId/members', 
  checkAdminPermission, 
  groupController.getGroupMembers
);

router.get('/groups/:groupId/members/:memberId', 
  groupController.getMemberById
);

router.put('/groups/:groupId/members/:memberId',
  checkAdminPermission,
  memberUploader.single('photo'),
  groupController.updateMember
);

router.delete('/groups/:id', checkAdminPermission, groupController.deleteGroup);


// Rotte per l'amministrazione dei solisti (solo per admin)
router.post('/soloists', 
  checkAdminPermission, 
  soloistUploader.single('photo'),
  soloistController.createSoloist
);

router.put('/soloists/:id', 
  checkAdminPermission, 
  soloistUploader.single('photo'),
  soloistController.updateSoloist
);

router.delete('/soloists/:id', checkAdminPermission, soloistController.deleteSoloist);

// Rotte per i commenti dei gruppi
router.post('/groups/:groupId/comments', groupController.addComment);
router.delete('/groups/:groupId/comments/:commentId', groupController.deleteComment);
router.post('/groups/:groupId/comments/:commentId/like', groupController.likeComment);

export default router;