import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { getProducts } from '../api/apiService';
import ProductCard from '../components/ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [resPerPage, setResPerPage] = useState(0);
  const [filteredProductsCount, setFilteredProductsCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get products from API with filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {
          keyword: searchTerm,
          page: currentPage,
          categories: categoryFilter.join(','),
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          inStock: inStockOnly,
          sort: sortOption,
          limit: 12 // Добавляем лимит на страницу
        };
        
        const { data } = await getProducts(params);
        setProducts(data.products);
        setProductsCount(data.totalProducts);
        setResPerPage(12); // Фиксированный размер страницы
        setFilteredProductsCount(data.totalProducts);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter, priceRange, inStockOnly, sortOption]);

  // Pagination
  const setCurrentPageNo = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const totalPages = Math.ceil(filteredProductsCount / resPerPage);
  const paginationRange = 5; // Number of pages to show in pagination
  let startPage, endPage;

  if (totalPages <= paginationRange) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= Math.ceil(paginationRange / 2)) {
      startPage = 1;
      endPage = paginationRange;
    } else if (currentPage + Math.floor(paginationRange / 2) >= totalPages) {
      startPage = totalPages - paginationRange + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - Math.floor(paginationRange / 2);
      endPage = currentPage + Math.floor(paginationRange / 2);
    }
  }

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'medicines', label: 'Medicines' },
    { value: 'vitamins', label: 'Vitamins' },
    { value: 'personal-care', label: 'Personal Care' },
    { value: 'medical-supplies', label: 'Medical Supplies' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Our Products</h1>
        
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div className="relative w-full md:w-48">
            <select
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium mb-1">Price Range</label>
            <div className="flex items-center space-x-2">
              <span>${priceRange[0]}</span>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([e.target.value, priceRange[1]])}
                className="w-full"
              />
              <span>${priceRange[1]}</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium mb-1">Categories</label>
            <div className="space-y-1">
              {categories.map((category) => (
                <label key={category.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={categoryFilter.includes(category.value)}
                    onChange={() => {
                      if (categoryFilter.includes(category.value)) {
                        setCategoryFilter(categoryFilter.filter(c => c !== category.value));
                      } else {
                        setCategoryFilter([...categoryFilter, category.value]);
                      }
                    }}
                    className="mr-2"
                  />
                  {category.label}
                </label>
              ))}
            </div>
          </div>

          {/* Stock Availability */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => setInStockOnly(!inStockOnly)}
                className="mr-2"
              />
              In Stock Only
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {filteredProductsCount > resPerPage && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPageNo(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &laquo;
                </button>

                {Array.from({ length: endPage - startPage + 1 }, (_, i) => (
                  <button
                    key={startPage + i}
                    onClick={() => setCurrentPageNo(startPage + i)}
                    className={`px-3 py-1 rounded-md border ${
                      currentPage === startPage + i 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {startPage + i}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPageNo(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &raquo;
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductList;