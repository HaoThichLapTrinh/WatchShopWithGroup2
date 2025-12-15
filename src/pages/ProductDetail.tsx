// src/pages/ProductDetail.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Truck, Shield, RotateCcw, Home, ChevronRight, Minus, Plus } from 'lucide-react';
import type { ProductWithImage } from '../types/product';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { toast } from 'react-toastify';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const product = products.find(p => p.id === id);
  const inWishlist = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy sản phẩm</h2>
        <button 
          onClick={() => navigate('/products')}
          className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
  addToCart(
    {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    },
    quantity
  );
};



  const handleToggleWishlist = () => {
    if (!product) return;
    
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        oldPrice: product.oldPrice,
        imageUrl: product.imageUrl,
        model: product.model,
      });
    }
  };

  const discountPercentage = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const productImages = [product.imageUrl, product.imageUrl, product.imageUrl];

  return (
    <div className="bg-gray-50 pt-20 min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 space-x-2 mb-6">
          <Home size={16} className="text-gray-400" />
          <ChevronRight size={16} />
          <span className="hover:text-yellow-600 cursor-pointer" onClick={() => navigate('/products')}>
            Sản phẩm
          </span>
          <ChevronRight size={16} />
          <span className="text-gray-800">{product.name}</span>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-xl shadow-lg p-6 md:p-10">
          
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-xl border-2 border-gray-200">
              <img 
                src={productImages[selectedImage]} 
                alt={product.name}
                className="w-full h-96 md:h-[500px] object-cover"
              />
              {discountPercentage > 0 && (
                <span className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  GIẢM {discountPercentage}%
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {productImages.map((img, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                    selectedImage === index ? 'border-yellow-600' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-20 h-20 object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">{product.brand}</p>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-2">{product.name}</h1>
              <p className="text-gray-600 mt-1">Model: {product.model}</p>
            </div>

            {/* Price */}
            <div className="border-t border-b py-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-extrabold text-red-600">
                  {product.price.toLocaleString('vi-VN')} VNĐ
                </span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {product.oldPrice.toLocaleString('vi-VN')} VNĐ
                  </span>
                )}
              </div>
              <p className="text-sm text-green-600 mt-2 font-medium">
                Còn {product.stock} sản phẩm trong kho
              </p>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Mô tả:</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Tính năng nổi bật:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-800">Số lượng:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100 transition"
                  disabled={quantity <= 1}
                >
                  <Minus size={18} />
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100 transition"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
  onClick={handleAddToCart}
  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
>
  <ShoppingCart size={20} />
  Thêm vào giỏ hàng
</button>

              
              <button 
                onClick={handleToggleWishlist}
                className={`border-2 font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  inWishlist 
                    ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'border-yellow-600 text-yellow-600 hover:bg-yellow-50'
                }`}
              >
                <Heart size={20} className={inWishlist ? 'fill-red-600' : ''} />
                {inWishlist ? 'Đã yêu thích' : 'Yêu thích'}
              </button>
            </div>

            {/* Service Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3 text-sm">
                <Truck size={24} className="text-yellow-600" />
                <div>
                  <p className="font-semibold text-gray-800">Miễn phí vận chuyển</p>
                  <p className="text-gray-500">Đơn từ 1 triệu</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield size={24} className="text-yellow-600" />
                <div>
                  <p className="font-semibold text-gray-800">Bảo hành 2 năm</p>
                  <p className="text-gray-500">Chính hãng 100%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw size={24} className="text-yellow-600" />
                <div>
                  <p className="font-semibold text-gray-800">Đổi trả 7 ngày</p>
                  <p className="text-gray-500">Nếu có lỗi</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm tương tự</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map(p => (
              <div 
                key={p.id}
                onClick={() => navigate(`/product/${p.id}`)}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <img src={p.imageUrl} alt={p.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase">{p.brand}</p>
                  <h3 className="font-bold text-gray-800 mt-1">{p.name}</h3>
                  <p className="text-red-600 font-bold mt-2">{p.price.toLocaleString('vi-VN')} VNĐ</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;