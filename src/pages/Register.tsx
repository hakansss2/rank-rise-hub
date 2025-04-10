
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import RegisterForm from '@/components/auth/RegisterForm';
import RegisterHeader from '@/components/auth/RegisterHeader';
import { supabase } from '@/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseTables } from '@/supabase/createTables';

const Register = () => {
  const { registeredUsersCount } = useAuth();
  const { toast } = useToast();
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(true);

  // Check Supabase connection and create tables if needed
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        setIsCheckingSupabase(true);
        console.log("Register page - Checking Supabase connection and tables");
        
        // Check if the users table exists
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('count', { count: 'exact', head: true });
        
        if (usersError) {
          console.log("Supabase users table check error:", usersError.message);
          
          if (usersError.message.includes('does not exist')) {
            // Try to create the tables
            try {
              await createSupabaseTables();
              toast({
                title: "Database tables created",
                description: "User table has been created. You can now register.",
              });
            } catch (error: any) {
              console.error("Table creation error:", error);
              toast({
                title: "Database creation error",
                description: "Could not create user table. Please try again.",
                variant: "destructive"
              });
            }
          }
        } else {
          console.log("Users table exists, count:", usersData);
          toast({
            title: "Supabase connection successful",
            description: "You can now register."
          });
        }
      } catch (error) {
        console.error("Supabase check error:", error);
        toast({
          title: "Connection error",
          description: "Could not connect to the server. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsCheckingSupabase(false);
      }
    };

    checkSupabaseStatus();
  }, [toast]);

  return (
    <div className="min-h-screen bg-valorant-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-md mx-auto">
          <RegisterHeader />
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-8 shadow-xl">
            {isCheckingSupabase ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-valorant-green mx-auto mb-4"></div>
                <p className="text-gray-400">Checking Supabase connection...</p>
              </div>
            ) : (
              <RegisterForm registeredUsersCount={registeredUsersCount} />
            )}
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-valorant-green hover:text-valorant-darkGreen transition-colors font-medium">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;
