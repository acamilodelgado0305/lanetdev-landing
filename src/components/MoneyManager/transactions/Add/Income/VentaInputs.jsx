// VentaInputs.jsx
import React from 'react';
import { Input, Select, Typography, Divider } from 'antd';
import AccountSelector from '../AccountSelector';

const { Text } = Typography;

const VentaInputs = ({
  isVentaChecked,
  handleAmountChange,
  categoria,
  setCategoria,
  categorias,
  account,
  setAccount,
  accounts,
  date,
}) => {
  if (!isVentaChecked) return null;

  return (
    <div className="space-y-4">
      <div>
        <div>Importe*</div>
        <Input
          onChange={(e) => handleAmountChange(e, "venta")}
          prefix="$"
          size="large"
          className="text-lg"
          placeholder="Ingrese el importe de la venta"
        />
      </div>

      <div className="mb-3">
        <Text className="text-gray-700 font-medium block">Categoría Contable</Text>
        <Select
          value={categoria}
          onChange={(value) => setCategoria(value)}
          className="w-full h-9"
          placeholder="Selecciona una categoría"
          showSearch
          dropdownRender={(menu) => (
            <div>
              {menu}
              <Divider style={{ margin: '8px 0' }} />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '8px',
                  cursor: 'pointer',
                }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => console.log('Redirigiendo a crear categoría...')}
              >
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  + Nueva Categoría
                </Text>
              </div>
            </div>
          )}
        >
          {Array.isArray(categorias) &&
            categorias.map((cat) => (
              <Select.Option key={cat.id} value={cat.name}>
                {cat.name}
              </Select.Option>
            ))}
        </Select>
      </div>

      <div>
        <Text className="text-gray-700 font-medium block">Cuenta</Text>
        <AccountSelector
          selectedAccount={account}
          onAccountSelect={(value) => setAccount(value)}
          accounts={accounts}
        />
      </div>
    </div>
  );
};

export default VentaInputs;