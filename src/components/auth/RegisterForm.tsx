
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
      
      // Check localStorage before registration
      console.log('📌 localStorage BEFORE registration:', localStorage.getItem('valorant_registered_users'));
      
      await registerUser(data.email, data.username, data.password);
      
      // ⚠️ Add immediate verification check after registration
      console.log('📌 IMMEDIATE CHECK - localStorage after registration:', localStorage.getItem('valorant_registered_users'));
      
      // Check if user was properly added
      try {
        const usersAfterRegistration = localStorage.getItem('valorant_registered_users');
        if (usersAfterRegistration) {
          const parsedUsers = JSON.parse(usersAfterRegistration);
          const userExists = parsedUsers.some((u: any) => u.email === data.email);
          
          console.log('📌 Verification of new user in localStorage:', {
            found: userExists,
            totalUsers: parsedUsers.length,
            userEmail: data.email
          });
          
          if (!userExists) {
            console.error('⚠️ User not found in localStorage after registration!');
            throw new Error('Registration verification failed');
          } else {
            console.log('✅ User successfully verified in localStorage!');
          }
        } else {
          console.error('⚠️ No users in localStorage after registration!');
          throw new Error('No users found after registration');
        }
      } catch (verificationError) {
        console.error('⚠️ Registration verification error:', verificationError);
        throw new Error('Failed to verify registration');
      }
      
      toast({
        title: 'Kayıt başarılı',
        description: 'Hoş geldiniz! Artık giriş yaptınız.',
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check localStorage after error
      console.log('⚠️ localStorage after registration ERROR:', localStorage.getItem('valorant_registered_users'));
      
      toast({
        title: 'Kayıt başarısız',
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      
      // Final check of localStorage
      console.log('📌 Final localStorage check after registration process:', localStorage.getItem('valorant_registered_users'));
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
