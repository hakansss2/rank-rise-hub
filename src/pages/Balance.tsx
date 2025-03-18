
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CreditCard, Plus, Phone } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const Balance = () => {
  const { user, addBalance, formatBalance } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAddBalance = async () => {
    if (!amount || amount <= 0) {
      toast({
        variant: "destructive",
        title: "Geçersiz Miktar",
        description: "Lütfen geçerli bir miktar giriniz."
      });
      return;
    }

    if (!phoneNumber || phoneNumber.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Geçersiz Telefon Numarası",
        description: "Lütfen geçerli bir telefon numarası giriniz."
      });
      return;
    }

    setIsProcessing(true);
    try {
      // This is where payment gateway integration would happen
      // For now, we'll just add the balance directly
      await addBalance(amount);
      toast({
        title: "Bakiye Yüklendi!",
        description: `${amount.toLocaleString('tr-TR')} ₺ bakiye hesabınıza eklendi.`,
      });
      setAmount(0);
      setPhoneNumber('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "İşlem Başarısız",
        description: "Bakiye yükleme işlemi sırasında bir hata oluştu."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const predefinedAmounts = [100, 250, 500, 1000, 2500];

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Bakiye Yükleme</h1>
        <p className="text-muted-foreground">Hesabınıza bakiye yükleyerek hızlı ve kolay şekilde ödeme yapabilirsiniz.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Hızlı Bakiye Yükleme</CardTitle>
              <CardDescription>
                Aşağıdaki seçeneklerden birini seçin veya özel miktar girin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {predefinedAmounts.map((presetAmount) => (
                  <Button
                    key={presetAmount}
                    variant={amount === presetAmount ? "default" : "outline"}
                    onClick={() => setAmount(presetAmount)}
                    className="h-16"
                  >
                    {presetAmount.toLocaleString('tr-TR')} ₺
                  </Button>
                ))}
                <div className="col-span-3 mt-2">
                  <Label htmlFor="custom-amount" className="text-sm font-medium mb-1 block">
                    Özel Miktar (₺)
                  </Label>
                  <Input
                    id="custom-amount"
                    type="number"
                    min="1"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="Miktar giriniz"
                    className="h-12"
                  />
                </div>

                <div className="col-span-3 mt-2">
                  <Label htmlFor="phone-number" className="text-sm font-medium mb-1 block">
                    Telefon Numarası
                  </Label>
                  <div className="flex items-center gap-2">
                    <Phone size={20} className="text-muted-foreground" />
                    <Input
                      id="phone-number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      className="h-12"
                    />
                  </div>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full mt-4" 
                    disabled={amount <= 0 || isProcessing || !phoneNumber}
                    size="lg"
                  >
                    <CreditCard className="mr-2" />
                    {amount > 0 
                      ? `${amount.toLocaleString('tr-TR')} ₺ Yükle` 
                      : 'Bakiye Yükle'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ödeme Onayı</DialogTitle>
                    <DialogDescription>
                      Hesabınıza {amount.toLocaleString('tr-TR')} ₺ bakiye yüklemek üzeresiniz.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Bu demo sürümünde gerçek ödeme işlemi yapılmamaktadır. 
                      Onayladığınızda bakiyeniz otomatik olarak artacaktır.
                    </p>
                    <p className="text-sm font-medium">
                      Telefon: {phoneNumber}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Tutar: {amount.toLocaleString('tr-TR')} ₺
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      Gerçek uygulamada bu aşamada ödeme sağlayıcısının formu görüntülenecektir.
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAmount(0)}>
                      İptal
                    </Button>
                    <Button 
                      onClick={handleAddBalance} 
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'İşleniyor...' : 'Ödemeyi Onayla'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Hesap Bakiyesi</CardTitle>
              <CardDescription>Mevcut bakiyeniz</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <Wallet className="w-12 h-12 mx-auto mb-4 text-valorant-green" />
              <div className="text-3xl font-bold text-valorant-green">
                {user ? formatBalance('TRY') : '0 ₺'}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Hesabıma Dön
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Balance;
