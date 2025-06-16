import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { russianCities } from '../data/russianCities';
import { novosibirskPharmacies } from '../data/novosibirskPharmacies';
import { YMaps, Map, Placemark, SearchControl, GeolocationControl, ZoomControl } from '@pbe/react-yandex-maps';

const baseSchema = {
  city: yup.string().required('Выберите город'),
  firstName: yup.string().required('Введите имя'),
  lastName: yup.string().required('Введите фамилию'),
  phone: yup.string()
    .required('Телефон обязателен')
    .matches(/^[+][7] \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Формат: +7 (XXX) XXX-XX-XX'),
  deliveryMethod: yup.string().required('Выберите способ получения'),
  paymentMethod: yup.string().required('Выберите способ оплаты')
};

const createSchema = (paymentMethod, deliveryMethod) => {
  const schema = { ...baseSchema };

  if (deliveryMethod === 'pickup') {
    schema.pharmacy = yup.string().required('Выберите аптеку');
  } else if (deliveryMethod === 'delivery') {
    schema.address = yup.string().required('Введите адрес');
  }

  if (paymentMethod === 'card') {
    schema.cardNumber = yup.string()
      .required('Введите номер карты')
      .test('cardNumber', 'Номер карты должен содержать 16 цифр', val => val && val.replace(/\D/g, '').length === 16);
    schema.cardExpiry = yup.string()
      .required('Введите срок действия')
      .matches(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Формат: MM/YY');
    schema.cardCvv = yup.string()
      .required('Введите CVV')
      .matches(/^\d{3}$/, 'CVV должен содержать 3 цифры');
  }

  return yup.object().shape(schema);
};

const formatCardNumber = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(.{4})/g, '$1 ')
    .trim()
    .slice(0, 19);
};

const formatCardExpiry = (value) => {
  let v = value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 3) {
    v = v.slice(0, 2) + '/' + v.slice(2);
  }
  return v;
};

const formatCardCvv = (value) => {
  return value.replace(/\D/g, '').slice(0, 3);
};

