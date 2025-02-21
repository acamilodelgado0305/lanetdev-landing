import React from 'react';
import { Bar, Line, Doughnut, Pie, Radar, PolarArea } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale } from 'chart.js';
import TaskComponent from '../components/task/TaskComponent';
import { BsFillArchiveFill, BsCurrencyDollar, BsPeopleFill, BsFillBellFill } from 'react-icons/bs';

// Registra los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
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
        tension: 0.3, // Añade suavidad a la curva
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

  // Nuevo gráfico de área polar para mostrar datos adicionales
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

  return (
    <main className="flex flex-col items-center justify-start bg-gray-50 min-h-screen">
      <div className="text-center mb-2">
        <h3 className="text-2xl font-semibold text-gray-800">Dashboard</h3>
      </div>



      {/* Sección para las tareas de pago a un lado y las tarjetas al otro lado */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Columna para las tareas de pagos */}
        <div className="md:col-span-1 bg-white shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Tareas Pendientes</h3>
          <TaskComponent />
        </div>

        {/* Columna para las tarjetas de resumen organizadas en filas de dos */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Productos', icon: <BsFillArchiveFill />, value: 300 },
            { label: 'Ingresos', icon: <BsCurrencyDollar />, value: "$12,000" },
            { label: 'Clientes Activos', icon: <BsPeopleFill />, value: 33 },
            { label: 'Alertas', icon: <BsFillBellFill />, value: 42 },
          ].map((item, index) => (
            <div key={index} className="bg-white shadow-sm p-4 flex flex-col items-center hover:bg-blue-100 transition-all">
              <div className="text-blue-500 text-2xl mb-2">{item.icon}</div>
              <h3 className="text-sm font-medium text-gray-700">{item.label}</h3>
              <h1 className="text-xl font-bold text-gray-700">{item.value}</h1>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos */}
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
                  font: { size: 20 }
                },
              },
              maintainAspectRatio: false,
            }}
            height={300}
          />
        </div>
        <div>
          <Doughnut
            data={municipalityData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                },
                title: {
                  display: true,
                  text: 'Clientes por Municipio',
                  font: { size: 20 }
                },
              },
              maintainAspectRatio: false,
            }}
            height={300}
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
                  font: { size: 20 }
                },
              },
              maintainAspectRatio: false,
            }}
            height={300}
          />
        </div>
        <div className="mt-6">
          <Pie
            data={regionData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'right',
                },
                title: {
                  display: true,
                  text: 'Distribución de Clientes por Región',
                  font: { size: 20 }
                },
              },
              maintainAspectRatio: false,
            }}
            height={300}
          />
        </div>

        {/* Nuevo gráfico de radar */}
        <div className="mt-6">
          <Radar
            data={radarData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Desempeño por Área',
                  font: { size: 20 }
                },
              },
              maintainAspectRatio: false,
            }}
            height={300}
          />
        </div>

        {/* Nuevo gráfico de área polar */}
        <div className="mt-6">
          <PolarArea
            data={polarAreaData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Prioridades por Departamento',
                  font: { size: 20 }
                },
              },
              maintainAspectRatio: false,
            }}
            height={300}
          />
        </div>
      </div>
    </main>
  );
}
