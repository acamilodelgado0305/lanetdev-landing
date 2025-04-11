import React from 'react';
import { Card } from 'antd';
import {
  BankOutlined,
  WalletOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const AccountSelector = ({
  accounts = [],
  selectedAccount,
  onAccountSelect,
  hiddenDetails = false

}) => {
  const getAccountIcon = (type) => {
    const normalizedType = type?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    switch (true) {
      case normalizedType?.includes('banco'):
      case normalizedType?.includes('bank'):
      case normalizedType?.includes('bancaria'):
        return <BankOutlined className="text-2xl" />;

      case normalizedType?.includes('efectivo'):
      case normalizedType?.includes('cash'):
      case normalizedType?.includes('dinero'):
        return <WalletOutlined className="text-2xl" />;

      case normalizedType?.includes('tarjeta'):
      case normalizedType?.includes('card'):
      case normalizedType?.includes('credito'):
      case normalizedType?.includes('debito'):
        return <CreditCardOutlined className="text-2xl" />;

      default:
        return <DollarOutlined className="text-2xl" />;
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const groupAccountsByType = () => {
    return accounts.reduce((acc, account) => {
      const type = account.type || 'others';
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    }, {});
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(groupAccountsByType()).map(([type, accountsOfType]) => (
          <div key={type}>
            <div className="text-xs font-medium text-gray-500 mb-2 ml-1">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>

            <div className="space-y-2">
              {accountsOfType.map((acc) => (
                <Card
                  key={acc.id}
                  onClick={() => onAccountSelect(acc.id.toString())}
                  className={`cursor-pointer transition-all hover:shadow-sm ${selectedAccount === acc.id.toString()
                    ? 'border-blue-700 border-2 bg-blue-50'
                    : 'hover:border-gray-300'
                    }`}
                  bodyStyle={{ padding: '8px' }}
                  size="small"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getAccountIcon(acc.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-medium">{acc.name}</div>
                      {!hiddenDetails && (
                        <div className="text-xs text-gray-600">
                          {formatCurrency(acc.balance || 0)}
                        </div>
                      )}
                    </div>
                    {selectedAccount === acc.id.toString() && (
                      <div className="flex-shrink-0 text-blue-700">
                        <CheckCircleOutlined />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountSelector;