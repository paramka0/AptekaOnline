import fs from 'fs';
import Product from '../models/Product.js';

// Контроллер для работы с продуктами
class ProductController {
  // Метод для добавления нового продукта
  static async addProduct(req, res) {
    try {
      console.log('Получены данные для создания товара:', req.body);
      const { title, price, image_url, instructions, ...otherFields } = req.body;

      if (!title || !price) {
        return res.status(400).json({ error: 'Название и цена обязательны' });
      }

      let processedImageUrl = image_url;
      if (image_url && image_url.startsWith('data:image')) {
        try {
          console.log('Начало обработки изображения');
          const base64Data = image_url.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          
          if (buffer.length > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'Размер изображения не должен превышать 5MB' });
          }

          // Создаем директорию, если она не существует
          const uploadsDir = './uploads';
          if (!fs.existsSync(uploadsDir)) {
            console.log('Создание директории uploads');
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          const filePath = `${uploadsDir}/${fileName}`;
          console.log('Сохранение изображения в:', filePath);

          await fs.promises.writeFile(filePath, buffer);
          processedImageUrl = `/uploads/${fileName}`;
          console.log('Изображение успешно сохранено:', processedImageUrl);
        } catch (error) {
          console.error('Детальная ошибка при обработке изображения:', error);
          return res.status(400).json({ error: 'Ошибка при обработке изображения: ' + error.message });
        }
      }

      const productData = {
        title,
        price: parseFloat(price),
        image_url: processedImageUrl,
        instructions: instructions || '',
        ...otherFields
      };

      console.log('Создание товара с данными:', productData);
      try {
        const product = await Product.create(productData);
        console.log('Товар успешно создан:', product);
        res.status(201).json(product);
      } catch (error) {
        console.error('Ошибка при создании товара в БД:', error);
        return res.status(500).json({ error: 'Ошибка при создании товара: ' + error.message });
      }
    } catch (error) {
      console.error('Необработанная ошибка при создании товара:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера: ' + error.message });
    }
  }

  // Метод для получения всех продуктов для админ панели
  static async getAllProductsAdmin(req, res) {
    try {
      const products = await Product.getAll();
      console.log(`Найдено ${products.length} товаров для админ панели`);
      res.status(200).json({
        success: true,
        products
      });
    } catch (error) {
      console.error('Ошибка при получении товаров для админ панели:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Метод для получения всех продуктов с пагинацией для главной страницы
  static async getAllProducts(req, res) {
    try {
      const { tags, minPrice, maxPrice, category, search, page = 1, limit = 12 } = req.query;
      let products = await Product.getAll();

      // Применяем все фильтры последовательно
      if (category && category !== 'all') {
        products = products.filter(product => product.category === category);
      }

      if (tags) {
        const tagArray = tags.split(',');
        products = products.filter(product => 
          tagArray.some(tag => product.tags?.includes(tag))
        );
      }

      if (minPrice && maxPrice) {
        products = products.filter(product => 
          product.price >= parseFloat(minPrice) && 
          product.price <= parseFloat(maxPrice)
        );
      }

      if (search) {
        products = products.filter(product => 
          product.title.toLowerCase().includes(search.toLowerCase()) ||
          product.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Применяем пагинацию
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedProducts = products.slice(startIndex, endIndex);

      console.log(`Найдено ${products.length} товаров, показано ${paginatedProducts.length}`);
      res.status(200).json({
        products: paginatedProducts,
        totalProducts: products.length,
        currentPage: parseInt(page),
        totalPages: Math.ceil(products.length / limit)
      });
    } catch (error) {
      console.error('Ошибка при получении товаров:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Метод для получения продукта по ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      console.log('Получение товара по ID:', id);
      
      const product = await Product.getById(id);
      console.log('Найденный товар:', product);
      
      if (!product) {
        console.log('Товар не найден');
        return res.status(404).json({ error: 'Товар не найден' });
      }
      
      res.status(200).json(product);
    } catch (error) {
      console.error('Ошибка при получении товара:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      console.log('Получены данные для обновления товара:', req.body);
      const { id } = req.params;
      const { title, price, image_url, instructions, ...otherFields } = req.body;

      if (!title || !price) {
        return res.status(400).json({ error: 'Название и цена обязательны' });
      }

      let processedImageUrl = image_url;
      if (image_url && image_url.startsWith('data:image')) {
        try {
          console.log('Начало обработки изображения при обновлении');
          const base64Data = image_url.split(',')[1];
          const buffer = Buffer.from(base64Data, 'base64');
          
          if (buffer.length > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'Размер изображения не должен превышать 5MB' });
          }

          // Создаем директорию, если она не существует
          const uploadsDir = './uploads';
          if (!fs.existsSync(uploadsDir)) {
            console.log('Создание директории uploads');
            fs.mkdirSync(uploadsDir, { recursive: true });
          }

          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
          const filePath = `${uploadsDir}/${fileName}`;
          console.log('Сохранение нового изображения в:', filePath);

          await fs.promises.writeFile(filePath, buffer);
          processedImageUrl = `/uploads/${fileName}`;
          console.log('Новое изображение успешно сохранено:', processedImageUrl);

          // Удаляем старое изображение
          const oldProduct = await Product.getById(id);
          if (oldProduct && oldProduct.image_url && oldProduct.image_url.startsWith('/uploads/')) {
            const oldFilePath = `.${oldProduct.image_url}`;
            try {
              console.log('Удаление старого изображения:', oldFilePath);
              await fs.promises.unlink(oldFilePath);
              console.log('Старое изображение успешно удалено');
            } catch (error) {
              console.error('Ошибка при удалении старого изображения:', error);
            }
          }
        } catch (error) {
          console.error('Детальная ошибка при обработке изображения:', error);
          return res.status(400).json({ error: 'Ошибка при обработке изображения: ' + error.message });
        }
      }

      const productData = {
        title,
        price: parseFloat(price),
        image_url: processedImageUrl,
        instructions: instructions || '',
        ...otherFields
      };

      console.log('Обновление товара с данными:', productData);
      try {
        await Product.update(id, productData);
        console.log('Товар успешно обновлен');
        res.json({ message: 'Товар успешно обновлен' });
      } catch (error) {
        console.error('Ошибка при обновлении товара в БД:', error);
        return res.status(500).json({ error: 'Ошибка при обновлении товара: ' + error.message });
      }
    } catch (error) {
      console.error('Необработанная ошибка при обновлении товара:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера: ' + error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await Product.delete(id);
      res.status(200).json({ success: true, message: 'Товар успешно удален' });
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getProductTags(req, res) {
    Product.getTags((err, tags) => {
      if (err) {
        console.error('Error getting tags:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json(tags);
    });
  }

  static async getPriceRange(req, res) {
    Product.getPriceRange((err, range) => {
      if (err) {
        console.error('Error getting price range:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json(range);
    });
  }
}

export default ProductController;
