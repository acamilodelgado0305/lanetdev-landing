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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecciona la categoría*
        </label>
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
                  <CheckCircleOutlined className="text-green-700" />
                )}
              </div>
            </Select.Option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default CategorySelector;