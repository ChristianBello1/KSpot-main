import express from 'express';
import { 
  createSoloist, 
  getAllSoloists, 
  getSoloistById, 
  updateSoloist, 
  deleteSoloist, 
  addComment, 
  deleteComment, 
  searchSoloists,
  likeComment,
} from '../controllers/soloistController.js';
import { authMiddleware, checkAdminPermission } from '../middlewares/authMiddleware.js';
import { soloistUploader } from '../middlewares/cloudinaryUploader.js';

const router = express.Router();

// Rotte pubbliche
router.get('/', getAllSoloists);

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const soloists = await searchSoloists(q);
    res.json(soloists.length > 0 ? soloists : { message: "Nessun risultato trovato" });
  } catch (error) {
    console.error("Errore nella ricerca:", error);
    res.status(500).json({ message: "Errore durante la ricerca" });
  }
});

router.get('/:id', getSoloistById);

router.use(authMiddleware);

// Rotte per l'amministrazione dei solisti (solo per admin)
router.post('/', checkAdminPermission, soloistUploader.single('photo'), createSoloist);
router.put('/:id', checkAdminPermission, soloistUploader.single('photo'), updateSoloist);
router.delete('/:id', checkAdminPermission, deleteSoloist);

// Rotte per i commenti
router.post('/:soloistId/comments', addComment);
router.delete('/:soloistId/comments/:commentId', deleteComment);
router.post('/:soloistId/comments/:commentId/like', likeComment);

export default router;