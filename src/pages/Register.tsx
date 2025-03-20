
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import RegisterForm from '@/components/auth/RegisterForm';
import RegisterHeader from '@/components/auth/RegisterHeader';
import { supabase } from '@/supabase/client';

const Register = () => {
  const { registeredUsersCount } = useAuth();

  // Supabase bağlantısı kontrolü
  useEffect(() => {
    const checkSupabaseStatus = async () => {
      try {
        console.log("Kayıt sayfası - Supabase durumu kontrol ediliyor");
        
        // Basit bir sorgu ile Supabase bağlantısını kontrol et
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error("Supabase kontrol hatası:", error.message);
        } else {
          console.log("Supabase bağlantısı başarılı");
        }
      } catch (error) {
        console.error("Supabase kontrol hatası:", error);
      }
    };

    checkSupabaseStatus();
  }, []);

  return (
    <div className="min-h-screen bg-valorant-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-md mx-auto">
          <RegisterHeader />
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-8 shadow-xl">
            <RegisterForm registeredUsersCount={registeredUsersCount} />
            
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
