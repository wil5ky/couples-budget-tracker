import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, AlertTriangle, TrendingUp, Target, Calendar } from 'lucide-react';
import { format } from 'date-fns';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {budget ? 'Edit Budget' : 'Set Budget'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monthly Budget Limit
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.monthly_limit}
              onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
            >
              {budget ? 'Update' : 'Create'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
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

  const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

  useEffect(() => {
    fetchCategories();
    fetchBudgets();
  }, [currentMonth, currentYear]);

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

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

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

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthly_limit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent_amount, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Planning</h1>
        <div className="flex items-center space-x-4">
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
          <button
            onClick={handleAdd}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${totalRemaining >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <TrendingUp className={`w-6 h-6 ${totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(totalRemaining)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      {totalBudget > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Overall Budget Progress</h3>
            <span className={`text-sm font-medium ${
              overallProgress >= 100 ? 'text-red-600 dark:text-red-400' :
              overallProgress >= 80 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${getProgressColor(overallProgress)}`}
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
            <span>{formatCurrency(totalSpent)} spent</span>
            <span>{formatCurrency(totalBudget)} budgeted</span>
          </div>
        </div>
      )}

      {/* Budget Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Budgets</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Target size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>No budgets set for this month</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Set your first budget
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {budgets.map((budget) => {
              const spentPercentage = budget.monthly_limit > 0 ? (budget.spent_amount / budget.monthly_limit) * 100 : 0;
              const alertLevel = getAlertLevel(spentPercentage);
              const remaining = budget.monthly_limit - budget.spent_amount;
              
              return (
                <div key={budget.id} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: budget.category_color }}
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          {budget.category_icon && <span className="mr-2">{budget.category_icon}</span>}
                          {budget.category_name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(budget.spent_amount)} of {formatCurrency(budget.monthly_limit)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {alertLevel === 'danger' && (
                        <AlertTriangle size={20} className="text-red-500" />
                      )}
                      {alertLevel === 'warning' && (
                        <AlertTriangle size={20} className="text-yellow-500" />
                      )}
                      <span className={`text-sm font-medium ${
                        remaining >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {remaining >= 0 ? formatCurrency(remaining) : `Over by ${formatCurrency(Math.abs(remaining))}`}
                      </span>
                      <button
                        onClick={() => handleEdit(budget)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(spentPercentage)}`}
                      style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{spentPercentage.toFixed(1)}% used</span>
                    <span>{Math.max(0, 100 - spentPercentage).toFixed(1)}% remaining</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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