import React from 'react';
import { Card, Checkbox } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const CategorySelector = ({
  categories = [],
  selectedCategory,
  onCategorySelect,
  additionalInputs = null,
  onFevCheckChange = () => { },
  isFevChecked = false,
  ventaCategoryId = null
}) => {
  return (
    <div className="space-y-3">

      <div className="flex justify-center">
        <label className="block font-bold text-gray-500 mb-2">
          Selecciona la categoría
        </label>
      </div>



      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            onClick={() => onCategorySelect(cat.id.toString())}
            className={`cursor-pointer transition-all hover:shadow-sm ${selectedCategory === cat.id.toString()
              ? 'border-green-500 border-2 bg-green-50'
              : 'hover:border-gray-300'
              }`}
            bodyStyle={{ padding: '8px' }}
            size="small"
          >
            <div className="flex items-center space-x-3">
             
              <span className="text-sm font-medium flex-grow">{cat.name}</span>
              {selectedCategory === cat.id.toString() && (
                <CheckCircleOutlined className="text-green-500 flex-shrink-0" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Renderizar los inputs adicionales primero */}
      {selectedCategory && additionalInputs && additionalInputs(selectedCategory)}

      {/* Para categoría Venta, el checkbox va justo después del importe */}
      {selectedCategory === ventaCategoryId?.toString() && (
        <div className="mt-2">
          <Checkbox
            checked={isFevChecked}
            onChange={(e) => onFevCheckChange(e.target.checked)}
            className="text-sm font-medium text-gray-700"
          >
            FEV* (Factura electrónica de venta)
          </Checkbox>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;