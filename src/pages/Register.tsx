
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import RegisterForm from '@/components/auth/RegisterForm';
import RegisterHeader from '@/components/auth/RegisterHeader';
import { monitorLocalStorage, forceRefreshLocalStorage, validateAndRepairLocalStorage } from '@/utils/localStorageMonitor';

const Register = () => {
  const { registeredUsersCount } = useAuth();

  // Kayıt sayfası mount olduğunda localStorage kontrolü ve onarımı
  useEffect(() => {
    console.log('📋 Register component mounted - Validating localStorage and setting up monitoring');
    
    // İlk olarak localStorage'ı onar
    validateAndRepairLocalStorage('valorant_registered_users');
    
    // Mount olduğunda localStorage'ı hemen kontrol et
    const initialUsers = forceRefreshLocalStorage('valorant_registered_users');
    console.log('🔍 Initial localStorage check on Register mount:', 
      initialUsers ? 
        `${initialUsers.length} users found: ${JSON.stringify(initialUsers)}` : 
        'No users found or error parsing');
    
    // Daha sık izleme (her 1 saniye)
    const cleanup = monitorLocalStorage('valorant_registered_users', '🔎 Register', 1000);
    
    // Asenkron işlemleri yakalamak için 1 saniye sonra ikinci bir kontrol planla
    const secondCheckTimer = setTimeout(() => {
      console.log('⏱️ Scheduled second localStorage check...');
      const secondCheck = forceRefreshLocalStorage('valorant_registered_users');
      console.log('🔍 Secondary localStorage check result:', 
        secondCheck ? 
          `${secondCheck.length} users found: ${JSON.stringify(secondCheck)}` : 
          'No users found or error parsing');
    }, 1000);
    
    // Başka bir kontrol daha ekle - bazen işlemler gecikebilir
    const thirdCheckTimer = setTimeout(() => {
      console.log('⏱️ Scheduled third localStorage check...');
      const thirdCheck = forceRefreshLocalStorage('valorant_registered_users');
      console.log('🔍 Third localStorage check result:', 
        thirdCheck ? 
          `${thirdCheck.length} users found: ${JSON.stringify(thirdCheck)}` : 
          'No users found or error parsing');
          
      // localStorage'daki verileri doğrula ve onar
      validateAndRepairLocalStorage('valorant_registered_users');
    }, 3000);
    
    return () => {
      console.log('📋 Register component unmounting - Cleaning up monitors and timers');
      cleanup();
      clearTimeout(secondCheckTimer);
      clearTimeout(thirdCheckTimer);
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
