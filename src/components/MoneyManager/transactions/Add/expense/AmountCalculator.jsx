import React from 'react';
import { Card, Badge, Tooltip } from 'antd';
import {
  BankOutlined,
  WalletOutlined,
  CreditCardOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';

const AccountSelector = ({
  accounts = [],
  selectedAccount,
  onAccountSelect,
  formatCurrency = (amount) => amount
}) => {
  const getAccountIcon = (type) => {
    const normalizedType = type?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    switch (true) {
      case normalizedType?.includes('banco'):
      case normalizedType?.includes('bank'):
      case normalizedType?.includes('bancaria'):
        return <BankOutlined className="text-xl text-blue-500" />;

      case normalizedType?.includes('efectivo'):
      case normalizedType?.includes('cash'):
      case normalizedType?.includes('dinero'):
        return <WalletOutlined className="text-xl text-green-500" />;

      case normalizedType?.includes('tarjeta'):
      case normalizedType?.includes('card'):
      case normalizedType?.includes('credito'):
      case normalizedType?.includes('debito'):
        return <CreditCardOutlined className="text-xl text-purple-500" />;

      default:
        return <DollarOutlined className="text-xl text-gray-500" />;
    }
  };

  const groupAccountsByType = () => {
    return accounts.reduce((acc, account) => {
      const type = account.type || 'Otras Cuentas';
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    }, {});
  };

  const getAccountTypeLabel = (type) => {
    const labels = {
      'bank': 'Cuentas Bancarias',
      'cash': 'Efectivo',
      'card': 'Tarjetas',
      'credit': 'Créditos',
      'debit': 'Débito',
      'others': 'Otras Cuentas'
    };
    return labels[type.toLowerCase()] || type;
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-green-600';
    if (balance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getBalanceIcon = (balance) => {
    if (balance > 0) return <ArrowUpOutlined className="text-green-500" />;
    if (balance < 0) return <ArrowDownOutlined className="text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-base font-medium text-gray-700">
          Selecciona la cuenta*
        </label>
        <Badge 
          count={accounts.length} 
          className="ml-2"
          style={{ backgroundColor: '#6366f1' }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(groupAccountsByType()).map(([type, accountsOfType]) => (
          <div key={type} className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm font-semibold text-gray-700 mb-3 px-1">
              {getAccountTypeLabel(type)}
            </div>

            <div className="space-y-2">
              {accountsOfType.map((acc) => (
                <Tooltip 
                  key={acc.id}
                  title={`Balance: ${formatCurrency(acc.balance || 0)}`}
                  placement="right"
                >
                  <Card
                    onClick={() => onAccountSelect(acc.id.toString())}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md
                      ${selectedAccount === acc.id.toString()
                        ? 'ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50'
                        : 'hover:border-indigo-300'
                      }`}
                    bodyStyle={{ padding: '10px' }}
                    size="small"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                        {getAccountIcon(acc.type)}
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="text-sm font-medium truncate">
                          {acc.name}
                        </div>
                        <div className={`text-xs flex items-center space-x-1 ${getBalanceColor(acc.balance)}`}>
                          {getBalanceIcon(acc.balance)}
                          <span className="font-medium">
                            {formatCurrency(acc.balance || 0)}
                          </span>
                        </div>
                      </div>

                      {selectedAccount === acc.id.toString() && (
                        <div className="flex-shrink-0">
                          <CheckCircleOutlined className="text-indigo-500 text-lg" />
                        </div>
                      )}
                    </div>
                  </Card>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountSelector;