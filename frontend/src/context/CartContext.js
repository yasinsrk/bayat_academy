import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// ایجاد کانتکست سبد خرید
const CartContext = createContext();

// هوک استفاده از سبد خرید
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// کامپوننت Provider
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // بارگذاری سبد خرید از localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // ذخیره سبد خرید در localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // افزودن به سبد خرید
  const addToCart = (packageData) => {
    // بررسی اینکه دوره قبلاً در سبد خرید نیست
    const existingItem = cartItems.find(item => item.id === packageData.id);

    if (existingItem) {
      toast.info('این دوره قبلاً به سبد خرید اضافه شده است');
      return;
    }

    setCartItems(prev => [...prev, {
      ...packageData,
      quantity: 1,
      addedAt: new Date().toISOString()
    }]);

    toast.success(`${packageData.title} به سبد خرید اضافه شد`);
    setIsCartOpen(true);
  };

  // حذف از سبد خرید
  const removeFromCart = (packageId) => {
    const item = cartItems.find(item => item.id === packageId);
    setCartItems(prev => prev.filter(item => item.id !== packageId));
    if (item) {
      toast.info(`${item.title} از سبد خرید حذف شد`);
    }
  };

  // خالی کردن سبد خرید
  const clearCart = () => {
    setCartItems([]);
    toast.info('سبد خرید خالی شد');
  };

  // محاسبه مجموع قیمت
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const price = item.has_discount ? item.discounted_price : item.price;
      return total + (price * (item.quantity || 1));
    }, 0);
  };

  // تعداد آیتم‌های سبد خرید
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (item.quantity || 1), 0);
  };

  // باز/بسته کردن سبد خرید
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      getTotalPrice,
      getCartCount,
      isCartOpen,
      toggleCart,
      openCart,
      closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};