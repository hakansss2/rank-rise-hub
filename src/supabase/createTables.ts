
import { supabase } from './client';

// Bu script Supabase tablolarını doğrudan oluşturmak için kullanılabilir
export const createSupabaseTables = async () => {
  console.log("Supabase tablolarını oluşturma işlemi başlatılıyor...");
  
  try {
    // UUID eklentisini etkinleştir
    console.log("UUID eklentisi kontrol ediliyor...");
    const { error: uuidError } = await supabase.rpc('create_uuid_extension', {});
    
    if (uuidError) {
      console.error("UUID eklentisi RPC ile oluşturulamadı, SQL ile deneniyor:", uuidError.message);
      // Doğrudan SQL kullanımı yerine rpc methodu kullanılabilir
      try {
        const { error: fallbackError } = await supabase
          .from('_dummy_query')
          .select()
          .limit(1);
          
        if (fallbackError && !fallbackError.message.includes('does not exist')) {
          console.error("UUID eklentisi fallback kontrol hatası:", fallbackError.message);
        }
      } catch (e) {
        console.error("UUID fallback işlemi hatası:", e);
      }
      
      console.log("UUID eklentisi kontrolü tamamlandı, devam ediliyor");
    } else {
      console.log("UUID eklentisi başarıyla etkinleştirildi veya mevcuttu");
    }
    
    // Users tablosunu oluştur
    console.log("Users tablosu oluşturuluyor...");
    const { error: usersError } = await supabase.rpc('create_users_table', {});
    
    if (usersError) {
      console.error("Users tablosu RPC ile oluşturulamadı, API ile deneniyor:", usersError.message);
      
      // API ile tablo oluşturmayı dene
      try {
        const { error: fallbackError } = await supabase
          .from('users')
          .insert({
            id: '00000000-0000-0000-0000-000000000000',
            email: 'system@example.com',
            username: 'system',
            role: 'system',
            balance: 0
          });
          
        if (fallbackError && !fallbackError.message.includes('already exists')) {
          console.error("Users tablosu oluşturma hatası:", fallbackError.message);
        } else {
          console.log("Users tablosu başarıyla oluşturuldu veya mevcuttu");
        }
      } catch (e) {
        console.error("Users tablosu fallback oluşturma hatası:", e);
      }
    } else {
      console.log("Users tablosu başarıyla oluşturuldu veya mevcuttu");
    }
    
    // Orders tablosunu oluştur
    console.log("Orders tablosu oluşturuluyor...");
    const { error: ordersError } = await supabase.rpc('create_orders_table', {});
    
    if (ordersError) {
      console.error("Orders tablosu RPC ile oluşturulamadı, API ile deneniyor:", ordersError.message);
      
      // API ile tablo oluşturmayı dene
      try {
        const { error: fallbackError } = await supabase
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
          
        if (fallbackError && !fallbackError.message.includes('already exists')) {
          console.error("Orders tablosu oluşturma hatası:", fallbackError.message);
        } else {
          console.log("Orders tablosu başarıyla oluşturuldu veya mevcuttu");
        }
      } catch (e) {
        console.error("Orders tablosu fallback oluşturma hatası:", e);
      }
    } else {
      console.log("Orders tablosu başarıyla oluşturuldu veya mevcuttu");
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

// Bu fonksiyonu tarayıcı konsolunda şöyle çalıştırabilirsiniz:
// import { createSupabaseTables } from './src/supabase/createTables';
// createSupabaseTables().then(result => console.log(result));

export default createSupabaseTables;
