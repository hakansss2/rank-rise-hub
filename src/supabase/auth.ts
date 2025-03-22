import { supabase } from './client';

// Kullanıcı arayüzü
export interface SupabaseUser {
  id: string;
  email: string | null;
  username: string;
  role: 'customer' | 'booster' | 'admin';
  balance: number;
}

// Admin hesap bilgileri listesi
const ADMIN_ACCOUNTS = [
  {
    email: "hakan200505@gmail.com",
    password: "Metin2398@",
    id: "admin-user-id-1",
    username: "admin",
    role: "admin" as const,
    balance: 5000
  },
  {
    email: "admin@rankrisehub.com",
    password: "Admin123!",
    id: "admin-user-id-2",
    username: "rankrise-admin",
    role: "admin" as const,
    balance: 10000
  }
];

// Kayıt fonksiyonu
export const registerUser = async (
  email: string, 
  username: string, 
  password: string
): Promise<SupabaseUser> => {
  try {
    console.log("Kayıt işlemi başlatılıyor:", email);
    
    // Admin için özel durum kontrolü
    const adminAccount = ADMIN_ACCOUNTS.find(
      admin => admin.email === email && admin.password === password
    );
    
    if (adminAccount) {
      console.log("Admin hesabı tespit edildi, özel giriş yapılıyor");
      return {
        id: adminAccount.id,
        email: adminAccount.email,
        username: adminAccount.username,
        role: adminAccount.role,
        balance: adminAccount.balance
      };
    }
    
    console.log("Supabase Auth kaydı oluşturuluyor...");
    
    // Supabase Authentication ile kullanıcı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          role: "customer",
          balance: 0
        }
      }
    });
    
    if (authError) {
      console.error("Supabase Auth hatası:", authError.message);
      throw new Error(authError.message);
    }
    
    if (!authData.user) {
      throw new Error("Kullanıcı oluşturulamadı.");
    }
    
    console.log("Supabase Auth kaydı oluşturuldu:", authData.user.id);
    
    // Kullanıcı bilgilerini Supabase veritabanına kaydet
    const userData: SupabaseUser = {
      id: authData.user.id,
      email: authData.user.email,
      username,
      role: "customer",
      balance: 0
    };
    
    console.log("Kullanıcı bilgileri Supabase veritabanına kaydediliyor...");
    
    try {
      // İlk olarak users tablosunun varlığını kontrol et
      const { count, error: checkError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (checkError && checkError.message.includes('does not exist')) {
        console.log("Users tablosu bulunamadı, oturum bilgileri ile devam ediliyor");
        
        // Tablo yok, sadece auth verisini kullan ve başarılı say
        return {
          id: authData.user.id,
          email: authData.user.email,
          username,
          role: "customer",
          balance: 0
        };
      }
      
      // Tablo varsa veri eklemeyi dene
      const { error: dbError } = await supabase
        .from('users')
        .insert([userData]);
      
      if (dbError) {
        console.error("Supabase DB kaydı sırasında hata:", dbError);
        
        // Hata ciddi değilse, auth verisini kullanarak devam et
        if (dbError.code === '23505') { // duplicate key error
          console.log("Kullanıcı zaten tabloda var, devam ediliyor");
          return userData;
        }
        
        // Kullanıcı oluşturuldu ancak profil oluşturulamadı, temizlik yap
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
          console.log("Auth kullanıcı silindi çünkü DB kaydı başarısız oldu");
        } catch (deleteError) {
          console.error("Kullanıcı silme yetkisi yok:", deleteError);
        }
        
        throw new Error("Kullanıcı profili oluşturulamadı. Lütfen daha sonra tekrar deneyin.");
      }
      
    } catch (dbOperationError) {
      console.error("Veritabanı işlemi sırasında hata:", dbOperationError);
      
      // Kullanıcı auth'da oluştu ancak veritabanı işlemi başarısız
      // Yine de kullanıcı giriş yapabilsin diye sadece auth verisiyle devam et
      console.log("Kullanıcı auth'da oluşturuldu, veritabanı hatası yok sayılıyor");
      return userData;
    }
    
    console.log("Kullanıcı başarıyla kaydedildi:", userData);
    return userData;
  } catch (error: any) {
    console.error("Kayıt hatası:", error.message);
    
    // Supabase hata kodlarını daha anlaşılır hata mesajlarına çevir
    if (error.message.includes('already exists')) {
      throw new Error("Bu e-posta adresi zaten kullanımda.");
    } else if (error.message.includes('email')) {
      throw new Error("Geçersiz e-posta formatı.");
    } else if (error.message.includes('password')) {
      throw new Error("Şifre çok zayıf. En az 6 karakter olmalıdır.");
    } else if (error.message.includes('network')) {
      throw new Error("Ağ hatası. İnternet bağlantınızı kontrol edin.");
    }
    
    throw new Error(error.message || "Kayıt sırasında beklenmeyen bir hata oluştu.");
  }
};

