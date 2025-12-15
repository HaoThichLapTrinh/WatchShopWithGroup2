import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import { useCart } from "../../contexts/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [cartCount, setCartCount] = useState<number>(totalItems);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Keep local state in sync with context
  useEffect(() => {
    setCartCount(totalItems);
  }, [totalItems]);

  // Đóng menu khi chuyển trang
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Fixed logout handler
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
    // Reload trang để clear toàn bộ state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            onClick={handleLinkClick}
            className="text-xl sm:text-2xl font-bold text-amber-600 hover:text-amber-800 transition"
          >
            MyStore
          </Link>

          {/* Desktop Search - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center w-96 relative">
            <input
              type="text"
              placeholder="Tìm kiếm đồng hồ..."
              className="w-full py-2 pl-4 pr-10 text-gray-700 border border-gray-300 rounded-full 
              focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
            />
            <Search className="absolute right-3 h-5 w-5 text-gray-400" />
          </div>

          {/* Desktop Menu - Hidden on mobile/tablet */}
          <div className="hidden lg:flex items-center gap-6 text-lg font-medium">
            <Link to="/" className="text-gray-700 hover:text-amber-600 transition">
              Trang chủ
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-amber-600 transition">
              Sản phẩm
            </Link>
            {user && user.email === 'admin@gmail.com' && (
              <Link to="/admin" className="text-gray-700 hover:text-amber-600 transition">
                Admin
              </Link>
            )}

            {/* Cart */}
            <Link
              to="/cart"
              className="text-gray-700 hover:text-amber-600 transition relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-1 px-4 py-2 rounded-full border border-amber-500 
                  text-amber-600 hover:bg-amber-500 hover:text-white transition duration-300 shadow-md"
                >
                  <User className="h-5 w-5" />
                  Hồ sơ
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full border border-red-500 text-red-600 hover:bg-red-500 
                  hover:text-white transition duration-300 shadow-md"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-full border border-amber-500 text-amber-600 
                hover:bg-amber-500 hover:text-white font-semibold transition duration-300 shadow-md"
              >
                Đăng nhập
              </Link>
            )}
          </div>

          {/* Mobile/Tablet: Cart + Hamburger Menu */}
          <div className="flex lg:hidden items-center gap-4">
            
            {/* Cart Icon for Mobile */}
            <Link
              to="/cart"
              onClick={handleLinkClick}
              className="text-gray-700 hover:text-amber-600 transition relative"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-amber-600 transition p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-7 w-7" />
              ) : (
                <Menu className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Show below main nav */}
        <div className="lg:hidden mt-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm đồng hồ..."
              className="w-full py-2 pl-4 pr-10 text-gray-700 border border-gray-300 rounded-full 
              focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition duration-200"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 lg:hidden"
          style={{ zIndex: 9998 }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ zIndex: 9999 }}
      >
        <div className="flex flex-col h-full">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-white">
            <h2 className="text-xl font-bold text-amber-600">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-700 hover:text-red-500 transition p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-6 bg-white">
            <div className="flex flex-col gap-2 px-4">
              
              {/* User Info (if logged in) */}
              {user && (
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-lg">
                    <User className="h-8 w-8 text-amber-600" />
                    <div>
                      <p className="font-semibold text-gray-800">{user.email}</p>
                      <p className="text-xs text-gray-500">Thành viên</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <Link
                to="/"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition"
              >
                <span className="text-lg">🏠</span>
                <span className="font-medium">Trang chủ</span>
              </Link>

              <Link
                to="/products"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition"
              >
                <span className="text-lg">⌚</span>
                <span className="font-medium">Sản phẩm</span>
              </Link>

              {user && user.email === 'admin@gmail.com' && (
                <Link
                  to="/admin"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="font-medium">Admin</span>
                </Link>
              )}

              {user && (
                <Link
                  to="/profile"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition"
                >
                  <User className="h-5 w-5" />
                  <span className="font-medium">Hồ sơ</span>
                </Link>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t p-4 bg-white">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white font-semibold transition duration-300 shadow-md"
              >
                <LogOut className="h-5 w-5" />
                Đăng xuất
              </button>
            ) : (
              <Link
                to="/login"
                onClick={handleLinkClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white font-semibold transition duration-300 shadow-md"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}