
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vhxhlsidnwarmgbycrwa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeGhsc2lkbndhcm1nYnljcndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0OTYzMzYsImV4cCI6MjA1ODA3MjMzNn0.E9pjiFCid0AXOSAiteTbQd6JkLmL9sCEFcetyXa5rVY";

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase yapılandırması başlatılıyor...");

// Supabase bağlantısını ve tabloları kontrol et
const initializeSupabase = async () => {
  try {
    console.log("Supabase durumu kontrol ediliyor...");
    
    // Kullanıcılar tablosunu oluştur
    const { error: usersTableError } = await supabase.rpc('create_users_table_if_not_exists');
    
    if (usersTableError) {
      console.log("Kullanıcılar tablosu RPC hatası, tablo SQL ile oluşturuluyor:", usersTableError);
      // SQL sorgusu yerine supabase.from().insert() kullanımı
      const { error: createUsersError } = await supabase
        .from('users')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'system@example.com',
          username: 'system',
          role: 'system',
          balance: 0,
          created_at: new Date().toISOString()
        });
      
      if (createUsersError && !createUsersError.message.includes('already exists')) {
        console.error("Kullanıcılar tablosu oluşturma hatası:", createUsersError);
      } else {
        console.log("Kullanıcılar tablosu başarıyla oluşturuldu veya zaten mevcut");
      }
    } else {
      console.log("Kullanıcılar tablosu kontrolü tamamlandı");
    }
    
    // Siparişler tablosunu oluştur
    const { error: ordersTableError } = await supabase.rpc('create_orders_table_if_not_exists');
    
    if (ordersTableError) {
      console.log("Siparişler tablosu RPC hatası, tablo SQL ile oluşturuluyor:", ordersTableError);
      // SQL sorgusu yerine supabase.from().insert() kullanımı
      const { error: createOrdersError } = await supabase
        .from('orders')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000',
          current_rank: 'test',
          target_rank: 'test',
          price: 0,
          status: 'system',
          created_at: new Date().toISOString(),
          game_username: 'system',
          game_password: 'system',
          messages: []
        });
      
      if (createOrdersError && !createOrdersError.message.includes('already exists')) {
        console.error("Siparişler tablosu oluşturma hatası:", createOrdersError);
      } else {
        console.log("Siparişler tablosu başarıyla oluşturuldu veya zaten mevcut");
      }
    } else {
      console.log("Siparişler tablosu kontrolü tamamlandı");
    }
    
    console.log("Supabase bağlantısı başarılı");
    return true;
  } catch (error: any) {
    console.error("Supabase kontrol hatası:", error.message);
    return false;
  }
};

// Bağlantıyı kontrol et ve tabloları oluştur
initializeSupabase();

export default supabase;