// Giriş fonksiyonu
export const loginUser = async (
  email: string, 
  password: string
): Promise<SupabaseUser> => {
  try {
    console.log("Giriş işlemi başlatılıyor:", email);
    
    // Admin kontrolü
    const adminAccount = ADMIN_ACCOUNTS.find(
      admin => admin.email === email && admin.password === password
    );
    
    if (adminAccount) {
      console.log("Admin giriş başarılı");
      return {
        id: adminAccount.id,
        email: adminAccount.email,
        username: adminAccount.username,
        role: adminAccount.role,
        balance: adminAccount.balance
      };
    }
    
    // Normal kullanıcı girişi
    console.log("Supabase Auth ile giriş yapılıyor...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.error("Supabase Auth giriş hatası:", authError.message);
      throw new Error(authError.message);
    }
    
    if (!authData.user) {
      throw new Error("Giriş başarısız.");
    }
    
    console.log("Supabase Auth girişi başarılı");
    
    // Kullanıcı bilgilerini Supabase veritabanından al
    console.log("Kullanıcı verileri Supabase veritabanından alınıyor...");
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (dbError) {
      console.error("Kullanıcı verileri alınamadı:", dbError.message);
      
      // Eğer veritabanında kullanıcı yoksa, Auth'daki metadata'yı kullan
      const metadata = authData.user.user_metadata;
      
      if (metadata && metadata.username) {
        const newUserData: SupabaseUser = {
          id: authData.user.id,
          email: authData.user.email,
          username: metadata.username as string,
          role: (metadata.role as 'customer' | 'booster' | 'admin') || 'customer',
          balance: (metadata.balance as number) || 0
        };
        
        // Eksik kullanıcı kaydını oluştur
        const { error: insertError } = await supabase
          .from('users')
          .insert([newUserData]);
        
        if (insertError) {
          console.error("Eksik kullanıcı kaydı oluşturulamadı:", insertError.message);
        } else {
          console.log("Eksik kullanıcı kaydı oluşturuldu");
        }
        
        return newUserData;
      }
      
      // Hiçbir metadata yoksa e-postadan basit bir kullanıcı adı türet
      const defaultUsername = email ? email.split('@')[0] : 'user';
      const newUser: SupabaseUser = {
        id: authData.user.id,
        email: authData.user.email,
        username: defaultUsername,
        role: 'customer',
        balance: 0
      };
      
      // Eksik kullanıcı kaydını oluştur
      const { error: insertError } = await supabase
        .from('users')
        .insert([newUser]);
      
      if (insertError) {
        console.error("Eksik kullanıcı kaydı oluşturulamadı:", insertError.message);
      } else {
        console.log("Eksik kullanıcı kaydı oluşturuldu");
      }
      
      return newUser;
    }
    
    console.log("Kullanıcı verileri başarıyla alındı");
    return userData as SupabaseUser;
  } catch (error: any) {
    console.error("Giriş hatası:", error.message);
    
    // Supabase hata kodlarını daha anlaşılır hata mesajlarına çevir
    if (error.message.includes('credentials')) {
      throw new Error("E-posta veya şifre hatalı.");
    } else if (error.message.includes('email')) {
      throw new Error("Geçersiz e-posta formatı.");
    } else if (error.message.includes('disabled')) {
      throw new Error("Bu hesap devre dışı bırakılmış.");
    } else if (error.message.includes('too many requests')) {
      throw new Error("Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.");
    }
    
    throw new Error(error.message || "Giriş sırasında beklenmeyen bir hata oluştu.");
  }
};

// Çıkış fonksiyonu
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    console.log("Kullanıcı çıkış yaptı");
  } catch (error: any) {
    console.error("Çıkış hatası:", error.message);
    throw new Error("Çıkış yapılırken bir hata oluştu.");
  }
};

// Kullanıcının oturum durumunu izle
export const onAuthStateChanged = (
  callback: (user: any | null) => void
) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // Kullanıcı bilgilerini Supabase'den al
      supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Kullanıcı bilgileri alınamadı:", error.message);
            callback(null);
            return;
          }
          
          callback(data);
        });
    } else if (event === 'SIGNED_OUT') {
      callback(null);
    }
  });
  
  return data.subscription.unsubscribe;
};

// Kullanıcı sayısını getir
export const getUserCount = async (): Promise<number> => {
  try {
    console.log("Kullanıcı sayısı getiriliyor...");
    
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error("Kullanıcı sayısı alma hatası:", error.message);
      return 0;
    }
    
    console.log(`${count} kullanıcı bulundu`);
    return count || 0;
  } catch (error: any) {
    console.error("Kullanıcı sayısı alma hatası:", error.message);
    return 0; // Hata durumunda 0 dön
  }
};

