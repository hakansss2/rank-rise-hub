import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { STORAGE_KEYS, refreshData, syncAllTabs } from '@/utils/storageService';

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

interface RegisterFormProps {
  registeredUsersCount: number;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ registeredUsersCount }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const latestUsers = refreshData(STORAGE_KEYS.USERS, []);
        console.log('📌 RegisterForm - Periodic refresh of users count:', latestUsers.length);
      } catch (error) {
        console.error('❌ Error in periodic refresh:', error);
      }
    }, 3000); // Check every 3 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      console.log(`📌 Attempting to register user: ${data.username}, ${data.email}`);
      
      for (let i = 0; i < 3; i++) {
        console.log(`📌 Pre-registration check ${i+1}: Refreshing users data`);
        refreshData(STORAGE_KEYS.USERS, []);
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      await registerUser(data.email, data.username, data.password);
      
      syncAllTabs();
      
      const verifyRegistration = async () => {
        try {
          const usersAfterRegistration = refreshData(STORAGE_KEYS.USERS, []);
          console.log('📌 Verification check - users after registration:', usersAfterRegistration.length);
          
          const userExists = usersAfterRegistration.some((u: any) => u.email === data.email);
          console.log('📌 New user verification:', { found: userExists, email: data.email });
          
          if (!userExists) {
            console.error('❌ User registration verification failed - user not found in storage');
          }
          
          syncAllTabs();
        } catch (error) {
          console.error('❌ Error in registration verification:', error);
        }
      };
      
      await verifyRegistration();
      setTimeout(() => verifyRegistration(), 500);
      setTimeout(() => verifyRegistration(), 1500);
      
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
    }
  };

  return (
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

      {registeredUsersCount > 0 && (
        <p className="text-sm text-valorant-green mt-4 text-center">
          Şu ana kadar {registeredUsersCount} kişi kayıt oldu!
        </p>
      )}
    </Form>
  );
};

export default RegisterForm;
