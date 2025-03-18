
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: 'Şifreler eşleşmiyor',
        description: 'Lütfen şifrenizi doğru şekilde tekrar girin.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await register(email, username, password);
      toast({
        title: 'Kayıt başarılı',
        description: 'Hoş geldiniz! Artık giriş yaptınız.',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Kayıt başarısız',
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
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
            <h1 className="text-3xl font-bold mb-2 font-heading">Hemen <span className="gradient-text">Kayıt Olun</span></h1>
            <p className="text-gray-400">Valorant boost hizmetimize erişim için hesap oluşturun</p>
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-8 shadow-xl">
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
              
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">Kullanıcı Adı</label>
                <Input
                  type="text"
                  id="username"
                  placeholder="kullanici_adi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-valorant-gray/20 border-valorant-gray/30 text-white placeholder:text-gray-500 focus:border-valorant-green focus:ring-valorant-green"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Şifre</label>
                <Input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-valorant-gray/20 border-valorant-gray/30 text-white placeholder:text-gray-500 focus:border-valorant-green focus:ring-valorant-green"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-400 mb-1">Şifre Tekrar</label>
                <Input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Kayıt Yapılıyor...
                  </>
                ) : (
                  'Kayıt Ol'
                )}
              </Button>
            </form>
            
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
