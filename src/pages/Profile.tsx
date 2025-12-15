// src/pages/Profile.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import { User, Lock, MapPin, Package, Camera, Save, Edit2, Heart, ShoppingCart, Trash2 } from 'lucide-react';

interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  addresses: {
    id: string;
    label: string;
    address: string;
    isDefault: boolean;
  }[];
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'password' | 'address' | 'orders' | 'wishlist'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'Khách hàng',
    email: '',
    phone: '',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    addresses: [
      { id: '1', label: 'Nhà riêng', address: '', isDefault: true }
    ]
  });

  const { user } = useAuth();

  useEffect(() => {
    try {
      const profilesRaw = localStorage.getItem('user_profiles') || '{}';
      const profiles = JSON.parse(profilesRaw || '{}');
      if (user && user.email && profiles[user.email]) {
        const stored = profiles[user.email];
        setProfile(prev => ({
          fullName: stored.fullName || prev.fullName,
          email: stored.email || (user.email || prev.email),
          phone: stored.phone || prev.phone,
          avatar: stored.avatar || prev.avatar,
          addresses: stored.addresses || prev.addresses
        }));
        return;
      }

      const legacy = localStorage.getItem('userProfile');
      if (legacy) {
        const lp = JSON.parse(legacy);
        setProfile(prev => ({ ...prev, ...lp }));
      }
    } catch (e) {
      // ignore parsing errors
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    try {
      if (user && user.email) {
        const profilesRaw = localStorage.getItem('user_profiles') || '{}';
        const profiles = JSON.parse(profilesRaw || '{}');
        profiles[user.email] = { 
          ...profiles[user.email], 
          fullName: profile.fullName, 
          email: profile.email, 
          phone: profile.phone, 
          avatar: profile.avatar, 
          addresses: profile.addresses 
        };
        localStorage.setItem('user_profiles', JSON.stringify(profiles));
      } else {
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }
    } catch (e) {}
    setIsEditing(false);
    toast.success('Đã lưu thông tin!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    toast.success('Đã đổi mật khẩu thành công!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleAddAddress = () => {
    const newAddress = prompt('Nhập địa chỉ mới:');
    if (newAddress) {
      const label = prompt('Nhãn địa chỉ (VD: Nhà riêng, Văn phòng):') || 'Địa chỉ khác';
      setProfile({
        ...profile,
        addresses: [...profile.addresses, {
          id: Date.now().toString(),
          label,
          address: newAddress,
          isDefault: false
        }]
      });
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    setProfile({
      ...profile,
      addresses: profile.addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
    });
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('Xóa địa chỉ này?')) {
      setProfile({
        ...profile,
        addresses: profile.addresses.filter(addr => addr.id !== id)
      });
    }
  };

  const handleAddWishlistToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      imageUrl: item.imageUrl,
      stock: 10,
    }, 1);
  };

  const orders = JSON.parse(localStorage.getItem('orders') || '[]');

  return (
    <div className="bg-gray-50 pt-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-8">
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Tài khoản của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              
              <div className="text-center mb-6 pb-6 border-b">
                <div className="relative inline-block">
                  <img 
                    src={profile.avatar} 
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-yellow-200"
                  />
                  <label className="absolute bottom-0 right-0 bg-yellow-600 text-white p-2 rounded-full cursor-pointer hover:bg-yellow-700 transition">
                    <Camera size={16} />
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <h3 className="font-bold text-gray-800 mt-3">{profile.fullName}</h3>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'info' 
                      ? 'bg-yellow-100 text-yellow-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User size={20} />
                  Thông tin cá nhân
                </button>

                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'password' 
                      ? 'bg-yellow-100 text-yellow-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Lock size={20} />
                  Đổi mật khẩu
                </button>

                <button
                  onClick={() => setActiveTab('address')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'address' 
                      ? 'bg-yellow-100 text-yellow-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <MapPin size={20} />
                  Địa chỉ giao hàng
                </button>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'wishlist' 
                      ? 'bg-yellow-100 text-yellow-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Heart size={20} />
                  <span>Sản phẩm yêu thích</span>
                  {wishlist.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === 'orders' 
                      ? 'bg-yellow-100 text-yellow-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Package size={20} />
                  Đơn hàng của tôi
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              
              {/* Personal Info Tab */}
              {activeTab === 'info' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
                    <button 
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                    >
                      {isEditing ? <><Save size={18} /> Lưu</> : <><Edit2 size={18} /> Chỉnh sửa</>}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                      <input 
                        type="text"
                        value={profile.fullName}
                        onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          isEditing 
                            ? 'border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500' 
                            : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input 
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border rounded-lg ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500' 
                              : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                        <input 
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border rounded-lg ${
                            isEditing 
                              ? 'border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500' 
                              : 'bg-gray-50 border-gray-200 cursor-not-allowed'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Change Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Đổi mật khẩu</h2>
                  
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu hiện tại</label>
                      <input 
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu mới</label>
                      <input 
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                      <input 
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                    >
                      Đổi mật khẩu
                    </button>
                  </form>
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Địa chỉ giao hàng</h2>
                    <button 
                      onClick={handleAddAddress}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                    >
                      + Thêm địa chỉ
                    </button>
                  </div>

                  <div className="space-y-4">
                    {profile.addresses.map(addr => (
                      <div key={addr.id} className="border-2 rounded-lg p-4 hover:border-yellow-300 transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-bold text-gray-800">{addr.label}</span>
                              {addr.isDefault && (
                                <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-1 rounded">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600">{addr.address}</p>
                          </div>
                          
                          <div className="flex gap-2">
                            {!addr.isDefault && (
                              <button 
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-sm text-yellow-600 hover:text-yellow-700 font-semibold"
                              >
                                Đặt mặc định
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-semibold"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <Heart className="text-red-500" />
                      Sản phẩm yêu thích ({wishlist.length})
                    </h2>
                    {wishlist.length > 0 && (
                      <button 
                        onClick={() => {
                          if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm yêu thích?')) {
                            clearWishlist();
                          }
                        }}
                        className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Xóa tất cả
                      </button>
                    )}
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart size={60} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600 mb-4">Chưa có sản phẩm yêu thích</p>
                      <button 
                        onClick={() => navigate('/products')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-2 rounded-lg transition"
                      >
                        Khám phá sản phẩm
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wishlist.map((item, index) => (
                        <div key={`wishlist-${item.id}-${index}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                          <div className="flex gap-4 p-4">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer flex-shrink-0"
                              onClick={() => navigate(`/product/${item.id}`)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 uppercase font-semibold">{item.brand}</p>
                              <h3 
                                className="font-bold text-gray-800 hover:text-yellow-600 cursor-pointer mt-1 truncate"
                                onClick={() => navigate(`/product/${item.id}`)}
                              >
                                {item.name}
                              </h3>
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <p className="text-lg font-bold text-red-600">
                                  {item.price.toLocaleString('vi-VN')} VNĐ
                                </p>
                                {item.oldPrice && (
                                  <p className="text-sm text-gray-400 line-through">
                                    {item.oldPrice.toLocaleString('vi-VN')} VNĐ
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex border-t">
                            <button 
                              onClick={() => {
                                handleAddWishlistToCart(item);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold transition"
                            >
                              <ShoppingCart size={18} />
                              <span className="hidden sm:inline">Thêm vào giỏ</span>
                              <span className="sm:hidden">Giỏ hàng</span>
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Xóa sản phẩm này khỏi danh sách yêu thích?')) {
                                  removeFromWishlist(item.id);
                                }
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition border-l"
                            >
                              <Trash2 size={18} />
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h2>
                  
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={60} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.reverse().map((order: any) => (
                        <div key={order.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-bold text-gray-800">Đơn hàng #{order.id}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                            <span className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded">
                              {order.status === 'pending' ? 'Đang xử lý' : 'Đã giao'}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3 text-sm">
                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                <span className="flex-1 text-gray-700">{item.name} x{item.quantity}</span>
                                <span className="font-semibold text-gray-800">
                                  {(item.price * item.quantity).toLocaleString('vi-VN')} VNĐ
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-4 border-t">
                            <span className="text-gray-600">Tổng cộng:</span>
                            <span className="text-xl font-bold text-red-600">
                              {order.totalAmount.toLocaleString('vi-VN')} VNĐ
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;