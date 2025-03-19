import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Form schema with validations
const formSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin.'),
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalı.'),
  password: z.string()
    .min(6, 'Şifre en az 6 karakter olmalı.')
    .regex(/[A-Z]/, 'Şifrede en az bir büyük harf olmalı.')
    .regex(/[0-9]/, 'Şifrede en az bir sayı olmalı.'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser, registeredUsersCount } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check localStorage on component mount
  useEffect(() => {
    // Immediately check localStorage for existing users
    console.log('🔎 Register - Initial localStorage check:', localStorage.getItem('valorant_registered_users'));
    try {
      const storedData = localStorage.getItem('valorant_registered_users');
      const parsedData = storedData ? JSON.parse(storedData) : [];
      console.log('🔎 Register - Parsed user count:', parsedData.length);
    } catch (e) {
      console.error('🔎 Register - Error parsing localStorage:', e);
    }
  }, []);

  // Set up form with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      console.log(`📌 Attempting to register user: ${data.username}, ${data.email}`);
      
      // Check localStorage before registration
      console.log('📌 localStorage BEFORE registration:', localStorage.getItem('valorant_registered_users'));
      console.log('📌 Current registered users count BEFORE registration:', registeredUsersCount);
      
      // Manually verify localStorage content for debugging
      try {
        const rawData = localStorage.getItem('valorant_registered_users');
        const parsedUsers = rawData ? JSON.parse(rawData) : [];
        console.log('📌 Manual parsing of localStorage BEFORE registration:', 
          Array.isArray(parsedUsers) ? parsedUsers.length : 'Not an array', parsedUsers);
      } catch (e) {
        console.error('📌 Error parsing localStorage BEFORE registration:', e);
      }
      
      await registerUser(data.email, data.username, data.password);
      
      // Check localStorage after registration
      console.log('📌 localStorage AFTER registration:', localStorage.getItem('valorant_registered_users'));
      
      // Manually verify localStorage content after registration
      try {
        const rawData = localStorage.getItem('valorant_registered_users');
        const parsedUsers = rawData ? JSON.parse(rawData) : [];
        console.log('📌 Manual parsing of localStorage AFTER registration:', 
          Array.isArray(parsedUsers) ? parsedUsers.length : 'Not an array', parsedUsers);
      } catch (e) {
        console.error('📌 Error parsing localStorage AFTER registration:', e);
      }
      
      console.log('📌 Updated registered users count AFTER registration:', registeredUsersCount);
      
      toast({
        title: 'Kayıt başarılı',
        description: 'Hoş geldiniz! Artık giriş yaptınız.',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Kayıt başarısız',
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      
      // Final check of localStorage
      console.log('📌 Final localStorage check after registration:', localStorage.getItem('valorant_registered_users'));
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
            {registeredUsersCount > 0 && (
              <p className="text-sm text-valorant-green mt-2">Şu ana kadar {registeredUsersCount} kişi kayıt oldu!</p>
            )}
          </div>
          
          <div className="bg-valorant-black border border-valorant-gray/30 rounded-xl p-8 shadow-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">E-posta</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="e-posta@ornegi.com"
                          className="bg-valorant-gray/20 border-valorant-gray/30 text-white placeholder:text-gray-500 focus:border-valorant-green focus:ring-valorant-green"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Kullanıcı Adı</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="kullanici_adi"
                          className="bg-valorant-gray/20 border-valorant-gray/30 text-white placeholder:text-gray-500 focus:border-valorant-green focus:ring-valorant-green"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Şifre</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-valorant-gray/20 border-valorant-gray/30 text-white placeholder:text-gray-500 focus:border-valorant-green focus:ring-valorant-green"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500 mt-1">
                        <p>Şifre en az 6 karakter, 1 büyük harf ve 1 sayı içermelidir.</p>
                      </div>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Şifre Tekrar</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="bg-valorant-gray/20 border-valorant-gray/30 text-white placeholder:text-gray-500 focus:border-valorant-green focus:ring-valorant-green"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-valorant-green hover:bg-valorant-darkGreen text-white py-5 rounded-md font-medium transition-all duration-300 mt-6"
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
            </Form>
            
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
