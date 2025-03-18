
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, ChevronDown, Wallet, Plus } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isBooster, formatBalance } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currencyType, setCurrencyType] = useState<'TRY' | 'USD'>('TRY');
  const navigate = useNavigate();

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleCurrency = () => {
    setCurrencyType(prev => prev === 'TRY' ? 'USD' : 'TRY');
  };

  // Safe balance formatting
  const safeFormatBalance = () => {
    try {
      return formatBalance(currencyType);
    } catch (error) {
      console.error('Error formatting balance:', error);
      return currencyType === 'TRY' ? '0 ₺' : '$0.00';
    }
  };

  const navigateToBalance = () => {
    navigate('/balance');
  };

  return (
    <nav className="bg-valorant-black border-b border-valorant-gray/30 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white font-heading"><span className="text-valorant-green">VALOR</span>RANK</h1>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-300 hover:bg-valorant-gray hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Ana Sayfa
              </Link>
              <Link to="/ranks" className="text-gray-300 hover:bg-valorant-gray hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Rank Boost
              </Link>
              <button 
                onClick={toggleCurrency}
                className="text-gray-300 hover:bg-valorant-gray hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {currencyType === 'TRY' ? '₺ TRY' : '$ USD'}
              </button>
              
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={navigateToBalance}
                    className="flex items-center bg-valorant-green/10 text-valorant-green px-3 py-2 rounded-md text-sm font-medium hover:bg-valorant-green/20 transition-colors"
                  >
                    <Wallet className="w-4 h-4 mr-1" />
                    <span>{safeFormatBalance()}</span>
                    <Plus className="w-3 h-3 ml-1" />
                  </button>
                  <div className="relative group">
                    <button className="flex items-center text-gray-300 hover:bg-valorant-gray hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                      <User className="w-4 h-4 mr-1" />
                      {user?.username}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-valorant-black border border-valorant-gray rounded-md shadow-lg overflow-hidden transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-200 origin-top-right z-50">
                      <div className="py-1">
                        <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-200 hover:bg-valorant-gray">
                          Hesabım
                        </Link>
                        {isBooster && (
                          <Link to="/booster" className="block px-4 py-2 text-sm text-gray-200 hover:bg-valorant-gray">
                            Booster Paneli
                          </Link>
                        )}
                        {isAdmin && (
                          <Link to="/admin" className="block px-4 py-2 text-sm text-gray-200 hover:bg-valorant-gray">
                            Admin Paneli
                          </Link>
                        )}
                        <button 
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-valorant-gray"
                        >
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="outline" className="border-valorant-green text-valorant-green hover:bg-valorant-green hover:text-white">
                      Giriş Yap
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-valorant-green hover:bg-valorant-darkGreen text-white">
                      Kayıt Ol
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <button
                onClick={navigateToBalance}
                className="flex items-center bg-valorant-green/10 text-valorant-green px-3 py-1 rounded-md text-sm font-medium mr-2 hover:bg-valorant-green/20 transition-colors"
              >
                <Wallet className="w-3 h-3 mr-1" />
                <span>{safeFormatBalance()}</span>
                <Plus className="w-2 h-2 ml-1" />
              </button>
            )}
            <button
              onClick={toggleNav}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-valorant-gray focus:outline-none"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className="text-gray-300 hover:bg-valorant-gray hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            Ana Sayfa
          </Link>
          <Link to="/ranks" className="text-gray-300 hover:bg-valorant-gray hover:text-white block px-3 py-2 rounded-md text-base font-medium">
            Rank Boost
          </Link>
          <button 
            onClick={toggleCurrency}
            className="text-gray-300 hover:bg-valorant-gray hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
          >
            {currencyType === 'TRY' ? '₺ TRY' : '$ USD'}
          </button>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-gray-300 hover:bg-valorant-gray hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                Hesabım
              </Link>
              <Link to="/balance" className="text-valorant-green hover:bg-valorant-gray hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                <span className="flex items-center">
                  <Wallet className="w-4 h-4 mr-2" /> Bakiye Yükle
                </span>
              </Link>
              {isBooster && (
                <Link to="/booster" className="text-gray-300 hover:bg-valorant-gray hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                  Booster Paneli
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="text-gray-300 hover:bg-valorant-gray hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                  Admin Paneli
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="text-gray-300 hover:bg-valorant-gray hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                <span className="flex items-center">
                  <LogOut className="w-4 h-4 mr-2" /> Çıkış Yap
                </span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 p-3">
              <Link to="/login">
                <Button variant="outline" className="w-full border-valorant-green text-valorant-green hover:bg-valorant-green hover:text-white">
                  Giriş Yap
                </Button>
              </Link>
              <Link to="/register">
                <Button className="w-full bg-valorant-green hover:bg-valorant-darkGreen text-white">
                  Kayıt Ol
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