const CheckoutModal = ({ onClose, onSubmit, isProcessing, cartTotal }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    resolver: yupResolver(
      yup.lazy((data) => {
        return createSchema(data?.paymentMethod, data?.deliveryMethod);
      })
    )
  });

  const [selectedCity, setSelectedCity] = useState('');
  const [mapCenter, setMapCenter] = useState([55.0084, 82.9357]); // Центр Новосибирска
  const [showMap, setShowMap] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [addressInput, setAddressInput] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);
  const [ymaps, setYmaps] = useState(null);
  const mapRef = useRef(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [ymapsError, setYmapsError] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const deliveryMethod = watch('deliveryMethod');
  const paymentMethod = watch('paymentMethod');

  // Инициализация Яндекс.Карт
  const handleApiAvaliable = (ymaps) => {
    console.log('Yandex Maps API loaded', ymaps);
    setYmaps(ymaps);
    setYmapsError(false);
  };

  useEffect(() => {
    if (selectedCity === 'Новосибирск') {
      setPharmacies(novosibirskPharmacies);
      setShowMap(true);
    } else {
      setPharmacies([]);
      setShowMap(false);
    }
    setAddressInput('');
    setValue('address', '');

    // Если через 5 секунд ymaps не загрузился, показываем ошибку
    const timer = setTimeout(() => {
      if (!ymaps) setYmapsError(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [selectedCity]);

  const handleCityChange = (e) => {
    const value = e.target.value;
    setSelectedCity(value);
    setValue('city', value);
    setSelectedMarker(null);
    setSelectedPharmacy(null);
  };

  const handleMapClick = async (e) => {
    if (!ymaps) return;
    const coords = e.get('coords');
    console.log('Клик по карте:', coords, 'deliveryMethod:', deliveryMethod);
    if (deliveryMethod === 'pickup') {
      // Находим ближайшую аптеку
      const nearestPharmacy = pharmacies.reduce((nearest, pharmacy) => {
        const distance = Math.sqrt(
          Math.pow(pharmacy.coordinates[0] - coords[0], 2) +
          Math.pow(pharmacy.coordinates[1] - coords[1], 2)
        );
        return !nearest || distance < nearest.distance
          ? { ...pharmacy, distance }
          : nearest;
      }, null);

      if (nearestPharmacy) {
        console.log('Выбрана аптека:', nearestPharmacy);
        setSelectedPharmacy(nearestPharmacy);
        setSelectedMarker(nearestPharmacy.coordinates);
        setValue('pharmacy', nearestPharmacy.id);
        setAddressInput(`${nearestPharmacy.name} - ${nearestPharmacy.address}`);
      }
    } else {
      try {
        const geocoder = await ymaps.geocode(coords);
        const firstGeoObject = geocoder.geoObjects.get(0);
        if (firstGeoObject) {
          const address = firstGeoObject.getAddressLine();
          setSelectedMarker(coords);
          setAddressInput(address);
          setValue('address', address);
          console.log('Установлен маркер для доставки:', coords, address);
        } else {
          setSelectedMarker(coords);
          setAddressInput(`${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`);
          setValue('address', `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`);
          console.log('Установлен маркер для доставки (координаты):', coords);
        }
      } catch (error) {
        console.error('Ошибка при геокодировании:', error);
        setSelectedMarker(coords);
        setAddressInput(`${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`);
        setValue('address', `${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`);
      }
    }
  };

  const handlePharmacyClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setSelectedMarker(pharmacy.coordinates);
    setValue('pharmacy', pharmacy.id);
    setAddressInput(`${pharmacy.name} - ${pharmacy.address}`);
  };

  const handleAddressInput = async (e) => {
    const value = e.target.value;
    console.log('Ввод адреса:', value, 'ymaps:', !!ymaps);
    setAddressInput(value);
    setValue('address', value);
    if (value.length > 3 && ymaps) {
      setIsLoadingSuggestions(true);
      try {
        const geocoder = await ymaps.geocode('Новосибирск, ' + value, {
          results: 5
        });
        const suggestions = geocoder.geoObjects.toArray().map(geoObject => ({
          address: geoObject.getAddressLine(),
          coordinates: geoObject.geometry.getCoordinates()
        }));
        setSuggestions(suggestions.map(s => s.address));
        setIsLoadingSuggestions(false);
        console.log('Подсказки:', suggestions.map(s => s.address));
      } catch (error) {
        setSuggestions([]);
        setIsLoadingSuggestions(false);
        console.error('Ошибка при получении подсказок:', error);
      }
    } else {
      setSuggestions([]);
      setIsLoadingSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    if (!ymaps) return;
    try {
      const geocoder = await ymaps.geocode(suggestion);
      const firstGeoObject = geocoder.geoObjects.get(0);
      const coords = firstGeoObject.geometry.getCoordinates();
      setAddressInput(suggestion);
      setValue('address', suggestion);
      setSelectedMarker(coords);
      setSuggestions([]);
    } catch (error) {
      setSuggestions([]);
    }
  };

  const handleFormSubmit = (data) => {
    if (data.paymentMethod === 'card') {
      data.cardNumber = cardNumber;
      data.cardExpiry = cardExpiry;
      data.cardCvv = cardCvv;
    }
    console.log('Order data:', data);
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 my-8 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Оформление заказа</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Город */}
            <div className="mb-4">
              <label className="block mb-1">Город</label>
              <select
                {...register('city')}
                onChange={handleCityChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Выберите город</option>
                {russianCities.map(city => (
                  <option key={city.id} value={city.name}>
                    {city.name}, {city.region}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
              )}
            </div>

            {/* Способ получения */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Способ получения</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="delivery"
                    {...register('deliveryMethod')}
                    className="mr-2"
                  />
                  Доставка
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pickup"
                    {...register('deliveryMethod')}
                    className="mr-2"
                  />
                  Самовывоз
                </label>
              </div>
              {errors.deliveryMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.deliveryMethod.message}</p>
              )}
            </div>

            {/* Карта только для самовывоза */}
            {showMap && deliveryMethod === 'pickup' && (
              <div className="mb-4 border rounded relative" style={{ height: '320px', maxHeight: '40vh', minHeight: '200px' }}>
                <YMaps 
                  query={{ 
                    apikey: 'daf2bef6-e78d-4c26-990f-4344f386e75a',
                    load: 'package.full',
                    lang: 'ru_RU'
                  }} 
                  onApiAvaliable={handleApiAvaliable}
                >
                  <Map
                    defaultState={{
                      center: mapCenter,
                      zoom: 13,
                      controls: ['zoomControl', 'geolocationControl']
                    }}
                    width="100%"
                    height="100%"
                    modules={[
                      'control.ZoomControl',
                      'control.GeolocationControl',
                      'geocode',
                      'geoObject.addon.balloon'
                    ]}
                  >
                    <ZoomControl options={{ position: { right: 10, top: 10 } }} />
                    <GeolocationControl options={{ position: { right: 10, top: 50 } }} />
                    {pharmacies.map(pharmacy => (
                      <Placemark
                        key={pharmacy.id}
                        geometry={pharmacy.coordinates}
                        properties={{
                          balloonContent: `
                            <div>
                              <h3 style=\"font-weight: bold; margin-bottom: 4px;\">${pharmacy.name}</h3>
                              <p style=\"margin: 0;\">${pharmacy.address}</p>
                              <p style=\"margin: 4px 0 0 0; color: #666;\">${pharmacy.workingHours}</p>
                            </div>
                          `
                        }}
                        options={{
                          preset: selectedPharmacy?.id === pharmacy.id ? 'islands#greenDotIcon' : 'islands#blueDotIcon',
                          iconColor: selectedPharmacy?.id === pharmacy.id ? '#00ff00' : '#0000ff'
                        }}
                        onClick={() => handlePharmacyClick(pharmacy)}
                      />
                    ))}
                  </Map>
                </YMaps>
              </div>
            )}

            {/* Адрес или аптека */}
            {deliveryMethod === 'pickup' ? (
              <div className="mb-4">
                <label className="block mb-1">Аптека</label>
                <select
                  {...register('pharmacy')}
                  onChange={(e) => {
                    const pharmacy = pharmacies.find(p => p.id === parseInt(e.target.value));
                    if (pharmacy) {
                      handlePharmacyClick(pharmacy);
                    }
                  }}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Выберите аптеку</option>
                  {pharmacies.map(pharmacy => (
                    <option key={pharmacy.id} value={pharmacy.id}>
                      {pharmacy.name} - {pharmacy.address} ({pharmacy.workingHours})
                    </option>
                  ))}
                </select>
                {errors.pharmacy && (
                  <p className="text-red-500 text-sm mt-1">{errors.pharmacy.message}</p>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <div className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-4 text-center">
                  🚚 Доставка пока недоступна. Пожалуйста, выберите самовывоз из аптеки.
                </div>
              </div>
            )}

            {/* Имя и Фамилия */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Имя</label>
                <input
                  type="text"
                  {...register('firstName')}
                  className="w-full p-2 border rounded"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block mb-1">Фамилия</label>
                <input
                  type="text"
                  {...register('lastName')}
                  className="w-full p-2 border rounded"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Телефон */}
            <div className="mb-4">
              <label className="block mb-1">Телефон</label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full p-2 border rounded"
                placeholder="+7 (XXX) XXX-XX-XX"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Способ оплаты */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Способ оплаты</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="cash"
                    {...register('paymentMethod')}
                    className="mr-2"
                  />
                  Наличными при получении
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="card"
                    {...register('paymentMethod')}
                    className="mr-2"
                  />
                  Картой онлайн
                </label>
                {paymentMethod === 'card' && (
                  <div className="ml-6 mt-2 space-y-2">
                    <div>
                      <label className="block mb-1">Номер карты</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => {
                          setCardNumber(formatCardNumber(e.target.value));
                          setValue('cardNumber', formatCardNumber(e.target.value));
                        }}
                        className="w-full p-2 border rounded"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        inputMode="numeric"
                      />
                      {errors.cardNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1">Срок действия</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => {
                            setCardExpiry(formatCardExpiry(e.target.value));
                            setValue('cardExpiry', formatCardExpiry(e.target.value));
                          }}
                          className="w-full p-2 border rounded"
                          placeholder="MM/YY"
                          maxLength={5}
                          inputMode="numeric"
                        />
                        {errors.cardExpiry && (
                          <p className="text-red-500 text-sm mt-1">{errors.cardExpiry.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1">CVV</label>
                        <input
                          type="text"
                          value={cardCvv}
                          onChange={e => {
                            setCardCvv(formatCardCvv(e.target.value));
                            setValue('cardCvv', formatCardCvv(e.target.value));
                          }}
                          className="w-full p-2 border rounded"
                          placeholder="123"
                          maxLength={3}
                          inputMode="numeric"
                        />
                        {errors.cardCvv && (
                          <p className="text-red-500 text-sm mt-1">{errors.cardCvv.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {errors.paymentMethod && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentMethod.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing
                ? 'Оформление...'
                : `Подтвердить заказ на сумму ${(cartTotal ? cartTotal.toLocaleString('ru-RU') : '0')}₽`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
