
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vhxhlsidnwarmgbycrwa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeGhsc2lkbndhcm1nYnljcndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0OTYzMzYsImV4cCI6MjA1ODA3MjMzNn0.E9pjiFCid0AXOSAiteTbQd6JkLmL9sCEFcetyXa5rVY";

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase yapılandırması başlatılıyor...");

// Supabase bağlantısını ve tabloları kontrol et
const initializeSupabase = async () => {
  try {
    console.log("Supabase durumu kontrol ediliyor...");
    
    // Tabloları oluşturmak için SQL sorguları (doğrudan SQL sorguları kullanarak)
    const createUsersSql = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY,
        email TEXT,
        username TEXT,
        role TEXT,
        balance NUMERIC DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    const createOrdersSql = `
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID,
        current_rank TEXT,
        target_rank TEXT,
        price NUMERIC,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        game_username TEXT,
        game_password TEXT,
        messages JSONB DEFAULT '[]'::jsonb
      )
    `;

    // SQL sorguları çalıştır
    const { error: usersError } = await supabase.rpc('exec_sql', { sql: createUsersSql });
    if (usersError) {
      console.log("Users tablosu oluşturma hatası (SQL RPC):", usersError.message);
      
      // Alternatif yöntem: Diğer yaygın Supabase yöntemleri ile devam et
      try {
        // Test amaçlı select sorgusu 
        const { data: testData, error: testError } = await supabase
          .from('users')
          .select('count', { count: 'exact', head: true });
          
        if (testError && testError.message.includes('does not exist')) {
          console.log("Users tablosu yok, varsayılan veri eklemeye çalışacağız");
        } else {
          console.log("Users tablosu mevcut gibi görünüyor");
        }
        
        // Varsayılan veri ekle (tablo yoksa veya varsa)
        const { error: insertError } = await supabase
          .from('users')
          .upsert({
            id: '00000000-0000-0000-0000-000000000000',
            email: 'system@example.com',
            username: 'system',
            role: 'system',
            balance: 0,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' });
          
        if (insertError) {
          console.error("Kullanıcı verisi eklenirken hata:", insertError.message);
        } else {
          console.log("Kullanıcı verisi başarıyla eklendi veya güncellendi");
        }
      } catch (e) {
        console.error("Alternatif users tablosu işlemi hatası:", e);
      }
    } else {
      console.log("Users tablosu başarıyla oluşturuldu veya zaten mevcuttu");
    }
    
    // Orders tablosu oluştur
    const { error: ordersError } = await supabase.rpc('exec_sql', { sql: createOrdersSql });
    if (ordersError) {
      console.log("Orders tablosu oluşturma hatası (SQL RPC):", ordersError.message);
      
      // Alternatif yöntem
      try {
        // Test sorgusu
        const { data: testData, error: testError } = await supabase
          .from('orders')
          .select('count', { count: 'exact', head: true });
          
        if (testError && testError.message.includes('does not exist')) {
          console.log("Orders tablosu yok, varsayılan veri eklemeye çalışacağız");
        } else {
          console.log("Orders tablosu mevcut gibi görünüyor");
        }
        
        // Varsayılan sipariş ekle
        const { error: insertError } = await supabase
          .from('orders')
          .upsert({
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
          }, { onConflict: 'id' });
          
        if (insertError) {
          console.error("Sipariş verisi eklenirken hata:", insertError.message);
        } else {
          console.log("Sipariş verisi başarıyla eklendi veya güncellendi");
        }
      } catch (e) {
        console.error("Alternatif orders tablosu işlemi hatası:", e);
      }
    } else {
      console.log("Orders tablosu başarıyla oluşturuldu veya zaten mevcuttu");
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
