
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rfshgepiqrgpvqorohoj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmc2hnZXBpcXJncHZxb3JvaG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzM4MDYsImV4cCI6MjA1OTg0OTgwNn0.EoyBlV9Smj8_h0n_pdsi6MyRUO-W1ZLy2fUOgt0mA00";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Initialize database tables
export const initializeDatabase = async () => {
  console.log("Initializing Supabase database tables...");
  
  try {
    // Check if orders table exists
    const { error: checkOrdersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (checkOrdersError) {
      console.log("Creating orders table...");
      
      // Create orders table
      const { error: createOrdersError } = await supabase.rpc('create_orders_table');
      
      if (createOrdersError) {
        console.error("Failed to create orders table:", createOrdersError);
      }
    }
    
    console.log("Database initialization completed");
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
};

// Call initialization
initializeDatabase().catch(console.error);

export default supabase;
