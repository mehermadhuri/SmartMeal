import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((menuItem, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.menuId === menuItem.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
        return updated;
      }
      return [...prev, {
        menuId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        imageUrl: menuItem.imageUrl,
        category: menuItem.mealType,   // backend returns mealType not category
        quantity: qty,
      }];
    });
  }, []);

  const updateQuantity = useCallback((menuId, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.menuId !== menuId));
    } else {
      setItems(prev => prev.map(i => i.menuId === menuId ? { ...i, quantity: qty } : i));
    }
  }, []);

  const removeItem = useCallback((menuId) => {
    setItems(prev => prev.filter(i => i.menuId !== menuId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, totalItems, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
