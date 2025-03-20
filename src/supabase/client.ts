
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
      const { error: createUsersError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY,
          email TEXT,
          username TEXT,
          role TEXT,
          balance NUMERIC DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `);
      
      if (createUsersError) {
        console.error("Kullanıcılar tablosu oluşturma hatası:", createUsersError);
      } else {
        console.log("Kullanıcılar tablosu başarıyla oluşturuldu");
      }
    } else {
      console.log("Kullanıcılar tablosu kontrolü tamamlandı");
    }
    
    // Siparişler tablosunu oluştur
    const { error: ordersTableError } = await supabase.rpc('create_orders_table_if_not_exists');
    
    if (ordersTableError) {
      console.log("Siparişler tablosu RPC hatası, tablo SQL ile oluşturuluyor:", ordersTableError);
      const { error: createOrdersError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id),
          current_rank TEXT,
          target_rank TEXT,
          price NUMERIC,
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          game_username TEXT,
          game_password TEXT,
          messages JSONB DEFAULT '[]'::jsonb
        );
      `);
      
      if (createOrdersError) {
        console.error("Siparişler tablosu oluşturma hatası:", createOrdersError);
      } else {
        console.log("Siparişler tablosu başarıyla oluşturuldu");
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
