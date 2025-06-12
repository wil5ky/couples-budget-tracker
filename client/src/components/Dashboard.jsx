import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStats();
  }, [currentMonth, currentYear]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/dashboard/stats', {
        params: { month: currentMonth, year: currentYear }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

  const prepareExpenseData = () => {
    if (!stats?.detailStats) return [];
    
    const expenseData = stats.detailStats
      .filter(item => item.type === 'expense')
      .reduce((acc, item) => {
        const existing = acc.find(a => a.category_name === item.category_name);
        if (existing) {
          existing.value += item.total_amount;
        } else {
          acc.push({
            name: item.category_name || 'Uncategorized',
            value: item.total_amount,
            color: item.category_color || '#8884D8'
          });
        }
        return acc;
      }, []);
    
    return expenseData.sort((a, b) => b.value - a.value);
  };

  const prepareUserSpendingData = () => {
    if (!stats?.detailStats) return [];
    
    const userData = stats.detailStats
      .filter(item => item.type === 'expense')
      .reduce((acc, item) => {
        const existing = acc.find(a => a.user_name === item.user_name);
        if (existing) {
          existing.amount += item.total_amount;
        } else {
          acc.push({
            user_name: item.user_name || 'Unknown',
            amount: item.total_amount
          });
        }
        return acc;
      }, []);
    
    return userData;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const expenseData = prepareExpenseData();
  const userSpendingData = prepareUserSpendingData();
  const netAmount = stats?.netAmount || 0;
  const isPositive = netAmount >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Calendar size={20} className="text-gray-500" />
          <select
            value={`${currentYear}-${currentMonth.toString().padStart(2, '0')}`}
            onChange={(e) => {
              const [year, month] = e.target.value.split('-');
              setCurrentYear(parseInt(year));
              setCurrentMonth(parseInt(month));
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const date = new Date(currentYear, i);
              const value = `${currentYear}-${(i + 1).toString().padStart(2, '0')}`;
              return (
                <option key={value} value={value}>
                  {format(date, 'MMMM yyyy')}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats?.totalIncome || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats?.totalExpenses || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <DollarSign className={`w-6 h-6 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Amount</p>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(netAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Savings Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats?.totalIncome > 0 ? Math.round((netAmount / stats.totalIncome) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No expense data for this month
            </div>
          )}
        </div>

        {/* User Spending Comparison */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Person</h3>
          {userSpendingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userSpendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="user_name" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No spending data for this month
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Summary</h3>
        <div className="space-y-3">
          {stats?.detailStats?.slice(0, 5).map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: item.category_color || '#8884D8' }}></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {item.category_name || 'Uncategorized'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.user_name} • {item.transaction_count} transaction{item.transaction_count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <span className={`font-semibold ${item.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.total_amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;