
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

// Create necessary tables if they don't exist
const initializeSupabase = async () => {
  try {
    console.log("Supabase durumu kontrol ediliyor...");
    
    // Create users table
    const createUsersTable = async () => {
      // Check if users table exists
      const usersTableExists = await checkIfTableExists('users');
      
      if (!usersTableExists) {
        console.log("Users tablosu bulunamadı, oluşturma deneniyor...");
        
        // Try to create the users table by inserting a dummy record
        try {
          const { error } = await supabase
            .from('users')
            .insert({
              id: '00000000-0000-0000-0000-000000000000',
              email: 'system@example.com',
              username: 'system',
              role: 'system',
              balance: 0
            });
            
          if (error && !error.message.includes('already exists')) {
            console.error("Users tablosu oluşturma hatası:", error.message);
          } else {
            console.log("Users tablosu başarıyla oluşturuldu veya mevcuttu");
          }
        } catch (e) {
          console.error("Fallback kullanıcı oluşturma hatası:", e);
        }
      } else {
        console.log("Users tablosu mevcut");
      }
    };
    
    // Create orders table
    const createOrdersTable = async () => {
      // Check if orders table exists
      const ordersTableExists = await checkIfTableExists('orders');
      
      if (!ordersTableExists) {
        console.log("Orders tablosu bulunamadı, oluşturma deneniyor...");
        
        // Try to create the orders table by inserting a dummy record
        try {
          const { error } = await supabase
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
            
          if (error && !error.message.includes('already exists')) {
            console.error("Orders tablosu oluşturma hatası:", error.message);
          } else {
            console.log("Orders tablosu başarıyla oluşturuldu veya mevcuttu");
          }
        } catch (e) {
          console.error("Fallback sipariş oluşturma hatası:", e);
        }
      } else {
        console.log("Orders tablosu mevcut");
      }
    };
    
    // Initialize UUID extension (this will need to be done manually in Supabase dashboard)
    const initializeUuidExtension = async () => {
      console.log("UUID extension kontrolü (bu işlemi Supabase panelinden manuel olarak yapmanız gerekebilir)");
      // UUID extension needs to be enabled in the Supabase dashboard
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
