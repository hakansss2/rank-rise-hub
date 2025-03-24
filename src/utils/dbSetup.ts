
import { supabase } from '../supabase/client';
import { initializeOrdersTable } from '../supabase/orders';
import { checkFirebaseConnection } from '../firebase/orders';

// Supabase orders tablosunu oluşturma fonksiyonu
export const createOrdersTable = async () => {
  try {
    console.log("Orders tablosu oluşturma işlemi başlatılıyor...");
    
    const success = await initializeOrdersTable();
    
    if (success) {
      console.log("Orders tablosu başarıyla oluşturuldu veya zaten mevcuttu.");
      return {
        success: true,
        message: "Orders tablosu başarıyla oluşturuldu veya zaten mevcuttu."
      };
    } else {
      console.error("Orders tablosu oluşturma işlemi başarısız oldu.");
      return {
        success: false,
        message: "Orders tablosu oluşturma işlemi başarısız oldu."
      };
    }
  } catch (error: any) {
    console.error("Tablo oluşturma işleminde hata:", error);
    return {
      success: false,
      message: `İşlem hatası: ${error.message}`
    };
  }
};

// Veritabanı durumunu kontrol et
export const checkDatabaseStatus = async () => {
  console.log("Veritabanı durumu kontrol ediliyor...");
  
  // Supabase durumu
  let supabaseStatus = false;
  try {
    const ordersSuccess = await initializeOrdersTable();
    supabaseStatus = ordersSuccess;
    console.log("Supabase durumu:", supabaseStatus ? "Çalışıyor" : "Bağlantı sorunu");
  } catch (error) {
    console.error("Supabase kontrolünde hata:", error);
  }
  
  // Firebase durumu
  let firebaseStatus = false;
  try {
    firebaseStatus = await checkFirebaseConnection();
    console.log("Firebase durumu:", firebaseStatus ? "Çalışıyor" : "Bağlantı sorunu");
  } catch (error) {
    console.error("Firebase kontrolünde hata:", error);
  }
  
  return {
    supabase: supabaseStatus,
    firebase: firebaseStatus,
    anyServiceWorking: supabaseStatus || firebaseStatus
  };
};

// Kullanıcılar için konsol yardımcısı
export const setupDatabase = async () => {
  console.log("Veritabanı kurulum yardımcısı başlatılıyor...");
  
  // Veritabanı durumunu kontrol et
  const dbStatus = await checkDatabaseStatus();
  
  // Orders tablosunu oluştur
  const ordersResult = await createOrdersTable();
  console.log("Orders tablosu sonuç:", ordersResult);
  
  console.log("\n==== Veritabanı Kurulum Durumu ====");
  console.log("Supabase durumu:", dbStatus.supabase ? "✅ Çalışıyor" : "❌ Bağlantı sorunu");
  console.log("Firebase durumu:", dbStatus.firebase ? "✅ Çalışıyor" : "❌ Bağlantı sorunu");
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
    success: dbStatus.anyServiceWorking || ordersResult.success,
    message: "Veritabanı kurulum işlemi tamamlandı. Talimatları takip edin."
  };
};

// Konsol için helper fonksiyon - bu fonksiyonu konsola kopyalayıp çalıştırabilirsiniz
export const setupDatabaseHelper = () => {
  console.log("Veritabanı kurulumu başlatılıyor...");
  
  // @ts-ignore - global window objesine ekleme
  window.setupDatabase = setupDatabase;
  
  console.log("Şimdi konsola 'setupDatabase()' yazıp çalıştırın.");
  console.log("Veya doğrudan Supabase'e gidip tablo yapılandırmanızı kontrol edin.");
};

// RLS ayarlarını gösteren helper fonksiyon
export const checkRlsSettings = () => {
  console.log("\n==== Supabase RLS Kontrol Talimatları ====");
  console.log("1. Supabase kontrol panelini açın: https://vhxhlsidnwarmgbycrwa.supabase.co");
  console.log("2. Authentication -> Policies menüsüne gidin");
  console.log("3. orders tablosu için aşağıdaki RLS ayarlarını yapın:");
  console.log("   - Tüm politikaları geçici olarak kaldırın veya devre dışı bırakın");
  console.log("   - Ya da 'Enable Row Level Security' seçeneğini geçici olarak kapatın");
  console.log("4. Sayfayı yenileyip tekrar deneyin");
  
  // @ts-ignore - global window objesine ekleme
  window.checkRlsSettings = checkRlsSettings;
  
  console.log("Bu fonksiyonu istediğiniz zaman 'checkRlsSettings()' yazarak çalıştırabilirsiniz.");
};

export default setupDatabase;
