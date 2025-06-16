import { FaFacebook, FaTwitter, FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">AptekaOnline</h3>
            <p className="text-gray-300">
              Ваша надежная онлайн-аптека для качественных медикаментов и медицинских товаров.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <FaInstagram className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Быстрые ссылки</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Главная</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">О нас</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Контакты</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Политика конфиденциальности</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Свяжитесь с нами</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FaPhone />
                <span className="text-gray-300">+1 (123) 456-7890</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaEnvelope />
                <span className="text-gray-300">info@aptekaonline.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} AptekaOnline. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
