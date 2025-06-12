import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Eye,
  EyeOff,
  Sparkles,
  Target,
  AlertTriangle,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Database
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Card, Button, Badge, ProgressBar, MetricCard } from './ui';

const Reports = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [insights, setInsights] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchMonthlyData();
    generateInsights();
    generateAchievements();
  }, [selectedPeriod, monthlyData]);

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

  const formatCurrency = (amount, hideValue = false) => {
    if (hideValue) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const generateInsights = () => {
    if (!monthlyData.length) return;
    
    const newInsights = [];
    const current = monthlyData[monthlyData.length - 1] || {};
    const previous = monthlyData[monthlyData.length - 2] || {};
    
    // Spending trend insight
    if (previous.totalExpenses && current.totalExpenses < previous.totalExpenses) {
      newInsights.push({
        id: 'spending_down',
        type: 'positive',
        title: 'Great Progress!',
        message: `You've reduced spending by ${formatCurrency(previous.totalExpenses - current.totalExpenses)} this month.`,
        icon: TrendingDown,
        color: 'success'
      });
    }
    
    // Income growth insight
    if (previous.totalIncome && current.totalIncome > previous.totalIncome) {
      newInsights.push({
        id: 'income_up',
        type: 'positive',
        title: 'Income Growth',
        message: `Your income increased by ${formatCurrency(current.totalIncome - previous.totalIncome)} this month.`,
        icon: TrendingUp,
        color: 'success'
      });
    }
    
    // Savings rate insight
    const savingsRate = current.totalIncome > 0 ? (current.netAmount / current.totalIncome) * 100 : 0;
    if (savingsRate >= 20) {
      newInsights.push({
        id: 'great_saver',
        type: 'achievement',
        title: 'Excellent Saver!',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`,
        icon: Award,
        color: 'success'
      });
    } else if (savingsRate < 0) {
      newInsights.push({
        id: 'overspending',
        type: 'warning',
        title: 'Spending Alert',
        message: 'Your expenses exceed your income this month. Consider reviewing your budget.',
        icon: AlertTriangle,
        color: 'warning'
      });
    }
    
    setInsights(newInsights);
  };

  const generateAchievements = () => {
    if (!monthlyData.length) return;
    
    const newAchievements = [];
    const current = monthlyData[monthlyData.length - 1] || {};
    
    if (current.netAmount > 0) {
      newAchievements.push({
        id: 'positive_balance',
        title: 'In the Green!',
        description: 'Positive cash flow this month',
        progress: 100,
        color: 'success'
      });
    }
    
    const consecutivePositive = monthlyData.slice(-3).every(month => month.netAmount > 0);
    if (consecutivePositive && monthlyData.length >= 3) {
      newAchievements.push({
        id: 'streak',
        title: 'Winning Streak',
        description: '3 months of positive cash flow',
        progress: 100,
        color: 'primary'
      });
    }
    
    setAchievements(newAchievements);
  };

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
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-64" />
          <div className="flex space-x-4">
            <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-32" />
            <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-40" />
            <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded-lg w-40" />
          </div>
        </div>
        
        {/* Loading skeleton for metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-2xl" />
          ))}
        </div>
        
        {/* Loading skeleton for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-neutral-200 dark:bg-neutral-700 rounded-2xl" />
          <div className="h-80 bg-neutral-200 dark:bg-neutral-700 rounded-2xl" />
        </div>
        
        <div className="h-96 bg-neutral-200 dark:bg-neutral-700 rounded-2xl" />
      </div>
    );
  }

  const currentMonth = monthlyData[monthlyData.length - 1] || {};
  const totalIncome = monthlyData.reduce((sum, month) => sum + (month.totalIncome || 0), 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + (month.totalExpenses || 0), 0);
  const avgMonthlyIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0;
  const avgMonthlyExpenses = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0;

  const getFinancialHealthScore = () => {
    if (monthlyData.length === 0) return 0;
    
    const current = monthlyData[monthlyData.length - 1] || {};
    const { totalIncome, totalExpenses } = current;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    let score = 0;
    if (savingsRate >= 20) score += 40;
    else if (savingsRate >= 10) score += 25;
    else if (savingsRate > 0) score += 15;
    
    if (totalExpenses < totalIncome * 0.8) score += 30;
    else if (totalExpenses < totalIncome) score += 20;
    
    score += Math.min(30, insights.filter(i => i.type === 'positive').length * 10);
    
    return Math.min(100, score);
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const healthScore = getFinancialHealthScore();
  const healthColor = getHealthColor(healthScore);

  // Empty state
  if (!loading && monthlyData.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Reports & Analytics
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Get insights into your financial patterns
            </p>
          </div>
        </div>
        
        <Card className="text-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <div className="p-6 bg-neutral-100 dark:bg-neutral-700 rounded-full">
              <BarChart3 size={48} className="text-neutral-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                No Data Available
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
                Start by adding some transactions to see detailed reports and analytics about your financial patterns.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Privacy Toggle */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Reports & Analytics
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Comprehensive insights into your financial patterns
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={balanceVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            onClick={() => setBalanceVisible(!balanceVisible)}
          >
            {balanceVisible ? 'Hide' : 'Show'} Amounts
          </Button>
          
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-neutral-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
            >
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="primary"
              size="md"
              loading={exportLoading}
              icon={<FileText size={16} />}
              onClick={() => handleExport('current')}
            >
              Current Month
            </Button>
            <Button
              variant="secondary"
              size="md"
              loading={exportLoading}
              icon={<Database size={16} />}
              onClick={() => handleExport('all')}
            >
              All Data
            </Button>
          </div>
        </div>
      </div>

      {/* Financial Health Score */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
              Financial Health Score
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Based on savings rate, spending patterns, and consistency
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="text-primary-500" size={20} />
            <Badge variant={healthColor} size="lg">
              {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Attention'}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2">
            <ProgressBar 
              value={healthScore} 
              max={100} 
              variant={healthColor}
              size="lg"
              animated
              glow
              showValue
              className="mb-2"
            />
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Score: {healthScore}/100 - {healthScore >= 80 ? 'Keep up the excellent work!' : healthScore >= 60 ? 'Good progress, room for improvement' : 'Focus on building better habits'}
            </p>
          </div>
          
          {achievements.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Recent Achievements</p>
              {achievements.slice(0, 2).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-2">
                  <Award size={16} className={`text-${achievement.color}-500`} />
                  <span className="text-xs text-neutral-600 dark:text-neutral-400">{achievement.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Income"
          value={balanceVisible ? totalIncome : 0}
          currency
          icon={TrendingUp}
          variant="income"
          trend={trends.income >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(trends.income).toFixed(1)}
          subtitle={`Over ${selectedPeriod === '6months' ? '6' : '12'} months`}
          className="hover:scale-105 transition-transform duration-200"
        />
        
        <MetricCard
          title="Total Expenses"
          value={balanceVisible ? totalExpenses : 0}
          currency
          icon={TrendingDown}
          variant="expense"
          trend={trends.expenses <= 0 ? 'up' : 'down'}
          trendValue={Math.abs(trends.expenses).toFixed(1)}
          subtitle={`Over ${selectedPeriod === '6months' ? '6' : '12'} months`}
          className="hover:scale-105 transition-transform duration-200"
        />
        
        <MetricCard
          title="Avg Monthly Income"
          value={balanceVisible ? avgMonthlyIncome : 0}
          currency
          icon={BarChart3}
          variant="default"
          subtitle={`Over ${selectedPeriod === '6months' ? '6' : '12'} months`}
          className="hover:scale-105 transition-transform duration-200"
        />
        
        <MetricCard
          title="Avg Monthly Expenses"
          value={balanceVisible ? avgMonthlyExpenses : 0}
          currency
          icon={PieChart}
          variant="default"
          subtitle={`Over ${selectedPeriod === '6months' ? '6' : '12'} months`}
          className="hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* AI Insights Section */}
      {insights.length > 0 && (
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
              <Sparkles className="text-primary-600 dark:text-primary-400" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Smart Insights
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                AI-powered analysis of your financial patterns
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight) => {
              const IconComponent = insight.icon;
              return (
                <div key={insight.id} className={`p-4 rounded-xl border-2 ${
                  insight.color === 'success' ? 'border-success-200 bg-success-50 dark:border-success-700 dark:bg-success-900/20' :
                  insight.color === 'warning' ? 'border-warning-200 bg-warning-50 dark:border-warning-700 dark:bg-warning-900/20' :
                  'border-primary-200 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      insight.color === 'success' ? 'bg-success-100 dark:bg-success-900/30' :
                      insight.color === 'warning' ? 'bg-warning-100 dark:bg-warning-900/30' :
                      'bg-primary-100 dark:bg-primary-900/30'
                    }`}>
                      <IconComponent size={16} className={`${
                        insight.color === 'success' ? 'text-success-600 dark:text-success-400' :
                        insight.color === 'warning' ? 'text-warning-600 dark:text-warning-400' :
                        'text-primary-600 dark:text-primary-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Income vs Expenses
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Monthly comparison over time
              </p>
            </div>
            <Badge variant="primary" size="sm">
              {selectedPeriod === '6months' ? '6M' : '12M'}
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-neutral-600" />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280" 
                className="dark:stroke-neutral-400" 
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => balanceVisible ? `$${(value/1000).toFixed(0)}k` : '••••'} 
                stroke="#6B7280" 
                className="dark:stroke-neutral-400" 
                fontSize={12}
              />
              <Tooltip 
                formatter={(value, name) => [
                  balanceVisible ? formatCurrency(value) : '••••••', 
                  name
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="totalIncome" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Income"
                dot={{ fill: '#10B981', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="totalExpenses" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Expenses"
                dot={{ fill: '#F59E0B', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Net Amount Trend
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Your financial progress over time
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {monthlyData.length > 0 && (
                <Badge 
                  variant={monthlyData[monthlyData.length - 1]?.netAmount >= 0 ? 'success' : 'danger'} 
                  size="sm"
                >
                  {monthlyData[monthlyData.length - 1]?.netAmount >= 0 ? 'Positive' : 'Negative'}
                </Badge>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-neutral-600" />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280" 
                className="dark:stroke-neutral-400" 
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => balanceVisible ? `$${(value/1000).toFixed(0)}k` : '••••'} 
                stroke="#6B7280" 
                className="dark:stroke-neutral-400" 
                fontSize={12}
              />
              <Tooltip 
                formatter={(value) => [balanceVisible ? formatCurrency(value) : '••••••', 'Net Amount']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="netAmount" 
                stroke="#3B82F6" 
                fill="url(#netAmountGradient)"
                strokeWidth={3}
                name="Net Amount"
              />
              <defs>
                <linearGradient id="netAmountGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Enhanced Monthly Breakdown */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Monthly Breakdown
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Detailed view of your financial performance
            </p>
          </div>
          <Badge variant="default" size="sm">
            {monthlyData.length} Months
          </Badge>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Income
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Savings Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
              {monthlyData.map((month, index) => {
                const savingsRate = month.totalIncome > 0 ? (month.netAmount / month.totalIncome) * 100 : 0;
                const isPositive = (month.netAmount || 0) >= 0;
                const performance = savingsRate >= 20 ? 'excellent' : savingsRate >= 10 ? 'good' : savingsRate >= 0 ? 'fair' : 'poor';
                
                return (
                  <tr key={index} className="group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all duration-200">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {month.month}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <ArrowUpRight size={16} className="text-success-500" />
                        <span className="font-medium text-success-600 dark:text-success-400">
                          {formatCurrency(month.totalIncome || 0, !balanceVisible)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <ArrowDownRight size={16} className="text-amber-500" />
                        <span className="font-medium text-amber-600 dark:text-amber-400">
                          {formatCurrency(month.totalExpenses || 0, !balanceVisible)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          isPositive ? 'bg-success-500' : 'bg-danger-500'
                        }`} />
                        <span className={`font-semibold ${
                          isPositive 
                            ? 'text-success-600 dark:text-success-400' 
                            : 'text-danger-600 dark:text-danger-400'
                        }`}>
                          {formatCurrency(month.netAmount || 0, !balanceVisible)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <span className={`font-medium ${
                          savingsRate >= 20 ? 'text-success-600 dark:text-success-400' :
                          savingsRate >= 10 ? 'text-primary-600 dark:text-primary-400' :
                          savingsRate >= 0 ? 'text-warning-600 dark:text-warning-400' :
                          'text-danger-600 dark:text-danger-400'
                        }`}>
                          {balanceVisible ? `${savingsRate.toFixed(1)}%` : '•••'}
                        </span>
                        <ProgressBar 
                          value={Math.max(0, savingsRate)} 
                          max={30} 
                          variant={savingsRate >= 20 ? 'success' : savingsRate >= 10 ? 'primary' : savingsRate >= 0 ? 'warning' : 'danger'}
                          size="sm"
                          className="w-16"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge 
                        variant={
                          performance === 'excellent' ? 'success' :
                          performance === 'good' ? 'primary' :
                          performance === 'fair' ? 'warning' : 'danger'
                        } 
                        size="sm"
                      >
                        {performance === 'excellent' ? 'Excellent' :
                         performance === 'good' ? 'Good' :
                         performance === 'fair' ? 'Fair' : 'Poor'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Summary Footer */}
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Average Savings Rate</p>
              <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                {balanceVisible ? 
                  `${(monthlyData.reduce((sum, month) => {
                    const rate = month.totalIncome > 0 ? (month.netAmount / month.totalIncome) * 100 : 0;
                    return sum + rate;
                  }, 0) / Math.max(monthlyData.length, 1)).toFixed(1)}%` : '•••'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Best Month</p>
              <p className="text-lg font-semibold text-success-600 dark:text-success-400">
                {monthlyData.length > 0 ? 
                  monthlyData.reduce((best, current) => 
                    (current.netAmount || 0) > (best.netAmount || 0) ? current : best
                  ).month : 'N/A'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Positive Months</p>
              <p className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                {monthlyData.filter(month => (month.netAmount || 0) > 0).length} / {monthlyData.length}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;