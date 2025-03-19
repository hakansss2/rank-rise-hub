
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import RegisterForm from '@/components/auth/RegisterForm';
import RegisterHeader from '@/components/auth/RegisterHeader';
import { 
  monitorLocalStorage, 
  forceRefreshLocalStorage, 
  validateAndRepairLocalStorage,
  setupAggressiveRefresh
} from '@/utils/localStorageMonitor';

const Register = () => {
  const { registeredUsersCount } = useAuth();

  // Kayıt sayfası mount olduğunda localStorage kontrolü ve onarımı
  useEffect(() => {
    console.log('📋 Register component mounted - Setting up intensive localStorage monitoring');
    
    // İlk olarak localStorage'ı onar
    validateAndRepairLocalStorage('valorant_registered_users');
    
    // Daha agresif yenileme kur (callback olmayan versiyon)
    const aggressiveCleanup = setupAggressiveRefresh('valorant_registered_users');
    
    // Ayrıca normal izleme de kur (daha az sıklıkta)
    const monitorCleanup = monitorLocalStorage('valorant_registered_users', '🔎 Register', 2000);
    
    // Kayıt sonrası beklenen işlemleri planla
    const postRegisterCheck = setTimeout(() => {
      console.log('⏱️ Post-registration checks starting...');
      
      // localStorage'ı tekrar kontrol et ve onar
      validateAndRepairLocalStorage('valorant_registered_users');
      
      // En güncel verileri al
      const latestData = forceRefreshLocalStorage('valorant_registered_users');
      console.log('📊 Post-registration data check:', latestData);
      
    }, 1000);
    
    return () => {
      console.log('📋 Register component unmounting - Cleaning up all monitors');
      aggressiveCleanup();
      monitorCleanup();
      clearTimeout(postRegisterCheck);
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
