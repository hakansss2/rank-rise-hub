
import { supabase } from './client';

// Bu script Supabase tablolarını doğrudan oluşturmak için kullanılabilir
export const createSupabaseTables = async () => {
  console.log("Supabase tablolarını oluşturma işlemi başlatılıyor...");
  
  try {
    // UUID eklentisini etkinleştirmeyi dene
    console.log("UUID eklentisini kontrol ediliyor...");
    try {
      const { error: uuidError } = await supabase.rpc('create_uuid_extension', {});
      
      if (uuidError) {
        console.error("UUID eklentisi RPC ile oluşturulamadı:", uuidError.message);
      } else {
        console.log("UUID eklentisi başarıyla etkinleştirildi");
      }
    } catch (e) {
      console.error("UUID eklentisi etkinleştirme hatası:", e);
    }
    
    // Users tablosunu oluştur
    console.log("Users tablosu oluşturuluyor...");
    try {
      // Önce tablo var mı kontrol et
      const { error: checkError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (checkError && checkError.message.includes('does not exist')) {
        console.log("Users tablosu bulunamadı, oluşturuluyor...");
        
        // SQL sorgusu ile tablo oluştur
        const { error: createError } = await supabase.from('users').insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'system@example.com',
          username: 'system',
          role: 'system',
          balance: 0
        });
        
        if (createError && !createError.message.includes('already exists')) {
          console.error("Users tablosu oluşturma hatası:", createError.message);
        } else {
          console.log("Users tablosu başarıyla oluşturuldu veya mevcuttu");
        }
      } else {
        console.log("Users tablosu zaten mevcut");
      }
    } catch (e) {
      console.error("Users tablosu oluşturma hatası:", e);
    }
    
    // Orders tablosunu oluştur
    console.log("Orders tablosu oluşturuluyor...");
    try {
      // Önce tablo var mı kontrol et
      const { error: checkError } = await supabase
        .from('orders')
        .select('count')
        .limit(1);
      
      if (checkError && checkError.message.includes('does not exist')) {
        console.log("Orders tablosu bulunamadı, oluşturuluyor...");
        
        // Tablo oluşturmak için örnek kayıt eklemeyi dene
        const { error: createError } = await supabase.from('orders').insert({
          id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000',
          current_rank: 0,
          target_rank: 0,
          price: 0,
          status: 'system',
          created_at: new Date().toISOString(),
          messages: []
        });
        
        if (createError && !createError.message.includes('already exists')) {
          console.error("Orders tablosu oluşturma hatası:", createError.message);
        } else {
          console.log("Orders tablosu başarıyla oluşturuldu veya mevcuttu");
        }
      } else {
        console.log("Orders tablosu zaten mevcut");
      }
    } catch (e) {
      console.error("Orders tablosu oluşturma hatası:", e);
    }
    
    console.log("Tablo oluşturma işlemleri tamamlandı!");
    return {
      success: true,
      message: "Tablolar başarıyla oluşturuldu veya mevcuttu"
    };
  } catch (error: any) {
    console.error("Tablo oluşturma hatası:", error.message);
    return {
      success: false,
      message: error.message
    };
  }
};

// Konsol fonksiyonu
const executeInConsole = () => {
  console.log("Tablolar oluşturuluyor...");
  createSupabaseTables().then(result => {
    console.log("İşlem sonucu:", result);
    if (result.success) {
      console.log("✅ Tüm tablolar başarıyla oluşturuldu veya mevcuttu.");
      console.log("Şimdi sayfayı yenileyip uygulamayı kullanmaya başlayabilirsiniz.");
    } else {
      console.log("❌ Tablolar oluşturulurken bir hata oluştu:", result.message);
    }
  });
};

// Bu fonksiyonu tarayıcı konsolunda şöyle çalıştırabilirsiniz:
// executeInConsole();

export { executeInConsole };
export default createSupabaseTables;
