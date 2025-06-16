import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../api/apiService';
import { FaShoppingCart, FaInfoCircle, FaFileAlt, FaComments, FaArrowUp } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductReviews from '../components/ProductReviews';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('main');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [thumbScroll, setThumbScroll] = useState(0);
  const THUMBS_VISIBLE = 5;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProductById(id);
        setProduct(data);
        // Получаем изображения из localStorage
        const imagesKey = data.article ? `productImages_${data.article}` : `productImages_${data.title}`;
        const images = JSON.parse(localStorage.getItem(imagesKey) || '[]');
        setGalleryImages(images.length > 0 ? images : [data.image_url]);
        setMainImageIdx(0);
      } catch (err) {
        console.error('Ошибка при получении товара:', err);
        setError(err.response?.data?.error || 'Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleThumbScroll = (dir) => {
    setThumbScroll((prev) => {
      if (dir === 'left') return Math.max(prev - 1, 0);
      if (dir === 'right') return Math.min(prev + 1, Math.max(0, galleryImages.length - THUMBS_VISIBLE));
      return prev;
    });
  };

  const handleThumbClick = (realIdx, idxInSlider) => {
    setMainImageIdx(realIdx);
    // Если клик по крайней левой миниатюре и можно прокрутить влево
    if (idxInSlider === 0 && thumbScroll > 0) {
      setThumbScroll(thumbScroll - 1);
    }
    // Если клик по крайней правой миниатюре и можно прокрутить вправо
    if (idxInSlider === THUMBS_VISIBLE - 1 && thumbScroll < galleryImages.length - THUMBS_VISIBLE) {
      setThumbScroll(thumbScroll + 1);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8 text-center">
        <div className="animate-pulse flex justify-center">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8 text-center text-red-500">
        {error}
      </div>
      <Footer />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-8 text-center">
        Товар не найден
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center space-x-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium transition w-fit"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            <span>Назад к товарам</span>
          </button>
          <h1 className="text-3xl font-bold mb-8 text-gray-800">{product.title}</h1>
        
        <div className="flex space-x-4 mb-8 border-b pb-4">
          <button
            onClick={() => {
              setActiveTab('main');
              scrollToSection('main');
            }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'main' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
              <FaInfoCircle />
              <span>Основные</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('instructions');
              scrollToSection('instructions');
            }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'instructions' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
          >
              <FaFileAlt />
              <span>Инструкция</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('reviews');
                scrollToSection('reviews');
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === 'reviews' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaComments />
              <span>Отзывы</span>
          </button>
        </div>

        <section id="main" className="mb-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex flex-col gap-12">
                <div className="flex flex-col lg:flex-row gap-12">
                  <div className="w-full lg:w-1/3">
                    <div className="bg-gray-50 rounded-xl overflow-hidden p-6 flex flex-col items-center justify-center">
                      {galleryImages.length > 0 && (
                  <img 
                          src={galleryImages[mainImageIdx] || require('../images/image 1.png')}
                    alt={product.title}
                          className="max-w-full max-h-96 object-contain transform hover:scale-105 transition-transform duration-300 mb-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = require('../images/image 1.png');
                    }}
                  />
                      )}
                      {galleryImages.length > 1 && (
                        <div className="flex items-center gap-2 mt-2">
                          {galleryImages.length > THUMBS_VISIBLE && (
                            <button
                              onClick={() => handleThumbScroll('left')}
                              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-30"
                              disabled={thumbScroll === 0}
                              aria-label="Прокрутить влево"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                          )}
                          <div className="flex gap-2 overflow-hidden" style={{ width: `${THUMBS_VISIBLE * 68}px` }}>
                            {galleryImages.slice(thumbScroll, thumbScroll + THUMBS_VISIBLE).map((img, idx) => {
                              const realIdx = thumbScroll + idx;
                              return (
                                <img
                                  key={realIdx}
                                  src={img}
                                  alt={`mini${realIdx}`}
                                  className={`h-16 w-16 object-cover rounded border-2 cursor-pointer transition-all duration-200 ${mainImageIdx === realIdx ? 'border-blue-600 shadow-lg' : 'border-gray-300'}`}
                                  onClick={() => handleThumbClick(realIdx, idx)}
                                />
                              );
                            })}
                          </div>
                          {galleryImages.length > THUMBS_VISIBLE && (
                            <button
                              onClick={() => handleThumbScroll('right')}
                              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:opacity-30"
                              disabled={thumbScroll >= galleryImages.length - THUMBS_VISIBLE}
                              aria-label="Прокрутить вправо"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </button>
                          )}
                        </div>
                      )}
                </div>
              </div>
              
                  <div className="w-full lg:w-2/3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Артикул</p>
                    <p className="font-medium">{product.article}</p>
                  </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Производитель</p>
                    <p className="font-medium">{product.manufacturer}</p>
                  </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Срок годности</p>
                    <p className="font-medium">{product.expirationDate}</p>
                  </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600 text-sm mb-1">Цена</p>
                        <p className="text-2xl font-bold text-blue-600">{product.price} ₽</p>
                  </div>
                </div>

                <button 
                      className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-lg transition-all duration-200 ${
                    isAdding 
                      ? 'bg-green-500 text-white' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => {
                    setIsAdding(true);
                    addToCart(product);
                    setTimeout(() => setIsAdding(false), 1000);
                  }}
                >
                      <FaShoppingCart />
                      <span>{isAdding ? 'Добавлено!' : 'Добавить в корзину'}</span>
                </button>
                  </div>
                </div>

                <div className="max-w-4xl w-full space-y-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Описание</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-left">{product.description}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Состав</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-left">{product.composition}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Противопоказания</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-left">{product.contraindications}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Условия хранения</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-left">{product.storageConditions}</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Рекомендации</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-left">{product.recommendations}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="instructions" className="mb-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Инструкция по применению</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {product.instructions ? (
                product.instructions
              ) : (
                <p>Инструкция по применению будет добавлена позже</p>
              )}
            </div>
              </div>
            </div>
          </section>

          <section id="reviews" className="mb-12">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <ProductReviews productId={id} />
          </div>
        </section>
        </div>
      </main>
      <Footer />
      
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:bg-blue-700 transform hover:scale-110 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Наверх"
      >
        <FaArrowUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ProductPage;
