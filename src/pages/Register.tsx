
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import RegisterForm from '@/components/auth/RegisterForm';
import RegisterHeader from '@/components/auth/RegisterHeader';
import { supabase } from '@/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const { registeredUsersCount } = useAuth();
  const { toast } = useToast();
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(true);

  // Supabase bağlantısı kontrolü
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        setIsCheckingSupabase(true);
        console.log("Kayıt sayfası - Supabase durumu kontrol ediliyor");
        
        // Users tablosunu kontrol et
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('count', { count: 'exact', head: true });
        
        if (usersError) {
          console.log("Supabase users tablosu kontrolü hatası:", usersError.message);
          
          if (usersError.message.includes('does not exist')) {
            // Tablo oluşturma deneyin
            try {
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
                toast({
                  title: "Veritabanı oluşturma hatası",
                  description: "Kullanıcı tablosu oluşturulamadı. Lütfen Supabase kontrol panelinden tabloları oluşturun.",
                  variant: "destructive"
                });
              } else {
                toast({
                  title: "Kullanıcı tablosu oluşturuldu",
                  description: "Artık kayıt olabilirsiniz.",
                });
              }
            } catch (error) {
              console.error("Tablo oluşturma hatası:", error);
            }
          }
        } else {
          toast({
            title: "Supabase bağlantısı başarılı",
            description: "Kayıt yapabilirsiniz."
          });
        }
        
        // Orders tablosunu kontrol et
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('count', { count: 'exact', head: true });
        
        if (ordersError) {
          console.log("Supabase orders tablosu kontrolü hatası:", ordersError.message);
          
          if (ordersError.message.includes('does not exist')) {
            // Tablo oluşturma deneyin
            try {
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
              } else {
                console.log("Orders tablosu başarıyla oluşturuldu");
              }
            } catch (error) {
              console.error("Tablo oluşturma hatası:", error);
            }
          }
        }
      } catch (error) {
        console.error("Supabase kontrol hatası:", error);
        toast({
          title: "Bağlantı hatası",
          description: "Sunucu ile bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.",
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
                <p className="text-gray-400">Supabase bağlantısı kontrol ediliyor...</p>
              </div>
            ) : (
              <RegisterForm registeredUsersCount={registeredUsersCount} />
            )}
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-400">
                Zaten bir hesabınız var mı?{' '}
                <Link to="/login" className="text-valorant-green hover:text-valorant-darkGreen transition-colors font-medium">
                  Giriş Yapın
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
