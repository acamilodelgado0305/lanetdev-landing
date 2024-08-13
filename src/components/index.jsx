import React from 'react';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill, BsFillBellFill } from 'react-icons/bs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Index() {
  const data = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  return (
    <main className='flex flex-col items-center justify-center p-6 bg-gray-100'>
      <div className='text-center mb-8'>
        <h3 className='text-2xl font-bold text-gray-900'>DASHBOARD</h3>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='flex flex-col items-center p-6'>
            <h3 className='text-lg font-bold text-gray-700'>PRODUCTOS</h3>
            <BsFillArchiveFill className='text-4xl text-blue-500 mt-2' />
          </div>
          <h1 className='text-4xl font-bold text-gray-700 text-center py-4'>300</h1>
        </div>
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='flex flex-col items-center p-6'>
            <h3 className='text-lg font-bold text-gray-700'>TRÁFICO</h3>
            <BsFillGrid3X3GapFill className='text-4xl text-blue-500 mt-2' />
          </div>
          <h1 className='text-4xl font-bold text-gray-700 text-center py-4'>12</h1>
        </div>
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='flex flex-col items-center p-6'>
            <h3 className='text-lg font-bold text-gray-700'>CLIENTES ACTIVOS</h3>
            <BsPeopleFill className='text-4xl text-blue-500 mt-2' />
          </div>
          <h1 className='text-4xl font-bold text-gray-700 text-center py-4'>33</h1>
        </div>
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='flex flex-col items-center p-6'>
            <h3 className='text-lg font-bold text-gray-700'>ALERTAS</h3>
            <BsFillBellFill className='text-4xl text-blue-500 mt-2' />
          </div>
          <h1 className='text-4xl font-bold text-gray-700 text-center py-4'>42</h1>
        </div>
      </div>

      <div className='w-full max-w-3xl'>
        <div className='mb-8'>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
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
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
}
