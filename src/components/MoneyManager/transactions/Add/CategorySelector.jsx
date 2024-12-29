import React from 'react';
import { Select, Checkbox } from 'antd';
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
      <div>
       
        <Select
          value={selectedCategory}
          onChange={onCategorySelect}
          className="w-full"
          placeholder="Selecciona una categoría"
        >
          {categories.map((cat) => (
            <Select.Option key={cat.id} value={cat.id.toString()}>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm">{cat.name}</span>
                {selectedCategory === cat.id.toString() && (
                  <CheckCircleOutlined className="text-green-500" />
                )}
              </div>
            </Select.Option>
          ))}
        </Select>
      </div>

      {selectedCategory && additionalInputs && additionalInputs(selectedCategory)}

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