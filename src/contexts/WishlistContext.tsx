// src/contexts/WishlistContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

interface WishlistItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  imageUrl: string;
  model?: string;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  totalWishlistItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { user } = useAuth();

  // Load wishlist for current user when user changes
  useEffect(() => {
    if (user && user.email) {
      try {
        const wishlistsRaw = localStorage.getItem('user_wishlists') || '{}';
        const wishlists = JSON.parse(wishlistsRaw);
        const userWishlist = wishlists[user.email] || [];
        
        // Remove duplicates when loading
        const uniqueWishlist = Array.from(
          new Map(userWishlist.map((item: WishlistItem) => [item.id, item])).values()
        );
        
        setWishlist(uniqueWishlist as WishlistItem[]);
      } catch (error) {
        console.error('Error loading wishlist:', error);
        setWishlist([]);
      }
    } else {
      // Clear wishlist when logged out
      setWishlist([]);
    }
  }, [user]);

  // Save wishlist to localStorage whenever it changes (only if logged in)
  useEffect(() => {
    if (user && user.email && wishlist.length >= 0) {
      try {
        const wishlistsRaw = localStorage.getItem('user_wishlists') || '{}';
        const wishlists = JSON.parse(wishlistsRaw);
        
        // Remove duplicates before saving
        const uniqueWishlist = Array.from(
          new Map(wishlist.map(item => [item.id, item])).values()
        );
        
        wishlists[user.email] = uniqueWishlist;
        localStorage.setItem('user_wishlists', JSON.stringify(wishlists));
      } catch (error) {
        console.error('Error saving wishlist:', error);
      }
    }
  }, [wishlist, user]);

  const addToWishlist = (item: WishlistItem) => {
    // Check if user is logged in
    if (!user || !user.email) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm yêu thích!');
      return;
    }

    // Check if item already exists BEFORE setState
    const exists = wishlist.find((i) => i.id === item.id);
    if (exists) {
      toast.info('Sản phẩm đã có trong danh sách yêu thích');
      return;
    }

    // Add item and show toast
    setWishlist((prev) => [...prev, item]);
    toast.success('Đã thêm vào danh sách yêu thích! ❤️');
  };

  const removeFromWishlist = (id: string) => {
    if (!user || !user.email) {
      toast.error('Vui lòng đăng nhập!');
      return;
    }

    setWishlist((prev) => prev.filter((item) => item.id !== id));
    toast.success('Đã xóa khỏi danh sách yêu thích');
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  const clearWishlist = () => {
    if (!user || !user.email) {
      toast.error('Vui lòng đăng nhập!');
      return;
    }

    setWishlist([]);
    toast.success('Đã xóa toàn bộ danh sách yêu thích');
  };

  const totalWishlistItems = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        totalWishlistItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};