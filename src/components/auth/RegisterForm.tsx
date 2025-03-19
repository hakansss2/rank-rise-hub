
import React, { useState } from 'react';
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
import { forceRefreshLocalStorage, validateAndRepairLocalStorage } from '@/utils/localStorageMonitor';

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

interface RegisterFormProps {
  registeredUsersCount: number;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ registeredUsersCount }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
      
      // Validate and repair localStorage before registration
      validateAndRepairLocalStorage('valorant_registered_users');
      
      // Check localStorage before registration
      console.log('📌 localStorage BEFORE registration:', localStorage.getItem('valorant_registered_users'));
      
      // Force a check of current users before registration
      const usersBeforeRegistration = forceRefreshLocalStorage('valorant_registered_users');
      console.log('📌 Users BEFORE registration:', 
        Array.isArray(usersBeforeRegistration) ? usersBeforeRegistration.length : 0);
      
      // Attempt registration
      await registerUser(data.email, data.username, data.password);
      
      // Force multiple immediate checks after registration for consistency
      const checkAfterRegistration = () => {
        // Force immediate check after registration 
        const usersAfterRegistration = forceRefreshLocalStorage('valorant_registered_users');
        console.log('📌 IMMEDIATE CHECK - localStorage after registration:', usersAfterRegistration);
        
        // Check if user was properly added with improved verification
        try {
          if (usersAfterRegistration && Array.isArray(usersAfterRegistration)) {
            const userExists = usersAfterRegistration.some((u: any) => u.email === data.email);
            
            console.log('📌 Verification of new user in localStorage:', {
              found: userExists,
              totalUsers: usersAfterRegistration.length,
              userEmail: data.email
            });
            
            if (!userExists) {
              console.error('⚠️ User not found in localStorage after registration!');
              
              // Try one more time
              setTimeout(() => {
                const finalUsers = forceRefreshLocalStorage('valorant_registered_users');
                const userFoundInFinal = finalUsers && Array.isArray(finalUsers) && 
                  finalUsers.some((u: any) => u.email === data.email);
                
                console.log('📌 FINAL verification check:', {
                  found: userFoundInFinal,
                  totalUsers: Array.isArray(finalUsers) ? finalUsers.length : 0
                });
                
                // Attempt to trigger storage event for other tabs
                try {
                  window.dispatchEvent(new Event('storage'));
                } catch (e) {
                  console.error('Failed to dispatch storage event:', e);
                }
              }, 500);
            } else {
              console.log('✅ User successfully verified in localStorage!');
              
              // Attempt to trigger storage event for other tabs
              try {
                window.dispatchEvent(new Event('storage'));
              } catch (e) {
                console.error('Failed to dispatch storage event:', e);
              }
            }
          } else {
            console.error('⚠️ Invalid or no users in localStorage after registration!');
          }
        } catch (verificationError) {
          console.error('⚠️ Registration verification error:', verificationError);
        }
      };
      
      // Run multiple checks with increasing delays for better reliability
      checkAfterRegistration();
      setTimeout(checkAfterRegistration, 300);
      setTimeout(checkAfterRegistration, 800);
      
      toast({
        title: 'Kayıt başarılı',
        description: 'Hoş geldiniz! Artık giriş yaptınız.',
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check localStorage after error with more detailed info
      const usersAfterError = forceRefreshLocalStorage('valorant_registered_users');
      console.log('⚠️ localStorage after registration ERROR:', usersAfterError);
      
      toast({
        title: 'Kayıt başarısız',
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      
      // Final check of localStorage with detailed logging
      const finalUsers = forceRefreshLocalStorage('valorant_registered_users');
      console.log('📌 Final localStorage check after registration process:', 
        finalUsers ? `${finalUsers.length} users found` : 'No users found');
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
