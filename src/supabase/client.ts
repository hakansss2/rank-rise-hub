
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vhxhlsidnwarmgbycrwa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeGhsc2lkbndhcm1nYnljcndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0OTYzMzYsImV4cCI6MjA1ODA3MjMzNn0.E9pjiFCid0AXOSAiteTbQd6JkLmL9sCEFcetyXa5rVY";

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase yapılandırması başlatılıyor...");

// Helper function to check if table exists
const checkIfTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    return !error;
  } catch (error) {
    console.error(`${tableName} tablosu kontrol hatası:`, error);
    return false;
  }
};

// Create necessary tables directly via SQL
const createTablesDirectly = async () => {
  try {
    console.log("SQL ile tablo oluşturma işlemi başlatılıyor...");
    
    // Create users table
    const usersTableSQL = `
      CREATE TABLE IF NOT EXISTS public.users (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        email text UNIQUE NOT NULL,
        username text UNIQUE NOT NULL,
        password text NOT NULL,
        role text DEFAULT 'customer'::text,
        balance numeric DEFAULT 0
      );
    `;
    
    // Create orders table
    const ordersTableSQL = `
      CREATE TABLE IF NOT EXISTS public.orders (
        id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id text NOT NULL,
        current_rank integer NOT NULL,
        target_rank integer NOT NULL,
        price numeric NOT NULL,
        status text NOT NULL,
        booster_id text,
        booster_username text,
        created_at timestamp with time zone DEFAULT now(),
        messages jsonb DEFAULT '[]'::jsonb,
        game_username text,
        game_password text
      );
    `;
    
    // Execute the create table SQL
    try {
      // Enable UUID extension
      const { error: uuidError } = await supabase.rpc('enable_uuid_extension');
      if (uuidError) console.error("UUID extension hatası:", uuidError);
      
      // Make SQL queries available
      await supabase.rpc('create_sql_query_function');
      
      // Create tables
      const { error: usersError } = await supabase.rpc('execute_sql', { sql: usersTableSQL });
      if (usersError) console.error("Users tablosu oluşturma hatası:", usersError);
      
      const { error: ordersError } = await supabase.rpc('execute_sql', { sql: ordersTableSQL });
      if (ordersError) console.error("Orders tablosu oluşturma hatası:", ordersError);
      
      console.log("SQL ile tablolar oluşturuldu veya mevcut");
    } catch (sqlError) {
      console.error("SQL çalıştırma hatası:", sqlError);
      
      // Fallback to create tables by inserting records
      console.log("Fallback: Kayıt ekleyerek tablo oluşturma deneniyor...");
      fallbackTableCreation();
    }
  } catch (error) {
    console.error("Tablo oluşturma hatası:", error);
    fallbackTableCreation();
  }
};

// Fallback function to create tables by inserting records
const fallbackTableCreation = async () => {
  try {
    console.log("Fallback tablo oluşturma başlatılıyor...");
    
    // Create users table
    const usersExist = await checkIfTableExists('users');
    if (!usersExist) {
      console.log("Users tablosu oluşturuluyor...");
      const { error: userError } = await supabase.from('users').insert({
        id: '00000000-0000-0000-0000-000000000000',
        email: 'system@example.com',
        username: 'system',
        role: 'system',
        balance: 0,
        password: 'system-password'
      });
      console.log("Users tablosu oluşturma sonucu:", userError ? `Hata: ${userError.message}` : "Başarılı");
    }
    
    // Create orders table
    const ordersExist = await checkIfTableExists('orders');
    if (!ordersExist) {
      console.log("Orders tablosu oluşturuluyor...");
      const { error: orderError } = await supabase.from('orders').insert({
        id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        current_rank: 0,
        target_rank: 0,
        price: 0,
        status: 'system',
        created_at: new Date().toISOString(),
        messages: []
      });
      console.log("Orders tablosu oluşturma sonucu:", orderError ? `Hata: ${orderError.message}` : "Başarılı");
    }
    
    console.log("Fallback tablo oluşturma tamamlandı");
  } catch (error) {
    console.error("Fallback tablo oluşturma hatası:", error);
  }
};

// Try to initialize the database
createTablesDirectly().catch(error => {
  console.error("Veritabanı başlatma hatası:", error);
  fallbackTableCreation();
});

export default supabase;
