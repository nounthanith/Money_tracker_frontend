import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiLogOut,
  FiCalendar,
  FiChevronDown,
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
  
  // Date filter state
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    label: 'This Month'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Date filter options
  const dateRanges = [
    { label: 'Today', getRange: () => {
      const today = new Date();
      return { startDate: today, endDate: today };
    }},
    { label: 'Yesterday', getRange: () => {
      const yesterday = subDays(new Date(), 1);
      return { startDate: yesterday, endDate: yesterday };
    }},
    { label: 'This Week', getRange: () => ({
      startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
      endDate: endOfWeek(new Date(), { weekStartsOn: 1 })
    })},
    { label: 'This Month', getRange: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    })},
    { label: 'This Year', getRange: () => ({
      startDate: startOfYear(new Date()),
      endDate: endOfYear(new Date())
    })},
    { label: 'Custom', getRange: () => dateRange }
  ];

  const fetchData = useCallback(async () => {
    try {
      const params = {
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0]
      };
      
      const res = await api.get("/dashboard", {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      setDashboardData(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      setIsLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const handleDateRangeSelect = (range) => {
    if (range.label === 'Custom') {
      setShowDatePicker(true);
      return;
    }
    
    const { startDate, endDate } = range.getRange();
    setDateRange({
      startDate,
      endDate,
      label: range.label
    });
    setShowDatePicker(false);
  };
  
  const handleCustomDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: new Date(value),
      label: 'Custom Range'
    }));
  };

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
      <div className="h-screen flex items-center justify-center ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center px-4">
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

  const COLORS = ["#10B981", "#EF4444"];

  // Prepare comparison data
  const comparisonData = [
    { name: 'Income', value: totals.income, color: COLORS[0] },
    { name: 'Expense', value: totals.expense, color: COLORS[1] },
  ];

  // Calculate comparison metrics
  const total = totals.income + totals.expense;
  const incomePercentage = total > 0 ? Math.round((totals.income / total) * 100) : 0;
  const expensePercentage = total > 0 ? Math.round((totals.expense / total) * 100) : 0;
  const netBalance = totals.income - totals.expense;
  const isPositiveBalance = netBalance >= 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">ការគ្រប់គ្រងទឹកប្រាក់</h1>
          
          {/* Date Range Selector */}
          <div className="relative">
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiCalendar className="h-4 w-4 text-gray-500" />
              <span>{dateRange.label}</span>
              <FiChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            
            {showDatePicker && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg overflow-hidden z-10">
                <div className="py-1">
                  {dateRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => handleDateRangeSelect(range)}
                      className={`block w-full text-left px-4 py-2 text-sm ${
                        dateRange.label === range.label
                          ? 'bg-indigo-100 text-indigo-900'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                
                {/* Custom Date Range Picker */}
                <div className="border-t border-gray-200 p-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={format(dateRange.startDate, 'yyyy-MM-dd')}
                        onChange={handleCustomDateChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={format(dateRange.endDate, 'yyyy-MM-dd')}
                        onChange={handleCustomDateChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Date Range Display */}
        <p className="mt-2 text-sm text-gray-500">
          បង្ហាញ ទិន្នន័យ ពី {format(dateRange.startDate, 'MMM d, yyyy')} ដល់ {format(dateRange.endDate, 'MMM d, yyyy')}
        </p>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        

        {/* Financial Summary Section */}
        <div className="mt-8 bg-white shadow-lg rounded-2xl p-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Income Card */}
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-green-800">ចំណូលសរុប</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.income)}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {incomePercentage}% នៃចំណូលសរុប
                  </p>
                  <p className="text-xs text-gray-500 mt-2">ប្រតិបត្តិការណ៍ {dashboardData.counts.income}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <FiTrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Expense Card */}
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-red-800">ចំណាយសរុប</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.expense)}</p>
                  <p className="text-sm text-red-600 mt-1">
                    {expensePercentage}% នៃចំណាយសរុប
                  </p>
                  <p className="text-xs text-gray-500 mt-2">ប្រតិបត្តិការណ៍ {dashboardData.counts.expense}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <FiTrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Net Balance Card */}
            <div className={`border-l-4 ${isPositiveBalance ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'} p-4 rounded-r-lg`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">ចំណូលសរុប និង ចំណាយសរុប</p>
                  <p className={`text-2xl font-bold ${isPositiveBalance ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(Math.abs(netBalance))}
                    <span className="text-sm ml-1">{isPositiveBalance ? 'ចំណេញ' : 'ខាត'}</span>
                  </p>
                  <p className="text-sm mt-1">
                    {isPositiveBalance ? 'ចំណេញ' : 'ខាត'}</p>
                </div>
                <div className={`p-2 ${isPositiveBalance ? 'bg-green-100' : 'bg-red-100'} rounded-lg`}>
                  {isPositiveBalance ? (
                    <FiTrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <FiTrendingDown className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Income vs Expense Comparison */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">ចំណូល និង ចំណាយ</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={comparisonData} 
                  layout="vertical" 
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  barCategoryGap={20}
                >
                  <XAxis 
                    type="number" 
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={80}
                  />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(value)}`, value === totals.income ? 'ចំណូល' : 'ចំណាយ']}
                    labelFormatter={() => ''}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[0, 4, 4, 0]}
                    barSize={30}
                  >
                    {comparisonData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        strokeWidth={2}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ratio Indicator */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">សង្ខេប ប្រតិបត្តិការណ៍ចំណូល និង ចំណាយ</span>
              <span className="text-sm font-semibold">
                {totals.expense > 0 ? (totals.income / totals.expense).toFixed(2) : '∞'}:1
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-red-500"
                style={{ 
                  width: '100%',
                  backgroundImage: `linear-gradient(90deg, #10B981 ${incomePercentage}%, #EF4444 ${incomePercentage}%)`
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>ចំណេញ</span>
              <span>ខាត</span>
            </div>
          </div>
        </div>

        {/* Breakdown Section */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">ប្រតិបត្តិការណ៍ចំណូល</h3>
            {incomeData.length > 0 ? (
              <div className="space-y-4">
                {incomeData.map((item, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-green-600">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(item.value / totals.income) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">មិនមានទិន្នន័យប្រតិបត្តិការណ៍ចំណូល</p>
            )}
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">ប្រតិបត្តិការណ៍ចំណាយ</h3>
            {expenseData.length > 0 ? (
              <div className="space-y-4">
                {expenseData.map((item, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-red-600">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: totals.expense > 0 ? `${(item.value / totals.expense) * 100}%` : '0%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">មិនមានទិន្នន័យប្រតិបត្តិការណ៍ចំណាយ</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
