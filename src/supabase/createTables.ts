
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
    
    // Execute SQL using RPC (if available)
    try {
      await supabase.rpc('execute_sql', { sql: usersTableSQL });
      await supabase.rpc('execute_sql', { sql: ordersTableSQL });
      console.log("Tables created or verified successfully");
    } catch (rpcError) {
      console.error("RPC method not available, trying direct query", rpcError);
      
      // Fallback to direct query if RPC not available
      // Note: This may require elevated permissions
      await supabase.from('_database').select('*').execute(usersTableSQL);
      await supabase.from('_database').select('*').execute(ordersTableSQL);
    }
    
    console.log("Table creation completed");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw new Error("Failed to create database tables");
  }
};
