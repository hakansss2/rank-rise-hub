
import { supabase } from '../supabase/client';

// Supabase orders tablosunu doğrudan oluşturmaya çalışan fonksiyon
export const createOrdersTable = async () => {
  try {
    console.log("Orders tablosu oluşturma işlemi başlatılıyor...");
    
    // Önce tablo var mı kontrol et
    const { error: checkError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
      
    if (!checkError) {
      console.log("Orders tablosu zaten mevcut.");
      return {
        success: true,
        message: "Orders tablosu zaten mevcut."
      };
    }
    
    if (checkError && !checkError.message.includes('does not exist')) {
      console.error("Tablo kontrolünde beklenmeyen hata:", checkError.message);
      return {
        success: false,
        message: `Tablo kontrolünde hata: ${checkError.message}`
      };
    }
    
    // Tablo yok, manuel olarak kayıt ekleyerek oluşturmayı dene
    console.log("Orders tablosu bulunamadı, oluşturuluyor...");
    
    // Bu fonksiyon SQL query çalıştıramaz, bu yüzden kayıt ekleyerek oluşturmaya çalışacağız
    const { error: createError } = await supabase
      .from('orders')
      .insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        current_rank: 0,
        target_rank: 0,
        price: 0,
        status: 'system',
        created_at: new Date().toISOString(),
        messages: []
      });
    
    if (createError) {
      console.error("Orders tablosu oluşturma hatası:", createError.message);
      return {
        success: false,
        message: `Orders tablosu oluşturulamadı: ${createError.message}`
      };
    }
    
    console.log("Orders tablosu başarıyla oluşturuldu!");
    return {
      success: true,
      message: "Orders tablosu başarıyla oluşturuldu."
    };
  } catch (error: any) {
    console.error("Tablo oluşturma işleminde hata:", error);
    return {
      success: false,
      message: `İşlem hatası: ${error.message}`
    };
  }
};

// Kullanıcılar için konsol yardımcısı
export const setupDatabase = async () => {
  console.log("Veritabanı kurulum yardımcısı başlatılıyor...");
  
  // Orders tablosunu oluştur
  const ordersResult = await createOrdersTable();
  console.log("Orders tablosu sonuç:", ordersResult);
  
  console.log("\n==== Supabase Kurulum Talimatları ====");
  console.log("1. Supabase kontrol panelini açın");
  console.log("2. 'Table Editor' bölümüne gidin");
  console.log("3. Aşağıdaki tabloların oluşturulduğunu kontrol edin:");
  console.log("   - users");
  console.log("   - orders");
  console.log("4. Eğer tablolar yoksa, manuel olarak oluşturun");
  console.log("5. Oluşturduğunuz tablolar için RLS (Row Level Security) kapatın");
  console.log("6. Sayfayı yenileyip tekrar deneyin");
  
  return {
    success: ordersResult.success,
    message: "Veritabanı kurulum işlemi tamamlandı. Talimatları takip edin."
  };
};

// Konsol için helper fonksiyon - bu fonksiyonu konsola kopyalayıp çalıştırabilirsiniz
export const setupDatabaseHelper = () => {
  console.log("Veritabanı kurulumu başlatılıyor...");
  
  // @ts-ignore - global window objesine ekleme
  window.setupDatabase = setupDatabase;
  
  console.log("Şimdi konsola 'setupDatabase()' yazıp çalıştırın.");
};

export default setupDatabase;
