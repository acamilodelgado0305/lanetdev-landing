import React from 'react';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

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

  return (
    <main className="flex flex-col items-center justify-center p-4 bg-gray-50 min-h-screen">
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

      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pv" fill="#8884d8" />
              <Bar dataKey="uv" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
