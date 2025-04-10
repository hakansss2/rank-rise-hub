
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://rfshgepiqrgpvqorohoj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmc2hnZXBpcXJncHZxb3JvaG9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNzM4MDYsImV4cCI6MjA1OTg0OTgwNn0.EoyBlV9Smj8_h0n_pdsi6MyRUO-W1ZLy2fUOgt0mA00";

// Extended Database type with custom tables definition
type ExtendedDatabase = {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          user_id: string;
          current_rank: number;
          target_rank: number;
          price: number;
          status: string;
          booster_id?: string;
          booster_username?: string;
          created_at: string;
          messages: any[];
          game_username?: string;
          game_password?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_rank: number;
          target_rank: number;
          price: number;
          status: string;
          booster_id?: string;
          booster_username?: string;
          created_at?: string;
          messages?: any[];
          game_username?: string;
          game_password?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          current_rank?: number;
          target_rank?: number;
          price?: number;
          status?: string;
          booster_id?: string;
          booster_username?: string;
          created_at?: string;
          messages?: any[];
          game_username?: string;
          game_password?: string;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          role: string;
          balance: number;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          role: string;
          balance?: number;
        };
        Update: {
          id?: string;
          email?: string;
          username?: string;
          role?: string;
          balance?: number;
        };
      };
    };
  };
};

export const supabase = createClient<ExtendedDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export default supabase;
