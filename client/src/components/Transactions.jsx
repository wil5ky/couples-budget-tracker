import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Filter, Calendar, X, DollarSign, FileText, Tag, Clock, User, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { Card, Button, Badge } from './ui';

const TransactionModal = ({ isOpen, onClose, transaction, categories, onSave }) => {
  const [formData, setFormData] = useState({
    type: 'expense',
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type,
        category_id: transaction.category_id || '',
        amount: transaction.amount.toString(),
        description: transaction.description || '',
        date: transaction.date,
        notes: transaction.notes || ''
      });
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id || null
      };

      if (transaction) {
        await axios.put(`/api/transactions/${transaction.id}`, data);
      } else {
        await axios.post('/api/transactions', data);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <Card className="w-full max-w-lg p-8 animate-scale-in shadow-hard" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl text-white ${
              transaction ? 'bg-primary-500' : 'bg-success-500'
            }`}>
              {transaction ? <Edit size={20} /> : <Plus size={20} />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {transaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {transaction ? 'Update your transaction details' : 'Record a new income or expense'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<X size={20} />}
            onClick={onClose}
            className="hover:bg-neutral-100 dark:hover:bg-neutral-700"
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                formData.type === 'expense'
                  ? 'border-danger-500 bg-danger-50 dark:bg-danger-900/20 text-danger-700 dark:text-danger-300'
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
              }`}
            >
              <TrendingDown size={20} />
              <span className="font-medium">Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income' })}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                formData.type === 'income'
                  ? 'border-success-500 bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-300'
                  : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
              }`}
            >
              <TrendingUp size={20} />
              <span className="font-medium">Income</span>
            </button>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              <Tag size={16} />
              <span>Category</span>
            </label>
            <div className="relative">
              <Tag size={20} className="absolute left-3 top-3 text-neutral-400" />
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              <DollarSign size={16} />
              <span>Amount</span>
            </label>
            <div className="relative">
              <DollarSign size={20} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              <FileText size={16} />
              <span>Description</span>
            </label>
            <div className="relative">
              <FileText size={20} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="What was this transaction for?"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              <Calendar size={16} />
              <span>Date</span>
            </label>
            <div className="relative">
              <Calendar size={20} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full pl-11 pr-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              <FileText size={16} />
              <span>Notes (Optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
              rows="3"
              placeholder="Any additional details about this transaction..."
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              icon={transaction ? <CheckCircle size={20} /> : <Plus size={20} />}
              className="flex-1"
            >
              {transaction ? 'Update Transaction' : 'Create Transaction'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onClose}
              disabled={isSubmitting}
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

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filter, setFilter] = useState({
    type: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    search: ''
  });
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [filter.month, filter.year, filter.type]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        month: filter.month,
        year: filter.year
      };
      if (filter.type) params.type = filter.type;

      const response = await axios.get('/api/transactions', { params });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`/api/transactions/${id}`);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleModalSave = () => {
    fetchTransactions();
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);

  const filteredTransactions = transactions.filter(transaction => {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return (
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.category_name?.toLowerCase().includes(searchLower) ||
        transaction.notes?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Transaction History
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Track and manage all your financial transactions
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
          
          <Button
            variant="primary"
            size="lg"
            icon={<Plus size={20} />}
            onClick={handleAdd}
            className="shadow-soft hover:shadow-medium"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-primary-500 rounded-xl text-white">
            <Filter size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Filter Transactions
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Search and filter your transaction history
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Search size={14} />
              <span>Search</span>
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="pl-10 w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Search transactions..."
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Tag size={14} />
              <span>Type</span>
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Types</option>
              <option value="income">💰 Income</option>
              <option value="expense">💸 Expense</option>
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Calendar size={14} />
              <span>Month</span>
            </label>
            <select
              value={filter.month}
              onChange={(e) => setFilter({ ...filter, month: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {format(new Date(2023, i), 'MMMM')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              <Clock size={14} />
              <span>Year</span>
            </label>
            <select
              value={filter.year}
              onChange={(e) => setFilter({ ...filter, year: parseInt(e.target.value) })}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {filteredTransactions.length}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600 dark:text-success-400">
              {filteredTransactions.filter(t => t.type === 'income').length}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Income</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-danger-600 dark:text-danger-400">
              {filteredTransactions.filter(t => t.type === 'expense').length}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Expenses</p>
          </div>
        </div>
      </Card>

      {/* Enhanced Transactions List */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-12">
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4">
                  <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center">
              <AlertCircle size={48} className="text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              No transactions found
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              {filter.search || filter.type ? 
                'Try adjusting your filters to see more results.' :
                'Start by adding your first transaction to track your finances.'
              }
            </p>
            <Button
              variant="primary"
              size="lg"
              icon={<Plus size={20} />}
              onClick={handleAdd}
            >
              Add First Transaction
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredTransactions.map((transaction, index) => (
              <div 
                key={transaction.id} 
                className={`group relative p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-all duration-200 hover:scale-[1.01] ${
                  index === 0 ? 'rounded-t-2xl' : ''
                } ${
                  index === filteredTransactions.length - 1 ? 'rounded-b-2xl' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Transaction Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                      transaction.type === 'income' 
                        ? 'bg-gradient-to-br from-success-500 to-success-600 shadow-success-glow' 
                        : 'bg-gradient-to-br from-danger-500 to-danger-600 shadow-danger-glow'
                    }`}>
                      {transaction.category_icon || (transaction.type === 'income' ? '💰' : '💸')}
                    </div>
                    
                    {/* Transaction Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {transaction.description || 'Transaction'}
                        </h4>
                        <Badge variant={transaction.type === 'income' ? 'income' : 'expense'} size="sm">
                          {transaction.type === 'income' ? 'Income' : 'Expense'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Tag size={14} />
                          <span>{transaction.category_name || 'Uncategorized'}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <User size={14} />
                          <span>{transaction.user_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Amount and Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        transaction.type === 'income' 
                          ? 'text-success-600 dark:text-success-400'
                          : 'text-danger-600 dark:text-danger-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {balanceVisible ? formatCurrency(transaction.amount) : '••••••'}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit size={16} />}
                        onClick={() => handleEdit(transaction)}
                        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash2 size={16} />}
                        onClick={() => handleDelete(transaction.id)}
                        className="text-danger-600 hover:text-danger-700 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Notes if available */}
                {transaction.notes && (
                  <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                      "{transaction.notes}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        transaction={editingTransaction}
        categories={categories}
        onSave={handleModalSave}
      />
    </div>
  );
};

export default Transactions;