
import { supabase } from '../supabase/client';
import { initializeOrdersTable } from '../supabase/orders';
import { checkFirebaseConnection } from '../firebase/orders';

// Extend the Window interface to include our custom methods
declare global {
  interface Window {
    setupDatabase: () => Promise<{ success: boolean; message: string }>;
    createDemoOrder: () => any;
    clearLocalOrders: () => boolean;
    checkDatabaseStatus: () => Promise<{
      supabase: boolean;
      firebase: boolean;
      localStorage: boolean;
      anyServiceWorking: boolean;
    }>;
    createOrdersTable: () => Promise<{ success: boolean; message: string }>;
    checkRlsSettings: () => void;
    setupDatabaseHelper: () => void;
  }
}

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
    const errorMessage = error?.message || "Bilinmeyen hata";
    console.error("Tablo oluşturma işleminde hata:", errorMessage);
    return {
      success: false,
      message: `İşlem hatası: ${errorMessage}`
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
  
  // localStorage durumu
  let localStorageStatus = false;
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    localStorageStatus = true;
    console.log("localStorage durumu: Çalışıyor");
  } catch (error) {
    console.error("localStorage kontrolünde hata:", error);
    console.log("localStorage durumu: Çalışmıyor");
  }
  
  const anyServiceWorking = supabaseStatus || firebaseStatus || localStorageStatus;
  
  // Hiçbir servis çalışmıyorsa konsol uyarısı
  if (!anyServiceWorking) {
    console.error("❌ UYARI: Hiçbir veritabanı servisi çalışmıyor!");
  } else {
    // Çalışan bir veritabanı var, duruma göre stratejileri oluştur
    // localStorage'ı her zaman etkinleştir (yedek mekanizma olarak)
    if (localStorageStatus && !supabaseStatus && !firebaseStatus) {
      console.log("⚠️ Veritabanları erişilemez durumda. localStorage yedek mekanizması etkinleştirildi.");
      createDemoOrder(); // Demo sipariş oluştur
    }
    
    // localStorage'da veri varsa ve veritabanları çalışıyorsa
    if (localStorageStatus && (supabaseStatus || firebaseStatus)) {
      try {
        const storedOrders = localStorage.getItem('orders');
        if (storedOrders) {
          const orders = JSON.parse(storedOrders);
          console.log(`localStorage'da ${orders.length} sipariş bulundu. Veritabanları çalışır durumda.`);
        }
      } catch (e) {
        console.error("localStorage okuma hatası:", e);
      }
    }
  }
  
  return {
    supabase: supabaseStatus,
    firebase: firebaseStatus,
    localStorage: localStorageStatus,
    anyServiceWorking
  };
};

// Manuel olarak sipariş tablosunu açık etme
export const createDemoOrder = () => {
  try {
    // Demo sipariş oluştur
    const demoOrder = {
      id: "demo-" + Date.now().toString(),
      userId: "admin-user-id-1",
      currentRank: 15,
      targetRank: 20,
      price: 100,
      status: 'pending',
      createdAt: new Date().toISOString(),
      messages: [],
      gameUsername: "demo-user",
      gamePassword: "demo-pass"
    };
    
    // localStorage'a kaydet
    let orders = [];
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      orders = JSON.parse(storedOrders);
    }
    orders.unshift(demoOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    console.log("Demo sipariş oluşturuldu ve localStorage'a kaydedildi:", demoOrder);
    return demoOrder;
  } catch (error) {
    console.error("Demo sipariş oluşturma hatası:", error);
    return null;
  }
};

// Mevcut siparişleri temizleme
export const clearLocalOrders = () => {
  try {
    localStorage.removeItem('orders');
    console.log("localStorage'daki siparişler temizlendi");
    return true;
  } catch (error) {
    console.error("localStorage temizleme hatası:", error);
    return false;
  }
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
  console.log("localStorage durumu:", dbStatus.localStorage ? "✅ Çalışıyor" : "❌ Çalışmıyor");
  
  if (!dbStatus.supabase && !dbStatus.firebase) {
    console.log("\n⚠️ Supabase ve Firebase bağlantıları çalışmıyor!");
    console.log("localStorage yedek mekanizması devreye alınacak");
    
    if (dbStatus.localStorage) {
      console.log("Demo sipariş oluşturulacak...");
      createDemoOrder();
    }
  }
  
  console.log("\n==== Supabase Kurulum Talimatları ====");
  console.log("1. Supabase kontrol panelini açın");
  console.log("2. 'Table Editor' bölümüne gidin");
  console.log("3. Aşağıdaki tabloların oluşturulduğunu kontrol edin:");
  console.log("   - users");
  console.log("   - orders");
  console.log("4. Eğer tablolar yoksa, manuel olarak oluşturun");
  console.log("5. Oluşturduğunuz tablolar için RLS (Row Level Security) kapatın");
  console.log("6. Sayfayı yenileyip tekrar deneyin");
  
  console.log("\n==== Sorunu Çözmek İçin ====");
  console.log("Sorun devam ediyorsa, şunu deneyin:");
  console.log("1. Tarayıcı konsoluna `setupDatabaseHelper()` yazıp çalıştırın");
  console.log("2. Veya `createDemoOrder()` ile test siparişi oluşturun");
  console.log("3. Tablo oluşturma için `createOrdersTable()` deneyin");
  console.log("4. Hatalı verileri temizlemek için `clearLocalOrders()` kullanın");
  
  return {
    success: dbStatus.anyServiceWorking,
    message: "Veritabanı kurulum işlemi tamamlandı. Talimatları takip edin."
  };
};

// Konsol için helper fonksiyon - bu fonksiyonu konsola kopyalayıp çalıştırabilirsiniz
export const setupDatabaseHelper = () => {
  console.log("Veritabanı kurulumu başlatılıyor...");
  
  // Add functions to window object with proper type safety
  window.setupDatabase = setupDatabase;
  window.createDemoOrder = createDemoOrder;
  window.clearLocalOrders = clearLocalOrders;
  window.checkDatabaseStatus = checkDatabaseStatus;
  window.createOrdersTable = createOrdersTable;
  window.checkRlsSettings = checkRlsSettings;
  
  console.log("Kullanılabilir fonksiyonlar:");
  console.log("- setupDatabase(): Tüm veritabanı kurulumunu yapar");
  console.log("- createDemoOrder(): Demo sipariş oluşturur");
  console.log("- clearLocalOrders(): localStorage'daki siparişleri temizler");
  console.log("- checkDatabaseStatus(): Veritabanı durumunu kontrol eder");
  console.log("- createOrdersTable(): Orders tablosunu oluşturmayı dener");
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
  
  // Uygulamayı başlatırken helper fonksiyonları otomatik olarak tanımla
  setupDatabaseHelper();
  
  console.log("Bu fonksiyonu istediğiniz zaman 'checkRlsSettings()' yazarak çalıştırabilirsiniz.");
};

export default setupDatabase;
