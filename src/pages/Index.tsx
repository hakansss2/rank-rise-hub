
import React from 'react';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import Hero from '@/components/home/hero';
import RankBoost from '@/components/home/rankBoost';
import { CheckCircle, Users, MessageSquare, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-valorant-black text-white">
      <Navbar />
      <Hero />
      
      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-valorant-black to-valorant-black/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Neden <span className="gradient-text">VALORANK</span>?</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Profesyonel rank boost hizmetimizle fark yaratıyoruz. İşimizi en iyi şekilde yapıyoruz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-valorant-black p-6 rounded-lg border border-valorant-gray/30 hover:border-valorant-green/30 transition-all duration-300 group hover-scale">
              <div className="p-3 bg-valorant-green/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-valorant-green/20 transition-all duration-300">
                <CheckCircle className="w-8 h-8 text-valorant-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">%100 Güvenli</h3>
              <p className="text-gray-400">
                Hesap güvenliğiniz bizim için önemli. Bilgileriniz şifrelenerek korunur.
              </p>
            </div>
            
            <div className="bg-valorant-black p-6 rounded-lg border border-valorant-gray/30 hover:border-valorant-green/30 transition-all duration-300 group hover-scale">
              <div className="p-3 bg-valorant-green/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-valorant-green/20 transition-all duration-300">
                <Users className="w-8 h-8 text-valorant-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Pro Boosterlar</h3>
              <p className="text-gray-400">
                Yüksek rankta olan profesyonel oyuncularımız hizmetinizdedir.
              </p>
            </div>
            
            <div className="bg-valorant-black p-6 rounded-lg border border-valorant-gray/30 hover:border-valorant-green/30 transition-all duration-300 group hover-scale">
              <div className="p-3 bg-valorant-green/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-valorant-green/20 transition-all duration-300">
                <MessageSquare className="w-8 h-8 text-valorant-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Canlı Destek</h3>
              <p className="text-gray-400">
                Boosterınız ile direkt iletişim kurabilir, süreci takip edebilirsiniz.
              </p>
            </div>
            
            <div className="bg-valorant-black p-6 rounded-lg border border-valorant-gray/30 hover:border-valorant-green/30 transition-all duration-300 group hover-scale">
              <div className="p-3 bg-valorant-green/10 rounded-full w-16 h-16 flex items-center justify-center mb-6 group-hover:bg-valorant-green/20 transition-all duration-300">
                <Shield className="w-8 h-8 text-valorant-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Gizlilik</h3>
              <p className="text-gray-400">
                Kişisel ve hesap bilgileriniz tamamen gizli tutulur.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <RankBoost />
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-valorant-black/95 to-valorant-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Müşteri <span className="gradient-text">Yorumları</span></h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Hizmetimizi kullanan müşterilerimizin değerli görüşleri
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-valorant-black p-8 rounded-lg border border-valorant-gray/30 hover-scale">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-valorant-green/20 flex items-center justify-center text-white font-bold">M</div>
                <div className="ml-3">
                  <h4 className="font-bold">Mehmet K.</h4>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300">
                "İnanılmaz hızlı bir şekilde Altın'dan Platin'e yükseldim. Booster çok profesyoneldi ve sürekli iletişim halindeydik. Kesinlikle tavsiye ediyorum!"
              </p>
            </div>
            
            <div className="bg-valorant-black p-8 rounded-lg border border-valorant-gray/30 hover-scale">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-valorant-green/20 flex items-center justify-center text-white font-bold">A</div>
                <div className="ml-3">
                  <h4 className="font-bold">Ayşe Y.</h4>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300">
                "Gümüş'ten Altın 2'ye çıktım. Booster çok kibar ve sabırlıydı. Hesabım güvende hissettim ve süreç çok şeffaftı. Tekrar kullanacağım."
              </p>
            </div>
            
            <div className="bg-valorant-black p-8 rounded-lg border border-valorant-gray/30 hover-scale">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-valorant-green/20 flex items-center justify-center text-white font-bold">E</div>
                <div className="ml-3">
                  <h4 className="font-bold">Emre T.</h4>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-300">
                "Elmas'a yükselme sürecim çok hızlı ve sorunsuz geçti. Boosterlar gerçekten işinin ehli ve fiyatlar piyasaya göre çok uygun. Teşekkürler VALORANK!"
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 bg-valorant-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Sıkça Sorulan <span className="gradient-text">Sorular</span></h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Aklınızdaki soruların cevaplarını bulun
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto divide-y divide-valorant-gray/30">
            <div className="py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Boost işlemi ne kadar sürer?</h3>
                <span className="text-valorant-green">+</span>
              </div>
              <div className="mt-3">
                <p className="text-gray-400">
                  Boost süresi, mevcut ve hedef rankınız arasındaki farka bağlıdır. Genellikle 1-3 gün içerisinde tamamlanır.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Hesap bilgilerim güvende mi?</h3>
                <span className="text-valorant-green">+</span>
              </div>
              <div className="mt-3">
                <p className="text-gray-400">
                  Evet, tüm hesap bilgileriniz şifrelenerek saklanır ve sadece boost işlemi için kullanılır. İşlem sonrası şifrenizi değiştirmenizi öneririz.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Boost işlemi sırasında hesabımı kullanabilir miyim?</h3>
                <span className="text-valorant-green">+</span>
              </div>
              <div className="mt-3">
                <p className="text-gray-400">
                  Boost işlemi sırasında hesabınızı kullanmamanızı öneririz. Bu, işlemin daha hızlı tamamlanmasını sağlar ve hesap güvenliğinizi korur.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">Ödeme yöntemleri nelerdir?</h3>
                <span className="text-valorant-green">+</span>
              </div>
              <div className="mt-3">
                <p className="text-gray-400">
                  Kredi kartı, banka havalesi ve online ödeme sistemleri ile ödeme yapabilirsiniz. Tüm ödemeler güvenli sistemler üzerinden gerçekleştirilir.
                </p>
              </div>
            </div>
            
            <div className="py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">İade politikanız nedir?</h3>
                <span className="text-valorant-green">+</span>
              </div>
              <div className="mt-3">
                <p className="text-gray-400">
                  Boost işlemi başlamadan önce %100 iade yapılır. İşlem başladıktan sonra tamamlanan kısım düşülerek kalan tutar iade edilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
