
import { supabase } from './client';

// Bu script Supabase tablolarını doğrudan oluşturmak için kullanılabilir
export const createSupabaseTables = async () => {
  console.log("Supabase tablolarını oluşturma işlemi başlatılıyor...");
  
  try {
    // UUID eklentisini etkinleştir
    console.log("UUID eklentisi kontrol ediliyor...");
    const { error: uuidError } = await supabase.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    
    if (uuidError) {
      console.error("UUID eklentisi oluşturma hatası:", uuidError.message);
    } else {
      console.log("UUID eklentisi başarıyla etkinleştirildi veya mevcuttu");
    }
    
    // Users tablosunu oluştur
    console.log("Users tablosu oluşturuluyor...");
    const { error: usersError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        role TEXT DEFAULT 'customer',
        balance INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    if (usersError) {
      console.error("Users tablosu oluşturma hatası:", usersError.message);
    } else {
      console.log("Users tablosu başarıyla oluşturuldu veya mevcuttu");
    }
    
    // Orders tablosunu oluştur
    console.log("Orders tablosu oluşturuluyor...");
    const { error: ordersError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT NOT NULL,
        current_rank INTEGER NOT NULL,
        target_rank INTEGER NOT NULL,
        price INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        booster_id TEXT,
        booster_username TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        messages JSONB DEFAULT '[]',
        game_username TEXT,
        game_password TEXT
      );
    `);
    
    if (ordersError) {
      console.error("Orders tablosu oluşturma hatası:", ordersError.message);
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
