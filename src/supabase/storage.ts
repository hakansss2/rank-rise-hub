
import { supabase } from './client';
import { v4 as uuidv4 } from 'uuid';

// Dosya yükleme fonksiyonu
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    if (!file) {
      throw new Error("Yüklenecek dosya bulunamadı");
    }
    
    // Dosya adını benzersiz yap
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    // Dosyayı Supabase depolama alanına yükle
    const { error } = await supabase.storage
      .from('files')
      .upload(filePath, file);
    
    if (error) {
      throw error;
    }
    
    // Dosyanın genel URL'sini al
    const { data } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error: any) {
    console.error("Dosya yükleme hatası:", error.message);
    throw new Error(`Dosya yüklenemedi: ${error.message}`);
  }
};

// Profil resmi yükleme fonksiyonu
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  try {
    return await uploadFile(file, `profiles/${userId}`);
  } catch (error: any) {
    console.error("Profil resmi yükleme hatası:", error.message);
    throw error;
  }
};

// Boost kanıt resmi yükleme fonksiyonu
export const uploadBoostProofImage = async (orderId: string, file: File): Promise<string> => {
  try {
    return await uploadFile(file, `proofs/${orderId}`);
  } catch (error: any) {
    console.error("Kanıt resmi yükleme hatası:", error.message);
    throw error;
  }
};

// Dosya silme fonksiyonu
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // URL'den dosya yolunu çıkar
    const filePath = fileUrl.split('/files/')[1];
    if (!filePath) {
      throw new Error("Geçersiz dosya URL'si");
    }
    
    const { error } = await supabase.storage
      .from('files')
      .remove([filePath]);
    
    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error("Dosya silme hatası:", error.message);
    throw new Error(`Dosya silinemedi: ${error.message}`);
  }
};
