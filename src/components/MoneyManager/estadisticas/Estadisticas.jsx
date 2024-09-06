import React, { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  getTransactions,
  getTransfers,
  getAccounts,
} from "../../../services/moneymanager/moneyService";

function Estadisticas() {
  const [entries, setEntries] = useState([]);

  const fetchEntries = async () => {
    try {
      const [transactions, transfers] = await Promise.all([
        getTransactions(),
        getTransfers(),
      ]);

      const allEntries = [
        ...transactions.map((tx) => ({ ...tx, entryType: "transaction" })),
        ...transfers.map((tf) => ({
          ...tf,
          entryType: "transfer",
          fromAccountName: getAccountName(tf.from_account_id),
          toAccountName: getAccountName(tf.to_account_id),
        })),
      ];

      setEntries(allEntries);
      updateFinancialSummary(allEntries);
    } catch (err) {
      setError("Error al cargar las entradas");
      console.error("Error fetching entries:", err);
    }
  };

  const chartData = useMemo(() => {
    const data = {};
    filteredEntries.forEach((entry) => {
      const date = formatDate(parseISO(entry.date), "yyyy-MM-dd");
      if (!data[date]) {
        data[date] = { date, income: 0, expense: 0 };
      }
      if (entry.type === "income") {
        data[date].income += entry.amount;
      } else if (entry.type === "expense") {
        data[date].expense += entry.amount;
      }
    });
    return Object.values(data).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [filteredEntries]);

  return (
    <div>
      {/* Chart */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Resumen de Ingresos y Gastos
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#3b82f6"
              name="Ingresos"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              name="Gastos"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Estadisticas;
