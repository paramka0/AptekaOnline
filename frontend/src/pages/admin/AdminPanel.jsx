              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Состав
                    </label>
                    <textarea
                      value={product.composition}
                      onChange={(e) => handleProductChange('composition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание
                    </label>
                    <textarea
                      value={product.description}
                      onChange={(e) => handleProductChange('description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="6"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Способ применения
                    </label>
                    <textarea
                      value={product.usage}
                      onChange={(e) => handleProductChange('usage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Состав</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{product.composition}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Описание</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                  </div>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Способ применения</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{product.usage}</p>
                  </div>
                </div>
              </div> 