import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiLogOut,
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../utils/api";

function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    breakdowns: { expense: {}, income: {} },
    counts: { expense: 0, income: 0 },
    totals: { balance: 0, expense: 0, income: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        setDashboardData(res.data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load dashboard data");
        setIsLoading(false);
      }
    };

    getData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { totals, breakdowns } = dashboardData;

  // Transform breakdowns into chart data
  const incomeData = Object.entries(breakdowns.income).map(([name, value]) => ({
    name,
    value,
  }));
  const expenseData = Object.entries(breakdowns.expense).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6"];

  return (
    <div className="bg-gray-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-indigo-500 text-white">
                <FiDollarSign size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Balance</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.balance)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-500 text-white">
                <FiTrendingUp size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Income</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.income)}
                </p>
                <span className="text-green-600 text-sm">
                  {dashboardData.counts.income} transactions
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-red-500 text-white">
                <FiTrendingDown size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Expenses</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.expense)}
                </p>
                <span className="text-red-600 text-sm">
                  {dashboardData.counts.expense} transactions
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Income Breakdown</h3>
            {incomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={120}
                    label
                  >
                    {incomeData.map((entry, index) => (
                      <Cell
                        key={`income-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No income data available
              </p>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 text-center">
                No expense data available
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
