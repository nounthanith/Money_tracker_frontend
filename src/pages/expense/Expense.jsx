import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import {
  FiDollarSign,
  FiCalendar,
  FiTag,
  FiPlus,
  FiTrendingDown,
  FiTrash,
  FiEdit,
} from "react-icons/fi";

function Expense() {
  const [expenses, setExpenses] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({});
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getExpense = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/expenses", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setExpenses(res.data.expenses);
      setCategoryTotals(res.data.categoryTotals);
      setTotal(res.data.total);
    } catch (err) {
      setError("Failed to fetch expense data");
      console.error("Error fetching expense data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getExpense();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Expense deleted successfully");
      getExpense();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-expense/${id}`);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={getExpense}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ចំណាយ</h1>
          <p className="text-gray-600">តាមដាន និងគ្រប់គ្រងការចំណាយរបស់អ្នក។</p>
        </div>
        <button
          onClick={() => navigate("/create-expense")}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          បន្ថែម ប្រតិបត្តិការណ៍
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                ចំណាយ សរុប
              </p>
              <p className="text-2xl font-bold text-gray-800">
                ${total.toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FiDollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">ចំនួន ប្រតិបត្តិការណ៍សរុប</p>
              <p className="text-2xl font-bold text-gray-800">
                {expenses.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiCalendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">ចំនួន ប្រភេទប្រតិបត្តិការណ៍</p>
              <p className="text-2xl font-bold text-gray-800">
                {Object.keys(categoryTotals).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiTag className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            ប្រតិបត្តិការណ៍
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <div
                key={expense._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {expense.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(expense.date)} • {expense.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      -${expense.amount.toFixed(2)}
                    </p>
                    <div className="flex justify-end items-center w-full space-x-2 mt-2">
                      <button onClick={() => handleDelete(expense._id)}>
                        <FiTrash className="w-5 h-5 text-red-600" />
                      </button>
                      <button onClick={() => handleEdit(expense._id)}>
                        <FiEdit className="w-5 h-5 text-blue-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">
              គ្មានទិន្នន័យប្រតិបត្តិការណ៍ចំណាយ
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">
              ចំណាយថ្មីៗ
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(categoryTotals).map(([category, amount]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">
                      {category}
                    </span>
                    <span className="text-gray-900">${amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(amount / total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expense;
