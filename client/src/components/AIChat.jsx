import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, Sparkles, TrendingUp, Target, Plus } from 'lucide-react';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hey! 👋 I'm Cleo, your AI financial assistant. I can help you track spending, set budgets, analyze your finances, and give personalized advice. What would you like to know about your money?",
      timestamp: new Date(),
      suggestions: ['Check my spending', 'Set up budgets', 'Savings advice', 'Financial health check']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/ai/chat', { message });
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        timestamp: new Date(),
        suggestions: response.data.suggestions || [],
        action: response.data.action || null
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "Sorry, I'm having trouble connecting right now. Please try again! 😅",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleActionClick = async (action) => {
    if (action.type === 'add_transaction') {
      // Handle adding transaction
      try {
        const categoryResponse = await axios.get('/api/categories');
        const categories = categoryResponse.data;
        const category = categories.find(cat => 
          cat.name.toLowerCase().includes(action.category.toLowerCase())
        );

        if (category) {
          const transactionData = {
            type: 'expense',
            category_id: category.id,
            amount: action.amount,
            description: action.description,
            date: new Date().toISOString().split('T')[0],
            notes: 'Added via AI assistant'
          };

          await axios.post('/api/transactions', transactionData);
          
          const confirmMessage = {
            id: Date.now(),
            type: 'ai',
            content: `Perfect! I've added $${action.amount} for ${action.category} to your transactions! 🎉`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, confirmMessage]);
        }
      } catch (error) {
        console.error('Error adding transaction:', error);
      }
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-full">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Cleo AI Assistant</h2>
            <p className="text-sm opacity-90">Your personal finance buddy</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles size={20} className="animate-pulse" />
          <span className="text-sm font-medium">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}>
                {message.type === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Message Content */}
              <div className={`flex flex-col space-y-2 ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-primary-500 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(message.timestamp)}
                </span>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {message.action && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleActionClick(message.action)}
                      className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>Add Transaction</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-2xl rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2 mb-3">
          <button
            onClick={() => sendMessage("How am I doing financially?")}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
          >
            <TrendingUp size={16} />
            <span>Financial Health</span>
          </button>
          <button
            onClick={() => sendMessage("Analyze my spending")}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors text-sm"
          >
            <Sparkles size={16} />
            <span>Spending Analysis</span>
          </button>
          <button
            onClick={() => sendMessage("Help me budget")}
            className="flex items-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm"
          >
            <Target size={16} />
            <span>Budget Help</span>
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about your finances... (e.g., 'I spent $25 on groceries')"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !inputMessage.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Try: "I spent $50 on groceries" or "How much can I save this month?"
        </p>
      </div>
    </div>
  );
};

export default AIChat;