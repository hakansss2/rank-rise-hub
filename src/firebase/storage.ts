
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

// Dosya yükleme fonksiyonu
export const uploadFile = async (
  file: File, 
  path: string
): Promise<string> => {
  try {
    // Storage'da referans oluştur
    const storageRef = ref(storage, path);
    
    // Dosyayı yükle
    await uploadBytes(storageRef, file);
    
    // Yüklenen dosyanın URL'sini al
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log("Dosya başarıyla yüklendi:", downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.error("Dosya yükleme hatası:", error.message);
    throw new Error(error.message);
  }
};

// Profil resmi yükleme için özel fonksiyon
export const uploadProfileImage = async (
  userId: string, 
  file: File
): Promise<string> => {
  const path = `profile_images/${userId}/${Date.now()}_${file.name}`;
  return uploadFile(file, path);
};

// Boost siparişi kanıt görseli yükleme
export const uploadBoostProofImage = async (
  orderId: string, 
  file: File
): Promise<string> => {
  const path = `boost_proofs/${orderId}/${Date.now()}_${file.name}`;
  return uploadFile(file, path);
};

// Dosya silme fonksiyonu
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // URL'den storage referansını al
    const fileRef = ref(storage, fileUrl);
    
    // Dosyayı sil
    await deleteObject(fileRef);
    
    console.log("Dosya başarıyla silindi");
  } catch (error: any) {
    console.error("Dosya silme hatası:", error.message);
    throw new Error(error.message);
  }
};
