import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getProducts } from '../api/apiService';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [price, setPrice] = useState(10000);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

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

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        page: currentPage,
        limit: '12'
      });

      if (price < 10000) {
        params.append('minPrice', '0');
        params.append('maxPrice', price.toString());
      }
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      getProducts(params.toString())
        .then(response => {
          setProducts(response.data.products || []);
          setTotalPages(response.data.totalPages || 1);
          setError(null);
        })
        .catch(err => {
          setError('Ошибка при загрузке результатов поиска');
          console.error('Search error:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [searchParams, currentPage, selectedCategory, price]);

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      alert('Для добавления в корзину необходимо авторизоваться');
      return;
    }
    addToCart(product);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setPrice(10000);
    setCurrentPage(1);
  };

  const handlePriceChange = (event) => {
    setPrice(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <section className="py-8 flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              Результаты поиска: {searchParams.get('q')}
            </h1>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 transition-colors"
            >
              Сбросить поиск
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
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
              {loading ? (
                <div className="text-center py-8">Загрузка результатов поиска...</div>
              ) : error ? (
                <div className="text-center text-red-600 py-8">{error}</div>
              ) : products.length === 0 ? (
                <div className="text-center text-gray-600 py-8">
                  По вашему запросу ничего не найдено
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {products.map(product => (
                      <ProductCard 
                        key={product._id} 
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-8 space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300"
                      >
                        Назад
                      </button>
                      <span className="px-4 py-2">
                        Страница {currentPage} из {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:bg-gray-300"
                      >
                        Вперед
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default SearchPage; 