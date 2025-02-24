import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from '@ant-design/icons';

const formatCurrency = (amount) => {
  if (isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const Summary = ({ 
  totalIncome, 
  totalExpenses, 
  balance, 
  monthlyIncome, 
  monthlyExpenses, 
  monthlyBalance, 
  userRole 
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <Row gutter={[16, 16]}>
        {userRole === "superadmin" && (
          <>
            <Col xs={24} md={8}>
              <Card bordered={false} className="h-full">
                <Statistic
                  title="Ingresos Totales"
                  value={totalIncome}
                  precision={2}
                  prefix={<ArrowUpOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                  formatter={(value) => formatCurrency(value)}
                  className="mb-4"
                />
                <Statistic
                  title="Ingresos Mensuales"
                  value={monthlyIncome}
                  precision={2}
                  prefix={<ArrowUpOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                  formatter={(value) => formatCurrency(value)}
                />
              </Card>
            </Col>
          </>
        )}

        {(userRole === "admin" || userRole === "superadmin") && (
          <Col xs={24} md={8}>
            <Card bordered={false} className="h-full">
              <Statistic
                title="Egresos Totales"
                value={totalExpenses}
                precision={2}
                prefix={<ArrowDownOutlined />}
                valueStyle={{ color: '#cf1322' }}
                formatter={(value) => formatCurrency(value)}
                className="mb-4"
              />
              <Statistic
                title="Egresos Mensuales"
                value={monthlyExpenses}
                precision={2}
                prefix={<ArrowDownOutlined />}
                valueStyle={{ color: '#cf1322' }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
        )}

        <Col xs={24} md={8}>
          <Card bordered={false} className="h-full">
            <Statistic
              title="Balance Total"
              value={balance}
              precision={2}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
              className="mb-4"
            />
            <Statistic
              title="Balance Mensual"
              value={monthlyBalance}
              precision={2}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Summary;