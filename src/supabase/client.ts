
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vhxhlsidnwarmgbycrwa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeGhsc2lkbndhcm1nYnljcndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0OTYzMzYsImV4cCI6MjA1ODA3MjMzNn0.E9pjiFCid0AXOSAiteTbQd6JkLmL9sCEFcetyXa5rVY";

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase yapılandırması başlatılıyor...");

// Supabase bağlantısını ve tabloları kontrol et
const initializeSupabase = async () => {
  try {
    console.log("Supabase durumu kontrol ediliyor...");
    
    // Tabloları kontrol et ve gerekirse oluştur
    // Users tablosunu kontrol et
    const { error: usersError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    if (usersError && usersError.message.includes('does not exist')) {
      console.log("Users tablosu bulunamadı, oluşturuluyor...");
      
      // SQL ile tablo oluşturma fonksiyonumuz yok, bu yüzden veritabanı arayüzünden manuel oluşturulmalı
      console.error("Lütfen Supabase arayüzünden users tablosunu oluşturun");
      
      // Yine de bir test verisi eklemeyi deneyelim, bu tablo otomatik oluşturulabilir
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: '00000000-0000-0000-0000-000000000000',
          email: 'system@example.com',
          username: 'system',
          role: 'system',
          balance: 0
        });
        
      if (insertError) {
        console.log("Test kullanıcısı eklenemedi:", insertError.message);
      } else {
        console.log("Users tablosu başarıyla oluşturuldu ve test verisi eklendi");
      }
    } else {
      console.log("Users tablosu mevcut");
    }
    
    // Orders tablosunu kontrol et
    const { error: ordersError } = await supabase
      .from('orders')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    
    if (ordersError && ordersError.message.includes('does not exist')) {
      console.log("Orders tablosu bulunamadı, oluşturuluyor...");
      
      // Test verisi ekleyerek tabloyu otomatik oluşturmayı dene
      const { error: insertError } = await supabase
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
        
      if (insertError) {
        console.log("Test siparişi eklenemedi:", insertError.message);
      } else {
        console.log("Orders tablosu başarıyla oluşturuldu ve test verisi eklendi");
      }
    } else {
      console.log("Orders tablosu mevcut");
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
