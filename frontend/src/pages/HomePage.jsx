import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProducts } from '../api/apiService';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const [price, setPrice] = useState(10000);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const categories = [
    'Обезболивающие',
    'Жаропонижающие',
    'Антибиотики',
    'Витамины',
    'Аллергия',
    'Сердечно-сосудистые',
    'Желудочно-кишечные',
    'Неврология',
    'Дерматология',
    'Офтальмология',
    'ЛОР',
    'Эндокринология',
    'Гинекология',
    'Урология',
    'Педиатрия'
  ];

  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.maxPrice) {
        params.append('minPrice', '0');
        params.append('maxPrice', filters.maxPrice.toString());
      }
      if (filters.category) {
        params.append('category', filters.category);
      }
      params.append('page', currentPage);
      params.append('limit', '12');
      
      const { data } = await getProducts(params.toString());
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts({ maxPrice: price, category: selectedCategory });
  }, [currentPage, price, selectedCategory]);

  const handlePriceChange = async (event) => {
    const newPrice = event.target.value;
    setPrice(newPrice);
    setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
  };

  const handleCategoryChange = async (category) => {
    const newCategory = category === selectedCategory ? '' : category;
    setSelectedCategory(newCategory);
    setCurrentPage(1); // Сбрасываем страницу при изменении фильтров
  };

  const handleClearFilters = async () => {
    setSelectedCategory('');
    setPrice(10000);
    setCurrentPage(1); // Сбрасываем страницу при очистке фильтров
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Для добавления в корзину необходимо авторизоваться');
      return;
    }
    addToCart(product);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="text-center py-8">Загрузка товаров...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Ошибка: {error}</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters */}
            <div className="w-full md:w-1/4 space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold mb-4">Категории</h2>
                <div className="space-y-2">
                  <button
                    onClick={handleClearFilters}
                    className={`w-full text-left px-2 py-1 rounded ${
                      !selectedCategory ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    Все категории
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-2 py-1 rounded ${
                        category === selectedCategory ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold mb-4">Ценовой диапазон</h2>
                <div className="space-y-4">
                  <input
                    type="range"
                    min={0}
                    max={10000}
                    value={price}
                    onChange={handlePriceChange}
                    className="w-full"
                  />
                  <p className="text-center font-semibold">До {price}₽</p>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="w-full md:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      &laquo;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1 rounded-md border ${
                          currentPage === i + 1 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      &raquo;
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
