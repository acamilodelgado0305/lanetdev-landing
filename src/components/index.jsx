import React from 'react';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill, BsEnvelopeFill, BsCalendarFill, BsGearFill } from 'react-icons/bs';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Registra los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Index() {
  const data = [
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
  ];

  const barData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'PV',
        data: data.map((d) => d.pv),
        backgroundColor: '#8884d8',
      },
      {
        label: 'UV',
        data: data.map((d) => d.uv),
        backgroundColor: '#82ca9d',
      },
    ],
  };

  const lineData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'PV',
        data: data.map((d) => d.pv),
        borderColor: '#8884d8',
        backgroundColor: 'rgba(136, 132, 216, 0.2)',
        fill: true,
      },
      {
        label: 'UV',
        data: data.map((d) => d.uv),
        borderColor: '#82ca9d',
        backgroundColor: 'rgba(130, 202, 157, 0.2)',
        fill: true,
      },
    ],
  };

  return (
    <main className="flex flex-col items-center justify-start bg-gray-50 min-h-screen">
      {/* Barra superior con buscador e iconos */}
      <div className="flex items-center justify-between w-full bg-primary p-4 shadow-md">
        <input
          type="text"
          placeholder="Buscar..."
          className="border rounded-md p-2 w-1/3 mx-8"
        />
        <div className="flex space-x-6 text-white">
          <BsFillBellFill className="text-2xl cursor-pointer hover:text-gray-800" />
          <BsEnvelopeFill className="text-2xl cursor-pointer hover:text-gray-800" />
          <BsCalendarFill className="text-2xl cursor-pointer hover:text-gray-800" />
          <BsGearFill className="text-2xl cursor-pointer hover:text-gray-800" />
        </div>
      </div>

      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Dashboard</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Productos', icon: <BsFillArchiveFill />, value: 300 },
          { label: 'Tráfico', icon: <BsFillGrid3X3GapFill />, value: 12 },
          { label: 'Clientes Activos', icon: <BsPeopleFill />, value: 33 },
          { label: 'Alertas', icon: <BsFillBellFill />, value: 42 },
        ].map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center">
            <div className="text-blue-500 text-3xl mb-2">{item.icon}</div>
            <h3 className="text-sm font-medium text-gray-700">{item.label}</h3>
            <h1 className="text-2xl font-bold text-gray-700">{item.value}</h1>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
        <div className="mb-6">
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
                  text: 'Bar Chart',
                },
              },
            }}
          />
        </div>
        <div>
          <Line
            data={lineData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Line Chart',
                },
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
