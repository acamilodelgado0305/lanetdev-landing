import React, { useState } from 'react';
import { Bar, Line, Doughnut, Pie, Radar, PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title as ChartTitle, Tooltip, Legend, ArcElement, RadialLinearScale } from 'chart.js';
import { Layout, Card, Row, Col, Collapse, Space, Typography, List } from 'antd';
import { UserOutlined, FileTextOutlined, GlobalOutlined, TagOutlined, DollarOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import { BsFillArchiveFill, BsCurrencyDollar, BsPeopleFill, BsFillBellFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import TaskComponent from '../components/task/TaskComponent';

// Registra los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  ChartTitle,
  Tooltip,
  Legend
);

const { Content } = Layout;
const { Panel } = Collapse;
const { Title: TypographyTitle, Text } = Typography;

export default function Index() {
  const [collapsed, setCollapsed] = useState(false);

  // Datos simulados de clientes por mes (gráfico de líneas)
  const monthlyData = {
    labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto'],
    datasets: [
      {
        label: 'Clientes',
        data: [50, 70, 60, 90, 80, 100, 120, 110],
        borderColor: '#4bc0c0',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#36A2EB',
        pointBorderWidth: 2,
      },
    ],
  };

  // Datos simulados de clientes por municipio (gráfico de doughnut)
  const municipalityData = {
    labels: ['Bucaramanga', 'Cúcuta', 'Floridablanca', 'Girón', 'Pamplona', 'Piedecuesta'],
    datasets: [
      {
        label: 'Clientes',
        data: [200, 150, 100, 80, 50, 60],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  // Datos simulados para un gráfico de barras (Ventas por Producto)
  const barData = {
    labels: ['Producto A', 'Producto B', 'Producto C', 'Producto D', 'Producto E'],
    datasets: [
      {
        label: 'Ventas',
        data: [65, 59, 80, 81, 56],
        backgroundColor: ['#007566', '#36A2EB', '#FF6384', '#FFCE56', '#FF9F40'],
      },
    ],
  };

  // Datos simulados para un gráfico de pastel (Distribución de Clientes por Región)
  const regionData = {
    labels: ['Santander', 'Norte de Santander', 'Otras Regiones'],
    datasets: [
      {
        label: 'Clientes',
        data: [300, 200, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  // Datos simulados para un gráfico de radar
  const radarData = {
    labels: ['Atención al Cliente', 'Ventas', 'Marketing', 'Innovación', 'Desarrollo de Producto'],
    datasets: [
      {
        label: 'Desempeño',
        data: [65, 59, 90, 81, 56],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  // Datos simulados para un gráfico de área polar
  const polarAreaData = {
    labels: ['Marketing', 'Ventas', 'Desarrollo', 'Soporte', 'Logística'],
    datasets: [
      {
        label: 'Prioridades',
        data: [10, 20, 30, 40, 50],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        borderWidth: 1,
      },
    ],
  };

  // Opciones comunes para los gráficos
  const chartOptions = (titleText) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: titleText,
        font: { size: 18 },
      },
    },
    maintainAspectRatio: false,
  });

  // Datos para el componente "Acceso rápido" con íconos temáticos
  const quickAccessItems = [
    { key: '1', label: 'Clientes', icon: <UserOutlined />, path: '/index/clientes' },
    { key: '2', label: 'Facturas', icon: <FileTextOutlined />, path: '/facturas' },
    { key: '3', label: 'Gestión de Red', icon: <GlobalOutlined />, path: '/gestion-de-red' },
    { key: '4', label: 'Tickets', icon: <TagOutlined />, path: '/tickets' },
    { key: '5', label: 'Contabilidad', icon: <DollarOutlined />, path: '/index/moneymanager/transactions' },
  ];

  return (
    <Layout className='p-6' style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
     

        {/* Componente "Acceso rápido" */}
        <Card style={{ marginBottom: '24px' }}>
          <Collapse
            bordered={false}
            defaultActiveKey={['1']}
            expandIcon={({ isActive }) => (isActive ? <DownOutlined /> : <RightOutlined />)}
            style={{ background: '#fff' }}
          >
            <Panel header="Acceso rápido" key="1">
              <List
                dataSource={quickAccessItems}
                renderItem={(item) => (
                  <List.Item style={{ padding: '8px 0', cursor: 'pointer' }}>
                    <Link to={item.path} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <Space>
                        {item.icon}
                        <Text>{item.label}</Text>
                      </Space>
                    </Link>
                  </List.Item>
                )}
              />
            </Panel>
          </Collapse>
        </Card>

        {/* Sección para las tareas y tarjetas de resumen */}
        <Row gutter={[16, 16]}>
          {/* Columna para las tareas de pagos */}
          <Col xs={24} md={8}>
            
              <TaskComponent />
          
          </Col>

          {/* Columna para las tarjetas de resumen */}
          <Col xs={24} md={16}>
            <Row gutter={[16, 16]}>
              {[
                { label: 'Productos', icon: <BsFillArchiveFill />, value: 300 },
                { label: 'Ingresos', icon: <BsCurrencyDollar />, value: '$12,000' },
                { label: 'Clientes Activos', icon: <BsPeopleFill />, value: 33 },
                { label: 'Alertas', icon: <BsFillBellFill />, value: 42 },
              ].map((item, index) => (
                <Col xs={24} sm={12} key={index}>
                  <Card hoverable>
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      <div style={{ fontSize: '24px', color: '#1890ff' }}>{item.icon}</div>
                      <Text strong>{item.label}</Text>
                      <TypographyTitle level={4} style={{ margin: 0 }}>{item.value}</TypographyTitle>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>

      </Content>
    </Layout>
  );
}