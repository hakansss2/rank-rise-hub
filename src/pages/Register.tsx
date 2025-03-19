
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import RegisterForm from '@/components/auth/RegisterForm';
import RegisterHeader from '@/components/auth/RegisterHeader';
import { monitorLocalStorage, forceRefreshLocalStorage } from '@/utils/localStorageMonitor';

const Register = () => {
  const { registeredUsersCount } = useAuth();

  // Periodic check of localStorage for debugging
  useEffect(() => {
    console.log('📋 Register component mounted - Setting up localStorage monitoring');
    const cleanup = monitorLocalStorage('valorant_registered_users', '🔎 Register');
    
    // Force an immediate refresh to verify data
    const initialUsers = forceRefreshLocalStorage('valorant_registered_users');
    console.log('📊 Initial users data on Register mount:', initialUsers);
    
    return () => {
      console.log('📋 Register component unmounting - Cleaning up localStorage monitor');
      cleanup();
    };
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