// Kullanıcı bakiyesini güncelle
export const updateUserBalance = async (
  userId: string, 
  amount: number
): Promise<SupabaseUser> => {
  try {
    console.log(`Bakiye güncelleniyor: Kullanıcı ${userId}, Miktar ${amount}`);
    
    // Admin kullanıcıları için özel durum
    const adminAccount = ADMIN_ACCOUNTS.find(admin => admin.id === userId);
    if (adminAccount || userId === "admin-user-id" || userId === "1") {
      console.log("Admin kullanıcısı için bakiye güncelleniyor");
      
      // Admin ID'sini kontrol et ve doğru admin hesabını bul
      let adminUser;
      if (adminAccount) {
        adminUser = {
          id: adminAccount.id,
          email: adminAccount.email,
          username: adminAccount.username,
          role: "admin" as const,
          balance: adminAccount.balance + amount
        };
      } else {
        // Eski admin ID'si ile uyumluluk için
        adminUser = {
          id: "admin-user-id-1",
          email: "hakan200505@gmail.com",
          username: "admin",
          role: "admin" as const,
          balance: 5000 + amount
        };
      }
      
      // Güncellenen veriyi localStorage'a da kaydet
      const stored = localStorage.getItem('valorant_user');
      if (stored) {
        const currentUser = JSON.parse(stored);
        if (currentUser.id === userId || ADMIN_ACCOUNTS.some(admin => admin.email === currentUser.email)) {
          currentUser.balance = adminUser.balance;
          localStorage.setItem('valorant_user', JSON.stringify(currentUser));
        }
      }
      
      return adminUser;
    }
    
    try {
      // Önce kullanıcıyı bulmayı dene
      const { data: userData, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (selectError) {
        console.log("Kullanıcı bulunamadı, auth metadata'dan bilgi alınıyor:", selectError.message);
        
        // Auth kullanıcı bilgisini al
        const { data: authData } = await supabase.auth.getUser();
        
        if (!authData || !authData.user) {
          console.error("Auth kullanıcı bilgisi de alınamadı");
          throw new Error("Kullanıcı bulunamadı");
        }
        
        // Auth metadata'dan kullanıcı oluştur
        const metadata = authData.user.user_metadata;
        const currentBalance = metadata.balance || 0;
        const newBalance = currentBalance + amount;
        
        // Auth metadata'yı güncelle
        const { data: updatedData, error: updateError } = await supabase.auth.updateUser({
          data: { balance: newBalance }
        });
        
        if (updateError) {
          console.error("Auth metadata güncellenirken hata:", updateError.message);
          throw new Error("Kullanıcı bakiyesi güncellenirken hata oluştu");
        }
        
        // Kullanıcı tablosuna eklemeyi dene
        try {
          await supabase.from('users').upsert({
            id: authData.user.id,
            email: authData.user.email,
            username: metadata.username || 'user',
            role: metadata.role || 'customer',
            balance: newBalance
          });
          console.log("Kullanıcı veritabanına eklendi veya güncellendi");
        } catch (upsertError) {
          console.error("Kullanıcı veritabanına eklenirken hata:", upsertError);
          // Bu hatayı yok say, auth metadata güncellendiyse devam et
        }
        
        // Güncellenen kullanıcı bilgisini döndür
        return {
          id: authData.user.id,
          email: authData.user.email,
          username: metadata.username || 'user',
          role: (metadata.role as 'customer' | 'booster' | 'admin') || 'customer',
          balance: newBalance
        };
      }
      
      // Kullanıcı bulundu, bakiyeyi güncelle
      const user = userData as SupabaseUser;
      const newBalance = user.balance + amount;
      
      // Bakiyeyi veritabanında güncelle
      const { data: updatedData, error: updateError } = await supabase
        .from('users')
        .update({ balance: newBalance })
        .eq('id', userId)
        .select()
        .single();
      
      if (updateError) {
        console.error("Bakiye güncellenirken veritabanında hata:", updateError.message);
        
        // Veritabanı hatası durumunda yine de auth metadata'yı güncellemeyi dene
        const { error: authUpdateError } = await supabase.auth.updateUser({
          data: { balance: newBalance }
        });
        
        if (authUpdateError) {
          console.error("Auth metadata da güncellenemedi:", authUpdateError.message);
          throw new Error("Bakiye güncellenemedi");
        }
        
        // Auth metadata güncellendi, güncel bilgiyi döndür
        console.log("Veritabanı hatası, auth metadata güncellendi");
        user.balance = newBalance;
        return user;
      }
      
      // Güncelleme başarılı
      console.log("Bakiye başarıyla güncellendi:", newBalance);
      return updatedData as SupabaseUser;
      
    } catch (dbError: any) {
      console.error("Bakiye güncelleme veritabanı hatası:", dbError.message);
      
      // Son çare olarak localStorage'daki kullanıcıyı güncelle
      try {
        const stored = localStorage.getItem('valorant_user');
        if (stored) {
          const currentUser = JSON.parse(stored);
          if (currentUser.id === userId) {
            currentUser.balance += amount;
            localStorage.setItem('valorant_user', JSON.stringify(currentUser));
            console.log("LocalStorage'da bakiye güncellendi");
            return currentUser;
          }
        }
      } catch (localError) {
        console.error("LocalStorage güncellenirken hata:", localError);
      }
      
      throw new Error("Kullanıcı bulunamadı veya bakiye güncellenemedi");
    }
  } catch (error: any) {
    console.error("Bakiye güncelleme hatası:", error.message);
    throw new Error(error.message || "Bakiye güncellenirken bir hata oluştu.");
  }
};
