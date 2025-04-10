
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = "https://rfshgepiqrgpvqorohoj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmc2hnZXBpcXJncHZxb3JvaG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzM4MDYsImV4cCI6MjA1OTg0OTgwNn0.EoyBlV9Smj8_h0n_pdsi6MyRUO-W1ZLy2fUOgt0mA00";

console.log("Initializing Supabase client...");

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Define types for database tables (consistent with createTables.ts definitions)
export type DbUser = {
  id: string;
  email: string;
  username: string;
  role: 'customer' | 'booster' | 'admin';
  balance: number;
}

export type DbOrder = {
  id: string;
  user_id: string;
  current_rank: number;
  target_rank: number;
  price: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  booster_id?: string;
  booster_username?: string;
  created_at: string;
  messages: any[];
  game_username?: string;
  game_password?: string;
}

export default supabase;
