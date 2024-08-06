import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Funzione per creare un uploader con una cartella specifica
const createUploader = (folder) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folder,
      allowed_formats: ["jpg", "png", "jpeg", "gif"],
    },
  });

  return multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite di 5MB
  });
};

// Crea uploader specifici per ciascun tipo di contenuto
export const groupUploader = createUploader("group_covers");
export const soloistUploader = createUploader("soloist_covers");
export const memberUploader = createUploader("member_photos");
export const avatarUploader = createUploader("user_avatars");

// Esporta anche un uploader generico se necessario
export const genericUploader = createUploader("uploads");

export default {
  groupUploader,
  soloistUploader,
  memberUploader,
  avatarUploader,
  genericUploader
};