import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCartPlus } from 'react-icons/fa';

const ProductCard = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  if (!product) {
    console.error('Product is undefined');
    return null;
  }

  console.log('Product in ProductCard:', product);
  const productId = product.id;

  if (!productId) {
    console.error('Product ID is missing:', product);
    return null;
  }

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsClicked(true);
    onAddToCart(product, e);
    setTimeout(() => setIsClicked(false), 1000);
  };

  return (
    <Link 
      to={`/products/${productId}`} 
      className="block"
    >
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={`${process.env.REACT_APP_API_URL}${product.image_url}` || require('../images/image 1.png')}
            alt={product.title}
            className={`w-full h-full object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = require('../images/image 1.png');
            }}
          />
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
          </div>

          <p className="text-gray-600 text-sm mb-3">{product.category}</p>

          <div className="mt-auto">
            <div className="flex flex-col space-y-3">
              <span className="font-bold text-blue-600 text-xl">{product.price}₽</span>
              <button 
                className={`w-full py-2 px-4 rounded-lg transition-all duration-300 ${
                  isClicked 
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={handleAddToCart}
              >
                {isClicked ? '✓ Добавлено' : 'В корзину'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;