
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://vhxhlsidnwarmgbycrwa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeGhsc2lkbndhcm1nYnljcndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0OTYzMzYsImV4cCI6MjA1ODA3MjMzNn0.E9pjiFCid0AXOSAiteTbQd6JkLmL9sCEFcetyXa5rVY";

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase yapılandırması başlatılıyor...");

// Supabase bağlantısını kontrol et
const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error("Supabase bağlantı hatası:", error.message);
      return false;
    }
    
    console.log("Supabase bağlantısı başarılı");
    return true;
  } catch (error: any) {
    console.error("Supabase kontrol hatası:", error.message);
    return false;
  }
};

// Bağlantıyı kontrol et
checkSupabaseConnection();

export default supabase;
