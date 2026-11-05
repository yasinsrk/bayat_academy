import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaTimes, FaTrash, FaShoppingCart, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

function CartSidebar() {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getCartCount,
    isCartOpen,
    closeCart
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    closeCart();
    navigate('/checkout');
  };

  const formatPrice = (price) => {
    if (!price) return 'رایگان';
    return price.toLocaleString();
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            style={styles.overlay}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={styles.sidebar}
          >
            {/* Header */}
            <div style={styles.header}>
              <div style={styles.headerLeft}>
                <FaShoppingCart style={styles.headerIcon} />
                <h2 style={styles.headerTitle}>سبد خرید</h2>
                <span style={styles.headerCount}>{getCartCount()} آیتم</span>
              </div>
              <button onClick={closeCart} style={styles.closeBtn}>
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div style={styles.content}>
              {cartItems.length === 0 ? (
                <div style={styles.empty}>
                  <span style={styles.emptyIcon}>🛒</span>
                  <h3 style={styles.emptyTitle}>سبد خرید خالی است</h3>
                  <p style={styles.emptyDesc}>دوره‌ای را به سبد خرید اضافه کنید</p>
                  <button onClick={closeCart} style={styles.emptyBtn}>
                    مشاهده دوره‌ها
                  </button>
                </div>
              ) : (
                <>
                  <div style={styles.itemsList}>
                    {cartItems.map((item) => (
                      <div key={item.id} style={styles.cartItem}>
                        <div style={styles.itemImage}>
                          <img src={item.image} alt={item.title} style={styles.image} />
                        </div>
                        <div style={styles.itemInfo}>
                          <h4 style={styles.itemTitle}>{item.title}</h4>
                          <div style={styles.itemPrice}>
                            {item.has_discount ? (
                              <>
                                <span style={styles.originalPrice}>{formatPrice(item.price)} تومان</span>
                                <span style={styles.discountedPrice}>{formatPrice(item.discounted_price)} تومان</span>
                              </>
                            ) : (
                              <span style={styles.price}>{formatPrice(item.price)} تومان</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={styles.removeBtn}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={styles.footer}>
                    <div style={styles.totalSection}>
                      <span style={styles.totalLabel}>مجموع:</span>
                      <span style={styles.totalPrice}>{formatPrice(getTotalPrice())} تومان</span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      style={styles.checkoutBtn}
                    >
                      تسویه حساب
                      <FaArrowLeft style={styles.checkoutIcon} />
                    </button>

                    <button
                      onClick={clearCart}
                      style={styles.clearBtn}
                    >
                      خالی کردن سبد خرید
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    zIndex: 9998,
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    maxWidth: '440px',
    height: '100vh',
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(40px) saturate(180%)',
    borderLeft: '0.5px solid rgba(255,255,255,0.3)',
    boxShadow: '-8px 0 60px rgba(0,0,0,0.04)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '0.5px solid rgba(0,0,0,0.04)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
    fontSize: '20px',
    color: '#6C63FF',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  headerCount: {
    fontSize: '13px',
    color: 'rgba(26,26,46,0.3)',
    fontWeight: '500',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(26,26,46,0.3)',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    transition: 'color 0.3s ease',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '8px',
  },
  emptyDesc: {
    fontSize: '15px',
    color: 'rgba(26,26,46,0.3)',
    marginBottom: '16px',
  },
  emptyBtn: {
    padding: '10px 24px',
    background: 'rgba(108,99,255,0.04)',
    border: '1px solid rgba(108,99,255,0.06)',
    borderRadius: '10px',
    color: '#6C63FF',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  itemsList: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cartItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.4)',
    borderRadius: '12px',
    border: '0.5px solid rgba(255,255,255,0.2)',
  },
  itemImage: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #f0f2f5, #e8ecf1)',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '4px',
  },
  itemPrice: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  originalPrice: {
    fontSize: '12px',
    color: 'rgba(26,26,46,0.3)',
    textDecoration: 'line-through',
  },
  discountedPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#FF6B6B',
  },
  price: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a2e',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(26,26,46,0.15)',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    transition: 'color 0.3s ease',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: '16px',
    borderTop: '0.5px solid rgba(0,0,0,0.04)',
  },
  totalSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  totalLabel: {
    fontSize: '15px',
    color: 'rgba(26,26,46,0.5)',
  },
  totalPrice: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  checkoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #6C63FF, #4D96FF)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 24px rgba(108,99,255,0.15)',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  checkoutIcon: {
    fontSize: '14px',
  },
  clearBtn: {
    display: 'block',
    width: '100%',
    marginTop: '10px',
    padding: '10px',
    background: 'rgba(0,0,0,0.02)',
    border: '0.5px solid rgba(0,0,0,0.04)',
    borderRadius: '10px',
    color: 'rgba(26,26,46,0.3)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'all 0.3s ease',
  },
};

export default CartSidebar;