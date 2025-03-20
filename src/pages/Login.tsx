
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/supabase/client';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Supabase bağlantısını test et
  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        console.log("Supabase bağlantı durumu: Kontrol ediliyor...");
        
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error("Supabase bağlantı hatası:", error.message);
        } else {
          console.log("Supabase bağlantısı başarılı");
        }
      } catch (error) {
        console.error("Supabase kontrol hatası:", error);
      }
    };

    testSupabaseConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log(`Giriş işlemi başlatılıyor: ${email}`);
      
      // Admin direkt giriş (test için)
      if (email === "hakan200505@gmail.com" && password === "Metin2398@") {
        console.log("Admin girişi tespit edildi");
      }
      
      await login(email, password);
      console.log("Giriş başarılı, yönlendiriliyor...");
      
      toast({
        title: 'Giriş başarılı',
        description: 'Hoş geldiniz!',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Giriş hatası:", error);
      
      // Hata mesajını göster
      setErrorMessage(error.message || 'Giriş başarısız. Lütfen tekrar deneyin.');
      
      toast({
        title: 'Giriş başarısız',
        description: error.message || 'E-posta veya şifre hatalı. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-valorant-black text-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 font-heading">Hesabınıza <span className="gradient-text">Giriş Yapın</span></h1>
            <p className="text-gray-400">Valorant boost hizmetimize erişim için giriş yapın</p>
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-8 shadow-xl">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
                <p>{errorMessage}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">E-posta</label>
                <Input
                  type="email"
                  id="email"
                  placeholder="e-posta@ornegi.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-valorant-gray/20 border-valorant-gray/30 text-white placeholder:text-gray-500 focus:border-valorant-green focus:ring-valorant-green"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Şifre</label>
                <Input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-valorant-gray/20 border-valorant-gray/30 text-white placeholder:text-gray-500 focus:border-valorant-green focus:ring-valorant-green"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-valorant-green hover:bg-valorant-darkGreen text-white py-5 rounded-md font-medium transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş Yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <p className="text-gray-400">
                Henüz bir hesabınız yok mu?{' '}
                <Link to="/register" className="text-valorant-green hover:text-valorant-darkGreen transition-colors font-medium">
                  Kayıt Olun
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

export default Login;
