import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar, 
  Bot, 
  Sparkles, 
  AlertTriangle,
  Award,
  Eye,
  EyeOff,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Shield,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, Button, Badge, ProgressBar, MetricCard } from './ui';

const DashboardPremium = () => {
  const [stats, setStats] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchAIInsights();
    generateAchievements();
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

  const fetchAIInsights = async () => {
    try {
      const response = await axios.get('/api/ai/insights', {
        params: { month: currentMonth, year: currentYear }
      });
      setAiInsights(response.data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  };

  const generateAchievements = () => {
    // Gamification: Generate achievements based on user behavior
    const userAchievements = [];
    
    if (stats?.netAmount > 0) {
      userAchievements.push({
        id: 'positive_balance',
        title: 'In the Green!',
        description: 'Spending less than you earn',
        icon: '🎯',
        color: 'success',
        progress: 100
      });
    }
    
    if (stats?.totalExpenses < 2000) {
      userAchievements.push({
        id: 'mindful_spender',
        title: 'Mindful Spender',
        description: 'Keeping expenses reasonable',
        icon: '🧘',
        color: 'primary',
        progress: 100
      });
    }

    setAchievements(userAchievements);
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
    
    return expenseData.sort((a, b) => b.value - a.value).slice(0, 6);
  };

  const getFinancialHealthScore = () => {
    if (!stats) return 0;
    
    const { totalIncome, totalExpenses } = stats;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    let score = 0;
    if (savingsRate >= 20) score += 40;
    else if (savingsRate >= 10) score += 25;
    else if (savingsRate > 0) score += 15;
    
    if (totalExpenses < totalIncome * 0.8) score += 30;
    else if (totalExpenses < totalIncome) score += 20;
    
    score += Math.min(30, (aiInsights?.insights?.filter(i => i.type === 'positive').length || 0) * 10);
    
    return Math.min(100, score);
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-2xl" />
        ))}
      </div>
    );
  }

  const expenseData = prepareExpenseData();
  const netAmount = stats?.netAmount || 0;
  const isPositive = netAmount >= 0;
  const healthScore = getFinancialHealthScore();
  const healthColor = getHealthColor(healthScore);

  // Trend calculations
  const savingsRate = stats?.totalIncome > 0 ? (netAmount / stats.totalIncome) * 100 : 0;
  const previousSavingsRate = 12; // Mock previous month data
  const savingsTrend = savingsRate > previousSavingsRate ? 'up' : 'down';
  const savingsTrendValue = Math.abs(savingsRate - previousSavingsRate);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Balance Toggle */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Financial Overview
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')}
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
              value={`${currentYear}-${currentMonth.toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                setCurrentYear(parseInt(year));
                setCurrentMonth(parseInt(month));
              }}
              className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
      </div>

      {/* Financial Health Score */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-primary-500 rounded-2xl text-white">
              <Shield size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                Financial Health Score
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Based on your spending habits and savings
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {healthScore}/100
            </div>
            <Badge variant={healthColor} size="lg">
              {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
        </div>
        
        <div className="mt-6">
          <ProgressBar 
            value={healthScore} 
            max={100} 
            variant={healthColor}
            size="lg"
            animated
            glow
          />
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Income"
          value={stats?.totalIncome || 0}
          subtitle="This month"
          icon={TrendingUp}
          variant="income"
          currency
          large
          trend="up"
          trendValue={8.5}
          className="hover:shadow-success-glow"
        />

        <MetricCard
          title="Total Expenses"
          value={balanceVisible ? stats?.totalExpenses || 0 : '••••••'}
          subtitle="This month"
          icon={TrendingDown}
          variant="expense"
          currency={balanceVisible}
          large
          trend="down"
          trendValue={3.2}
        />

        <MetricCard
          title="Net Amount"
          value={balanceVisible ? netAmount : '••••••'}
          subtitle={isPositive ? "Great job!" : "Let's improve this"}
          icon={DollarSign}
          variant={isPositive ? 'success' : 'danger'}
          currency={balanceVisible}
          large
          onClick={() => window.location.href = '/ai-chat'}
          className={isPositive ? 'hover:shadow-success-glow' : 'hover:shadow-danger-glow'}
        />

        <MetricCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          subtitle="Of total income"
          icon={Target}
          variant={savingsRate >= 20 ? 'success' : savingsRate >= 10 ? 'warning' : 'danger'}
          large
          trend={savingsTrend}
          trendValue={savingsTrendValue}
        />
      </div>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <Card className="bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20 border-warning-200 dark:border-warning-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-warning-500 rounded-xl text-white">
              <Award size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Recent Achievements
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                You're building great financial habits!
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center space-x-3 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700"
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {achievement.description}
                  </p>
                </div>
                <Badge variant={achievement.color} size="sm">
                  <Star size={12} className="mr-1" />
                  Complete
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Insights - Enhanced */}
      {aiInsights && aiInsights.insights && aiInsights.insights.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center">
                  <Sparkles size={20} className="mr-2 text-purple-500" />
                  AI Financial Insights
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Personalized analysis from Cleo
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              icon={<Zap size={16} />}
              onClick={() => window.location.href = '/ai-chat'}
              className="border-purple-300 text-purple-600 hover:bg-purple-500 hover:text-white"
            >
              Chat with Cleo
            </Button>
          </div>
          
          <div className="grid gap-4">
            {aiInsights.insights.slice(0, 3).map((insight, index) => (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-200 hover:scale-[1.02] ${
                  insight.severity === 'high' 
                    ? 'bg-gradient-to-r from-danger-50 to-danger-100 dark:from-danger-900/30 dark:to-danger-800/30 border border-danger-200 dark:border-danger-700'
                    : insight.severity === 'medium'
                    ? 'bg-gradient-to-r from-warning-50 to-warning-100 dark:from-warning-900/30 dark:to-warning-800/30 border border-warning-200 dark:border-warning-700'
                    : 'bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/30 dark:to-success-800/30 border border-success-200 dark:border-success-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {insight.severity === 'high' && (
                      <div className="p-2 bg-danger-500 rounded-lg text-white">
                        <AlertTriangle size={16} />
                      </div>
                    )}
                    {insight.severity === 'medium' && (
                      <div className="p-2 bg-warning-500 rounded-lg text-white">
                        <AlertTriangle size={16} />
                      </div>
                    )}
                    {insight.severity === 'low' && (
                      <div className="p-2 bg-success-500 rounded-lg text-white">
                        <Target size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      insight.severity === 'high' 
                        ? 'text-danger-800 dark:text-danger-200'
                        : insight.severity === 'medium'
                        ? 'text-warning-800 dark:text-warning-200'
                        : 'text-success-800 dark:text-success-200'
                    }`}>
                      {insight.message}
                    </p>
                    {insight.category && (
                      <Badge 
                        variant={insight.severity === 'high' ? 'danger' : insight.severity === 'medium' ? 'warning' : 'success'}
                        size="sm"
                        className="mt-2"
                      >
                        {insight.category}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Expense Breakdown */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Spending Breakdown
            </h3>
            <Badge variant="primary" size="sm">
              Top 6 Categories
            </Badge>
          </div>
          
          {expenseData.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value, !balanceVisible)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {expenseData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {formatCurrency(item.value, !balanceVisible)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-neutral-500 dark:text-neutral-400">
              <Target size={48} className="mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No expenses yet</p>
              <p className="text-sm text-center">Start tracking your spending to see insights</p>
              <Button 
                variant="primary" 
                size="sm" 
                className="mt-4"
                icon={<Plus size={16} />}
                onClick={() => window.location.href = '/transactions'}
              >
                Add First Expense
              </Button>
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-8">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Quick Actions
          </h3>
          
          <div className="grid gap-4">
            <Button
              variant="primary"
              size="lg"
              icon={<Plus size={20} />}
              onClick={() => window.location.href = '/transactions'}
              className="justify-start p-6 h-auto"
            >
              <div className="text-left">
                <div className="font-semibold">Add Transaction</div>
                <div className="text-sm opacity-90">Record income or expense</div>
              </div>
              <ArrowUpRight size={20} className="ml-auto" />
            </Button>
            
            <Button
              variant="secondary"
              size="lg"
              icon={<Target size={20} />}
              onClick={() => window.location.href = '/budget'}
              className="justify-start p-6 h-auto"
            >
              <div className="text-left">
                <div className="font-semibold">Set Budget</div>
                <div className="text-sm opacity-75">Create spending limits</div>
              </div>
              <ArrowUpRight size={20} className="ml-auto" />
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              icon={<Bot size={20} />}
              onClick={() => window.location.href = '/ai-chat'}
              className="justify-start p-6 h-auto border-2 border-dashed border-purple-300 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            >
              <div className="text-left">
                <div className="font-semibold">Ask Cleo AI</div>
                <div className="text-sm opacity-75">Get financial advice</div>
              </div>
              <Sparkles size={20} className="ml-auto text-purple-500" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
            Recent Activity
          </h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/transactions'}
          >
            View All
          </Button>
        </div>
        
        {stats?.detailStats?.length > 0 ? (
          <div className="space-y-4">
            {stats.detailStats.slice(0, 5).map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: item.category_color || '#6B7280' }}
                  >
                    {item.category_icon || item.category_name?.[0] || 'T'}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {item.category_name || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {item.user_name} • {item.transaction_count} transaction{item.transaction_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold ${
                    item.type === 'income' 
                      ? 'text-success-600 dark:text-success-400' 
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}>
                    {item.type === 'income' ? '+' : ''}
                    {formatCurrency(item.total_amount, !balanceVisible)}
                  </p>
                  <Badge 
                    variant={item.type === 'income' ? 'success' : 'expense'} 
                    size="sm"
                  >
                    {item.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
            <Target size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No activity yet</p>
            <p className="text-sm">Your transactions will appear here</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardPremium;