import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Calendar, TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const Reports = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedPeriod]);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      const months = selectedPeriod === '6months' ? 6 : 12;
      const promises = [];
      
      for (let i = months - 1; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        promises.push(
          axios.get('/api/dashboard/stats', {
            params: { month, year }
          }).then(response => ({
            month: format(date, 'MMM yyyy'),
            date: date,
            ...response.data
          }))
        );
      }
      
      const results = await Promise.all(promises);
      setMonthlyData(results);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (period = 'current') => {
    try {
      setExportLoading(true);
      const currentDate = new Date();
      const params = {};
      
      if (period === 'current') {
        params.month = currentDate.getMonth() + 1;
        params.year = currentDate.getFullYear();
      }
      // For 'all', we don't pass month/year to get all data
      
      const response = await axios.get('/api/export/csv', {
        params,
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${period === 'current' ? 'current-month' : 'all-time'}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

  const calculateTrends = () => {
    if (monthlyData.length < 2) return { income: 0, expenses: 0, savings: 0 };
    
    const current = monthlyData[monthlyData.length - 1];
    const previous = monthlyData[monthlyData.length - 2];
    
    const incomeTrend = previous.totalIncome > 0 
      ? ((current.totalIncome - previous.totalIncome) / previous.totalIncome) * 100 
      : 0;
    
    const expensesTrend = previous.totalExpenses > 0 
      ? ((current.totalExpenses - previous.totalExpenses) / previous.totalExpenses) * 100 
      : 0;
    
    const savingsTrend = previous.netAmount !== 0 
      ? ((current.netAmount - previous.netAmount) / Math.abs(previous.netAmount)) * 100 
      : 0;
    
    return { income: incomeTrend, expenses: expensesTrend, savings: savingsTrend };
  };

  const trends = calculateTrends();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const currentMonth = monthlyData[monthlyData.length - 1] || {};
  const totalIncome = monthlyData.reduce((sum, month) => sum + (month.totalIncome || 0), 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + (month.totalExpenses || 0), 0);
  const avgMonthlyIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0;
  const avgMonthlyExpenses = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
          </select>
          <div className="flex space-x-2">
            <button
              onClick={() => handleExport('current')}
              disabled={exportLoading}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Download size={20} />
              <span>Export Current Month</span>
            </button>
            <button
              onClick={() => handleExport('all')}
              disabled={exportLoading}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Download size={20} />
              <span>Export All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalIncome)}
              </p>
              <p className={`text-sm ${trends.income >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trends.income >= 0 ? '+' : ''}{trends.income.toFixed(1)}% from last month
              </p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalExpenses)}
              </p>
              <p className={`text-sm ${trends.expenses <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trends.expenses >= 0 ? '+' : ''}{trends.expenses.toFixed(1)}% from last month
              </p>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(avgMonthlyIncome)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Over {selectedPeriod === '6months' ? '6' : '12'} months
              </p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Monthly Expenses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(avgMonthlyExpenses)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Over {selectedPeriod === '6months' ? '6' : '12'} months
              </p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <PieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Income vs Expenses Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expenses Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
            <XAxis dataKey="month" className="dark:text-gray-300" />
            <YAxis tickFormatter={(value) => `$${value}`} className="dark:text-gray-300" />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line 
              type="monotone" 
              dataKey="totalIncome" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Income"
            />
            <Line 
              type="monotone" 
              dataKey="totalExpenses" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Net Worth Trend */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Net Amount Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
            <XAxis dataKey="month" className="dark:text-gray-300" />
            <YAxis tickFormatter={(value) => `$${value}`} className="dark:text-gray-300" />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Area 
              type="monotone" 
              dataKey="netAmount" 
              stroke="#3B82F6" 
              fill="#3B82F6"
              fillOpacity={0.3}
              name="Net Amount"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Income
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Savings Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {monthlyData.map((month, index) => {
                const savingsRate = month.totalIncome > 0 ? (month.netAmount / month.totalIncome) * 100 : 0;
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {month.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                      {formatCurrency(month.totalIncome || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                      {formatCurrency(month.totalExpenses || 0)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      (month.netAmount || 0) >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatCurrency(month.netAmount || 0)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      savingsRate >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {savingsRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;