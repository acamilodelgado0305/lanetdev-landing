import React from 'react';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import Header from '../components/header/Header';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill } from 'react-icons/bs';

// Registra los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Index() {
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
        backgroundColor: '#007566',
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

  return (
    <main className="flex flex-col items-center justify-start bg-gray-50 min-h-screen">


      <div className="text-center mb-2">
        <h3 className="text-xl font-semibold text-gray-800">Dashboard</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
        {[
          { label: 'Productos', icon: <BsFillArchiveFill />, value: 300 },
          { label: 'Tráfico', icon: <BsFillGrid3X3GapFill />, value: 12 },
          { label: 'Clientes Activos', icon: <BsPeopleFill />, value: 33 },
          { label: 'Alertas', icon: <BsFillBellFill />, value: 42 },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-2 flex flex-col items-center">
            <div className="text-blue-500 text-2xl mb-2">{item.icon}</div>
            <h3 className="text-sm font-medium text-gray-700">{item.label}</h3>
            <h1 className="text-1xl font-bold text-gray-700">{item.value}</h1>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        <div className="mb-6">
          <Line
            data={monthlyData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Clientes por Mes',
                },
              },
            }}
          />
        </div>
        <div>
          <Doughnut
            data={municipalityData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Clientes por Municipio',
                },
              },
              maintainAspectRatio: false,
            }}
            height={200}
          />
        </div>
        <div className="mt-6">
          <Bar
            data={barData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Ventas por Producto',
                },
              },
            }}
          />
        </div>
        <div className="mt-6">
          <Pie
            data={regionData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Distribución de Clientes por Región',
                },
              },
              maintainAspectRatio: false,
            }}
            height={150}

          />
        </div>
      </div>
    </main>
  );
}
