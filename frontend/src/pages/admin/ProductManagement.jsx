import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStats } from '../../context/StatsContext';
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../../api/apiService';
import { FaEdit, FaTrash, FaPlus, FaChevronDown, FaChevronUp, FaTimes } from 'react-icons/fa';

const ProductManagement = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { updateProductsCount } = useStats();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [categories] = useState([
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
  ]);

  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    article: '',
    manufacturer: '',
    expirationDate: '',
    composition: '',
    contraindications: '',
    storageConditions: '',
    recommendations: '',
    images: [],
    description: '',
    instructions: '',
    stock: 0,
    category: '',
    tags: ''
  });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [isAuthenticated, isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      const { data } = await getAdminProducts();
      setProducts(data.products || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при загрузке товаров');
      setLoading(false);
    }
  };

  const handleImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(images => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...images]
      }));
    });
  };

  const handleRemoveImage = (idx) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx)
    }));
  };

  const handleReplaceImage = (idx, file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
      setFormData(prev => {
        const newImages = [...prev.images];
        newImages[idx] = reader.result;
        return { ...prev, images: newImages };
        });
      };
      reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      localStorage.setItem(
        `productImages_${formData.article || formData.title}`,
        JSON.stringify(formData.images)
      );
      if (isEditing) {
        await updateProduct(currentProduct.id, { ...formData, image_url: formData.images[0] || '' });
      } else {
        await createProduct({ ...formData, image_url: formData.images[0] || '' });
        updateProductsCount(1);
      }
      fetchProducts();
      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error('Ошибка при сохранении товара:', err);
      setError(err.response?.data?.error || err.message || 'Ошибка при сохранении товара');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      price: 0,
      article: '',
      manufacturer: '',
      expirationDate: '',
      composition: '',
      contraindications: '',
      storageConditions: '',
      recommendations: '',
      images: [],
      description: '',
      instructions: '',
      stock: 0,
      category: '',
      tags: ''
    });
    setIsEditing(false);
    setCurrentProduct(null);
  };

  const handleEdit = (product) => {
    let images = product.images || [];
    if (!images.length) {
      const imagesKey = product.article ? `productImages_${product.article}` : `productImages_${product.title}`;
      try {
        images = JSON.parse(localStorage.getItem(imagesKey) || '[]');
      } catch {
        images = [];
      }
      if (!images.length && product.image_url) images = [product.image_url];
    }
    setFormData({
      title: product.title,
      price: product.price,
      article: product.article,
      manufacturer: product.manufacturer,
      expirationDate: product.expirationDate,
      composition: product.composition,
      contraindications: product.contraindications,
      storageConditions: product.storageConditions,
      recommendations: product.recommendations,
      images,
      description: product.description,
      instructions: product.instructions || '',
      stock: product.stock,
      category: product.category,
      tags: product.tags || ''
    });
    setIsEditing(true);
    setCurrentProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      setError('');
      await deleteProduct(id);
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      updateProductsCount(-1);
      setSuccessMessage('Товар успешно удален');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Ошибка при удалении товара:', err);
      if (err.response?.data?.error === 'Товар не найден') {
        setError('Товар уже был удален или не существует');
        setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
        updateProductsCount(-1);
      } else {
        setError(err.response?.data?.error || err.message || 'Ошибка при удалении товара');
      }
    }
  };

  const toggleForm = () => {
    if (showForm) {
      resetForm();
    }
    setShowForm(!showForm);
  };

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление товарами</h1>
        <button
          onClick={toggleForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center"
        >
          {showForm ? (
            <>
              <FaChevronUp className="mr-2" />
              Скрыть форму
            </>
          ) : (
            <>
              <FaPlus className="mr-2" />
              Добавить товар
            </>
          )}
        </button>
      </div>

      {(error || successMessage) && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-lg">
              <div className="flex items-center">
                <div className="py-1">
                  <p className="font-medium">Ошибка</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg">
              <div className="flex items-center">
                <div className="py-1">
                  <p className="font-medium">Успешно</p>
                  <p className="text-sm">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цена
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Артикул
              </label>
              <input
                type="text"
                value={formData.article}
                onChange={(e) => setFormData({ ...formData, article: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Производитель
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Срок годности
              </label>
              <input
                type="text"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Категория
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="">Выберите категорию</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Количество на складе
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Изображения (можно выбрать несколько)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesUpload}
                className="w-full border border-gray-300 rounded-md p-2"
              />
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`img${idx}`}
                        className="h-20 w-20 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-0 right-0 bg-white bg-opacity-80 rounded-full p-1 text-red-600 hover:bg-red-100"
                        title="Удалить изображение"
                      >
                        <FaTimes />
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute bottom-0 left-0 opacity-0 w-full h-1/2 cursor-pointer"
                        title="Заменить изображение"
                        onChange={e => e.target.files[0] && handleReplaceImage(idx, e.target.files[0])}
                      />
                      <span className="absolute bottom-0 left-0 w-full text-xs text-center bg-white bg-opacity-70">Заменить</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
                rows="3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Состав
              </label>
              <textarea
                value={formData.composition}
                onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
                rows="3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Противопоказания
              </label>
              <textarea
                value={formData.contraindications}
                onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
                rows="3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Условия хранения
              </label>
              <textarea
                value={formData.storageConditions}
                onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
                rows="3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Рекомендации
              </label>
              <textarea
                value={formData.recommendations}
                onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-md p-2"
                rows="3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Инструкция по применению
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2"
                rows="4"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              {isEditing ? 'Сохранить изменения' : 'Добавить товар'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Цена</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">На складе</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {(product.images && product.images.length > 0 ? product.images : [product.image_url]).length > 0 && (
                      <img
                        src={(product.images && product.images.length > 0)
                          ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`)
                          : (product.image_url && product.image_url.startsWith('http') ? product.image_url : `http://localhost:5000${product.image_url}`)}
                        alt={product.title}
                        className="h-10 w-10 rounded-full mr-3 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = require('../../images/image 1.png');
                        }}
                      />
                    )}
                    <div className="text-sm font-medium text-gray-900">
                      {product.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.price} ₽</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 mr-4"><FaEdit /></button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;