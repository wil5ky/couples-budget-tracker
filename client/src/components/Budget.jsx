import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Calendar, 
  Award,
  Shield,
  Star,
  Zap,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, Button, Badge, ProgressBar, MetricCard } from './ui';

const BudgetModal = ({ isOpen, onClose, budget, categories, monthYear, onSave }) => {
  const [formData, setFormData] = useState({
    category_id: '',
    monthly_limit: ''
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        category_id: budget.category_id.toString(),
        monthly_limit: budget.monthly_limit.toString()
      });
    } else {
      setFormData({
        category_id: '',
        monthly_limit: ''
      });
    }
  }, [budget]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        category_id: parseInt(formData.category_id),
        monthly_limit: parseFloat(formData.monthly_limit),
        month_year: monthYear
      };

      await axios.post('/api/budgets', data);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  if (!isOpen) return null;

  const availableCategories = categories.filter(cat => 
    !budget || cat.id === budget.category_id
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-md bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-hard">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
            <Target className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              {budget ? 'Edit Budget' : 'Set Budget'}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {budget ? 'Update your spending limit' : 'Create a spending limit'}
            </p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              required
              disabled={!!budget}
            >
              <option value="">Select a category</option>
              {availableCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Monthly Budget Limit
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={formData.monthly_limit}
                onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                className="w-full px-4 py-3 pl-8 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="0.00"
                required
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">$</span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              icon={budget ? <Edit size={18} /> : <Plus size={18} />}
            >
              {budget ? 'Update Budget' : 'Create Budget'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [achievements, setAchievements] = useState([]);

  const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (budgets.length > 0) {
      generateAchievements();
    }
  }, [budgets]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/budgets', {
        params: { month: currentMonth, year: currentYear }
      });
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingBudget(null);
  };

  const handleModalSave = () => {
    fetchBudgets();
  };

  const generateAchievements = () => {
    const userAchievements = [];
    
    // Calculate budget statistics
    const budgetsWithProgress = budgets.map(budget => ({
      ...budget,
      percentage: budget.monthly_limit > 0 ? (budget.spent_amount / budget.monthly_limit) * 100 : 0
    }));
    
    const underBudgetCount = budgetsWithProgress.filter(b => b.percentage <= 100).length;
    const wellManagedCount = budgetsWithProgress.filter(b => b.percentage <= 80).length;
    const totalBudgets = budgets.length;
    
    // Achievement: Budget Master
    if (underBudgetCount === totalBudgets && totalBudgets > 0) {
      userAchievements.push({
        id: 'budget_master',
        title: 'Budget Master!',
        description: 'All categories within budget',
        icon: '🎯',
        color: 'success',
        progress: 100
      });
    }
    
    // Achievement: Mindful Spender
    if (wellManagedCount >= totalBudgets * 0.8 && totalBudgets > 0) {
      userAchievements.push({
        id: 'mindful_spender',
        title: 'Mindful Spender',
        description: 'Great spending discipline',
        icon: '🧘',
        color: 'primary',
        progress: 100
      });
    }
    
    // Achievement: Budget Planner
    if (totalBudgets >= 3) {
      userAchievements.push({
        id: 'budget_planner',
        title: 'Budget Planner',
        description: 'Multiple budgets set up',
        icon: '📊',
        color: 'warning',
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

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAlertLevel = (percentage) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'success';
  };

  const getBudgetHealthScore = () => {
    if (budgets.length === 0) return 0;
    
    let score = 0;
    const totalBudgets = budgets.length;
    
    // Calculate category performance
    const budgetsWithProgress = budgets.map(budget => ({
      ...budget,
      percentage: budget.monthly_limit > 0 ? (budget.spent_amount / budget.monthly_limit) * 100 : 0
    }));
    
    const underBudgetCount = budgetsWithProgress.filter(b => b.percentage <= 100).length;
    const wellManagedCount = budgetsWithProgress.filter(b => b.percentage <= 80).length;
    const veryWellManagedCount = budgetsWithProgress.filter(b => b.percentage <= 60).length;
    
    // Score based on budget adherence
    score += (underBudgetCount / totalBudgets) * 40; // 40 points for staying under budget
    score += (wellManagedCount / totalBudgets) * 30; // 30 points for staying well under budget
    score += (veryWellManagedCount / totalBudgets) * 20; // 20 points for excellent management
    
    // Bonus for having multiple budgets set up
    if (totalBudgets >= 3) score += 10;
    
    return Math.min(100, Math.round(score));
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent_amount, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const healthScore = getBudgetHealthScore();
  const healthColor = getHealthColor(healthScore);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Balance Toggle */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Budget Planning
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            {format(new Date(currentYear, currentMonth - 1), 'MMMM yyyy')} • Manage your spending limits
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
          
          <Button
            variant="primary"
            size="md"
            icon={<Plus size={20} />}
            onClick={handleAdd}
            className="shadow-soft hover:shadow-medium"
          >
            Set Budget
          </Button>
        </div>
      </div>

      {/* Budget Health Score */}
      <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-primary-200 dark:border-primary-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-primary-500 rounded-2xl text-white">
              <Shield size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                Budget Health Score
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Based on your spending discipline and budget adherence
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
            showValue
          />
        </div>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Budget"
          value={balanceVisible ? totalBudget : '••••••'}
          subtitle="Monthly allocation"
          icon={Target}
          variant="primary"
          currency={balanceVisible}
          large
          className="hover:shadow-primary-glow"
        />

        <MetricCard
          title="Total Spent"
          value={balanceVisible ? totalSpent : '••••••'}
          subtitle="This month"
          icon={TrendingDown}
          variant="expense"
          currency={balanceVisible}
          large
          trend="up"
          trendValue={12.5}
        />

        <MetricCard
          title="Remaining"
          value={balanceVisible ? totalRemaining : '••••••'}
          subtitle={totalRemaining >= 0 ? "Budget left" : "Over budget"}
          icon={totalRemaining >= 0 ? TrendingUp : TrendingDown}
          variant={totalRemaining >= 0 ? 'success' : 'danger'}
          currency={balanceVisible}
          large
          className={totalRemaining >= 0 ? 'hover:shadow-success-glow' : 'hover:shadow-danger-glow'}
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
                Budget Achievements
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                You're building excellent financial habits!
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center space-x-3 p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:shadow-soft transition-all duration-200 hover:scale-[1.02]"
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

      {/* Overall Progress */}
      {totalBudget > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Overall Budget Progress</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total spending across all categories</p>
            </div>
            <Badge 
              variant={overallProgress >= 100 ? 'danger' : overallProgress >= 80 ? 'warning' : 'success'}
              size="md"
            >
              {overallProgress.toFixed(1)}% Used
            </Badge>
          </div>
          
          <ProgressBar 
            value={overallProgress} 
            max={100} 
            variant="smart"
            size="lg"
            animated
            showValue
          />
          
          <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400 mt-3">
            <span>{formatCurrency(totalSpent, !balanceVisible)} spent</span>
            <span>{formatCurrency(totalBudget, !balanceVisible)} budgeted</span>
          </div>
        </Card>
      )}

      {/* Budget Categories */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Category Budgets</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Track spending limits for each category
            </p>
          </div>
          <Badge variant="primary" size="md">
            {budgets.length} Categories
          </Badge>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading budgets...</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-6 bg-neutral-50 dark:bg-neutral-700/50 rounded-2xl inline-block mb-6">
              <Target size={48} className="text-neutral-300 dark:text-neutral-600" />
            </div>
            <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              No budgets set for this month
            </h4>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Start by setting spending limits for your categories
            </p>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus size={20} />}
              onClick={handleAdd}
            >
              Set Your First Budget
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {budgets.map((budget) => {
              const spentPercentage = budget.monthly_limit > 0 ? (budget.spent_amount / budget.monthly_limit) * 100 : 0;
              const alertLevel = getAlertLevel(spentPercentage);
              const remaining = budget.monthly_limit - budget.spent_amount;
              
              return (
                <div 
                  key={budget.id} 
                  className="group p-6 bg-neutral-50 dark:bg-neutral-700/50 rounded-2xl border border-neutral-200 dark:border-neutral-600 hover:shadow-soft transition-all duration-200 hover:scale-[1.01]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-soft"
                        style={{ backgroundColor: budget.category_color }}
                      >
                        {budget.category_icon || budget.category_name?.[0] || 'B'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
                          {budget.category_name}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {formatCurrency(budget.spent_amount, !balanceVisible)} of {formatCurrency(budget.monthly_limit, !balanceVisible)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {alertLevel === 'danger' && (
                        <div className="p-2 bg-danger-100 dark:bg-danger-900/30 rounded-lg">
                          <AlertTriangle size={16} className="text-danger-600 dark:text-danger-400" />
                        </div>
                      )}
                      {alertLevel === 'warning' && (
                        <div className="p-2 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                          <AlertTriangle size={16} className="text-warning-600 dark:text-warning-400" />
                        </div>
                      )}
                      
                      <Badge 
                        variant={remaining >= 0 ? 'success' : 'danger'} 
                        size="md"
                      >
                        {remaining >= 0 
                          ? `${formatCurrency(remaining, !balanceVisible)} left` 
                          : `Over by ${formatCurrency(Math.abs(remaining), !balanceVisible)}`
                        }
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={16} />}
                        onClick={() => handleEdit(budget)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <ProgressBar 
                      value={spentPercentage} 
                      max={100} 
                      variant="smart"
                      size="md"
                      animated
                    />
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {spentPercentage.toFixed(1)}% used
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {Math.max(0, 100 - spentPercentage).toFixed(1)}% remaining
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        budget={editingBudget}
        categories={categories.filter(cat => 
          !budgets.find(b => b.category_id === cat.id) || (editingBudget && editingBudget.category_id === cat.id)
        )}
        monthYear={monthYear}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default Budget;