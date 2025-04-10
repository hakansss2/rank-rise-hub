
import { supabase } from './client';

/**
 * Creates the necessary tables in Supabase if they don't exist
 */
export const createSupabaseTables = async (): Promise<void> => {
  try {
    console.log("Creating Supabase tables if they don't exist...");
    
    // Create users table if it doesn't exist
    const usersTableSQL = `
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY,
        email TEXT NOT NULL,
        username TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('customer', 'booster', 'admin')),
        balance NUMERIC DEFAULT 0
      );
    `;
    
    // Create orders table if it doesn't exist
    const ordersTableSQL = `
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        current_rank INTEGER NOT NULL,
        target_rank INTEGER NOT NULL,
        price NUMERIC NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
        booster_id UUID,
        booster_username TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        messages JSONB DEFAULT '[]'::jsonb,
        game_username TEXT,
        game_password TEXT
      );
    `;
    
    // Execute SQL commands using RPC function (if available)
    try {
      console.log("Attempting to create tables using RPC method");
      
      // Try first RPC method name
      await supabase.rpc('execute_sql', { sql: usersTableSQL });
      await supabase.rpc('execute_sql', { sql: ordersTableSQL });
      
      console.log("Tables created successfully using execute_sql RPC");
    } catch (rpcError) {
      console.error("First RPC method failed, trying alternative method", rpcError);
      
      try {
        // Try alternative RPC method
        await supabase.rpc('exec_sql', { query: usersTableSQL });
        await supabase.rpc('exec_sql', { query: ordersTableSQL });
        console.log("Tables created successfully using exec_sql RPC");
      } catch (altError) {
        console.error("Alternative RPC method failed:", altError);
        
        console.warn("Automatic table creation failed. Please manually create the tables using SQL editor in Supabase dashboard");
        console.log("==== SQL COMMANDS TO RUN MANUALLY ====");
        console.log(usersTableSQL);
        console.log(ordersTableSQL);
        console.log("=====================================");
        
        throw new Error("Failed to create tables automatically. Please run the SQL commands manually in the Supabase dashboard.");
      }
    }
    
    console.log("Table setup process completed");
  } catch (error) {
    console.error("Error in createSupabaseTables:", error);
    throw error;
  }
};
