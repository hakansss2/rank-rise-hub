
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vhxhlsidnwarmgbycrwa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeGhsc2lkbndhcm1nYnljcndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0OTYzMzYsImV4cCI6MjA1ODA3MjMzNn0.E9pjiFCid0AXOSAiteTbQd6JkLmL9sCEFcetyXa5rVY";

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase yapılandırması başlatılıyor...");

// Create necessary tables if they don't exist
const initializeSupabase = async () => {
  try {
    console.log("Supabase durumu kontrol ediliyor...");
    
    // Create users table
    const createUsersTable = async () => {
      const { error } = await supabase.rpc('create_users_table_if_not_exists');
      
      if (error) {
        console.log("RPC create_users_table_if_not_exists mevcut değil, SQL ile deneniyor");
        
        // If the RPC doesn't exist, try with SQL
        const { error: sqlError } = await supabase.from('create_users_table').select('*').limit(1);
        
        if (sqlError) {
          const { error: createError } = await supabase.query(`
            CREATE TABLE IF NOT EXISTS public.users (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              email TEXT UNIQUE NOT NULL,
              username TEXT NOT NULL,
              role TEXT DEFAULT 'customer',
              balance INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          
          if (createError) {
            console.error("Users tablosu oluşturma hatası:", createError.message);
            
            // Try to insert with .from() to force table creation
            try {
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: '00000000-0000-0000-0000-000000000000',
                  email: 'system@example.com',
                  username: 'system',
                  role: 'system',
                  balance: 0
                });
                
              if (insertError && !insertError.message.includes('already exists')) {
                console.error("Test kullanıcısı eklenemedi:", insertError.message);
              } else {
                console.log("Users tablosu başarıyla oluşturuldu veya mevcuttu");
              }
            } catch (e) {
              console.error("Fallback kullanıcı oluşturma hatası:", e);
            }
          } else {
            console.log("Users tablosu SQL ile başarıyla oluşturuldu");
          }
        }
      } else {
        console.log("Users tablosu başarıyla oluşturuldu veya kontrol edildi");
      }
    };
    
    // Create orders table
    const createOrdersTable = async () => {
      const { error } = await supabase.rpc('create_orders_table_if_not_exists');
      
      if (error) {
        console.log("RPC create_orders_table_if_not_exists mevcut değil, SQL ile deneniyor");
        
        // If the RPC doesn't exist, try with SQL
        const { error: sqlError } = await supabase.from('create_orders_table').select('*').limit(1);
        
        if (sqlError) {
          const { error: createError } = await supabase.query(`
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
          
          if (createError) {
            console.error("Orders tablosu oluşturma hatası:", createError.message);
            
            // Try to insert with .from() to force table creation
            try {
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
                
              if (insertError && !insertError.message.includes('already exists')) {
                console.error("Test siparişi eklenemedi:", insertError.message);
              } else {
                console.log("Orders tablosu başarıyla oluşturuldu veya mevcuttu");
              }
            } catch (e) {
              console.error("Fallback sipariş oluşturma hatası:", e);
            }
          } else {
            console.log("Orders tablosu SQL ile başarıyla oluşturuldu");
          }
        }
      } else {
        console.log("Orders tablosu başarıyla oluşturuldu veya kontrol edildi");
      }
    };
    
    // Initialize UUID extension if needed
    const initializeUuidExtension = async () => {
      try {
        const { error } = await supabase.query(`
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        `);
        
        if (error) {
          console.error("UUID extension oluşturma hatası:", error.message);
        } else {
          console.log("UUID extension başarıyla etkinleştirildi veya mevcuttu");
        }
      } catch (e) {
        console.error("UUID extension hatası:", e);
      }
    };
    
    // Run initialization in sequence
    await initializeUuidExtension();
    await createUsersTable();
    await createOrdersTable();
    
    console.log("Supabase tabloları başarıyla kontrol edildi ve/veya oluşturuldu");
    return true;
  } catch (error: any) {
    console.error("Supabase kontrol hatası:", error.message);
    return false;
  }
};

// Initialize tables
initializeSupabase();

export default supabase;
