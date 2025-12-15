import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  quantity: number;
  stock: number;
}

interface CartContextValue {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  // 🔄 Load cart theo user (logout là sạch)
  useEffect(() => {
    if (!user) {
      setCart([]);
      localStorage.removeItem("cart");
      return;
    }

    try {
      const raw = localStorage.getItem(`cart_${user.email}`);
      setCart(raw ? JSON.parse(raw) : []);
    } catch {
      setCart([]);
    }
  }, [user]);

  // 💾 Lưu cart theo user
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);

      if (existing) {
        return prev.map(i =>
          i.id === item.id
            ? {
                ...i,
                quantity: Math.min(i.stock, i.quantity + quantity),
              }
            : i
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: Math.min(item.stock, quantity),
        },
      ];
    });

    toast.success("Đã thêm vào giỏ hàng");
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, quantity: Math.max(1, Math.min(i.stock, quantity)) }
          : i
      )
    );
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    if (user) {
      localStorage.removeItem(`cart_${user.email}`);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
