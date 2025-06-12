// Free AI Financial Assistant - No external APIs required
// Uses intelligent rule-based responses and pattern matching

class FinancialAI {
  constructor() {
    this.name = "Cleo";
    this.personality = "friendly, helpful, and slightly sassy financial advisor";
    this.responses = this.initializeResponses();
    this.patterns = this.initializePatterns();
  }

  // Main AI chat function - Uses intelligent pattern matching
  async chat(message, userContext = {}) {
    const analysis = this.analyzeMessage(message);
    const response = this.generateResponse(analysis, userContext, message);
    
    return {
      response: response.text,
      type: response.type,
      suggestions: response.suggestions || [],
      action: response.action || null
    };
  }

  // Analyze user message for intent and entities
  analyzeMessage(message) {
    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(' ');
    
    const analysis = {
      intent: 'unknown',
      entities: {
        amount: null,
        category: null,
        timeframe: null,
        emotion: null
      },
      keywords: []
    };

    // Extract amount
    const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      analysis.entities.amount = parseFloat(amountMatch[1]);
    }

    // Detect intent
    for (const [intent, patterns] of Object.entries(this.patterns.intents)) {
      if (patterns.some(pattern => lowerMessage.includes(pattern))) {
        analysis.intent = intent;
        break;
      }
    }

    // Extract category
    for (const [category, keywords] of Object.entries(this.patterns.categories)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        analysis.entities.category = category;
        break;
      }
    }

    // Detect emotion/urgency
    for (const [emotion, words] of Object.entries(this.patterns.emotions)) {
      if (words.some(word => lowerMessage.includes(word))) {
        analysis.entities.emotion = emotion;
        break;
      }
    }

    // Extract timeframe
    for (const [timeframe, indicators] of Object.entries(this.patterns.timeframes)) {
      if (indicators.some(indicator => lowerMessage.includes(indicator))) {
        analysis.entities.timeframe = timeframe;
        break;
      }
    }

    return analysis;
  }

  // Generate intelligent response based on analysis and context
  generateResponse(analysis, userContext, originalMessage) {
    const { totalIncome = 0, totalExpenses = 0, topCategories = [], budgets = [], recentTransactions = [] } = userContext;
    const { intent, entities } = analysis;

    // Calculate key metrics
    const netAmount = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;
    const isOverspending = netAmount < 0;

    switch (intent) {
      case 'add_transaction':
        return this.handleAddTransaction(entities, originalMessage);
      
      case 'spending_analysis':
        return this.handleSpendingAnalysis(userContext, entities);
      
      case 'budget_help':
        return this.handleBudgetHelp(userContext, entities);
      
      case 'saving_advice':
        return this.handleSavingAdvice(userContext, entities);
      
      case 'category_inquiry':
        return this.handleCategoryInquiry(userContext, entities);
      
      case 'goal_setting':
        return this.handleGoalSetting(userContext, entities);
      
      case 'financial_health':
        return this.handleFinancialHealth(userContext);
      
      case 'greeting':
        return this.handleGreeting(userContext);
      
      default:
        return this.handleGeneral(originalMessage, userContext);
    }
  }

  // Handle adding transactions via natural language
  handleAddTransaction(entities, message) {
    if (entities.amount && entities.category) {
      return {
        text: `Got it! I'll add $${entities.amount} for ${entities.category} 📝 Want me to log this transaction for you?`,
        type: 'transaction_detected',
        action: {
          type: 'add_transaction',
          amount: entities.amount,
          category: entities.category,
          description: message
        },
        suggestions: ['Yes, add it!', 'No, cancel', 'Edit details first']
      };
    } else if (entities.amount) {
      return {
        text: `I see you spent $${entities.amount}! What category should I put this under? 🤔`,
        type: 'category_needed',
        suggestions: ['Groceries 🛒', 'Dining Out 🍽️', 'Entertainment 🎬', 'Shopping 🛍️', 'Other']
      };
    } else {
      return {
        text: `I can help you add expenses! Just say something like "I spent $25 on groceries" and I'll log it 💰`,
        type: 'transaction_help'
      };
    }
  }

  // Analyze spending patterns
  handleSpendingAnalysis(userContext, entities) {
    const { totalExpenses, topCategories, budgets } = userContext;
    
    if (totalExpenses === 0) {
      return {
        text: `You haven't logged any expenses yet! Start tracking your spending and I'll give you amazing insights 📊`,
        type: 'no_data'
      };
    }

    const topCategory = topCategories[0];
    let response = `Your biggest spending category is ${topCategory?.category || 'groceries'} at $${topCategory?.amount || 0} 📊 `;

    // Check if they're asking about specific timeframe
    if (entities.timeframe === 'week') {
      response += `That's about $${(topCategory?.amount / 4 || 0).toFixed(2)} per week. `;
    }

    // Add insights based on spending level
    if (totalExpenses > 3000) {
      response += `Wow, that's some serious spending! 😮 Maybe time to pump the brakes?`;
    } else if (totalExpenses > 2000) {
      response += `You're spending a decent amount. Let's see if we can optimize it! 💡`;
    } else {
      response += `Your spending looks pretty reasonable! Good job staying in control 👍`;
    }

    return {
      text: response,
      type: 'spending_analysis',
      suggestions: ['Show me budget tips', 'Analyze by category', 'Set spending goals']
    };
  }

  // Handle budget help requests
  handleBudgetHelp(userContext, entities) {
    const { totalIncome, totalExpenses, budgets } = userContext;
    const netAmount = totalIncome - totalExpenses;

    if (budgets.length === 0) {
      return {
        text: `Let's set up your first budget! 🎯 I recommend the 50/30/20 rule: 50% needs, 30% wants, 20% savings. With your $${totalIncome} income, that's $${(totalIncome * 0.5).toFixed(2)} for needs!`,
        type: 'budget_setup',
        suggestions: ['Set up budgets', 'Learn about 50/30/20', 'Custom budget plan']
      };
    }

    if (netAmount < 0) {
      return {
        text: `Uh oh! You're overspending by $${Math.abs(netAmount).toFixed(2)} this month 😬 Time for a budget intervention! Let me help you cut back.`,
        type: 'budget_warning',
        suggestions: ['Find areas to cut', 'Emergency budget plan', 'Track daily spending']
      };
    } else {
      return {
        text: `Great news! You have $${netAmount.toFixed(2)} left in your budget 💰 Want to allocate it wisely or save it?`,
        type: 'budget_positive',
        suggestions: ['Save the extra', 'Plan fun spending', 'Invest it']
      };
    }
  }

  // Handle saving advice
  handleSavingAdvice(userContext, entities) {
    const { totalIncome, totalExpenses } = userContext;
    const netAmount = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;

    let response = '';
    if (savingsRate >= 20) {
      response = `Amazing! You're saving ${savingsRate.toFixed(1)}% of your income 🌟 You're a savings superstar!`;
    } else if (savingsRate >= 10) {
      response = `Good job! Saving ${savingsRate.toFixed(1)}% is solid 👍 Let's aim for 20% if possible!`;
    } else if (savingsRate > 0) {
      response = `You're saving ${savingsRate.toFixed(1)}%, which is a start! 💪 Let's find ways to boost that number.`;
    } else {
      response = `Time to start saving! 🚨 Even $50/month adds up to $600/year. Every dollar counts!`;
    }

    return {
      text: response,
      type: 'saving_advice',
      suggestions: ['Automatic savings tips', 'Find money to save', 'Set savings goals']
    };
  }

  // Handle category-specific inquiries
  handleCategoryInquiry(userContext, entities) {
    const { topCategories } = userContext;
    const category = entities.category;
    
    const categoryData = topCategories.find(cat => 
      cat.category.toLowerCase().includes(category) || 
      category.includes(cat.category.toLowerCase())
    );

    if (categoryData) {
      return {
        text: `You've spent $${categoryData.amount} on ${categoryData.category} this month! 📊 Want tips on how to reduce this?`,
        type: 'category_analysis',
        suggestions: [`Reduce ${categoryData.category} spending`, 'Set category budget', 'Find alternatives']
      };
    } else {
      return {
        text: `I don't see much spending on ${category} yet. Start tracking and I'll give you insights! 📈`,
        type: 'no_category_data'
      };
    }
  }

  // Handle goal setting
  handleGoalSetting(userContext, entities) {
    const responses = [
      `Setting financial goals is smart! 🎯 What are you saving for? Emergency fund, vacation, house down payment?`,
      `I love goal-setters! 💪 Tell me your target amount and timeline, and I'll create a savings plan.`,
      `Goals give your money purpose! ✨ Whether it's $1,000 or $10,000, I'll help you get there.`
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      type: 'goal_setting',
      suggestions: ['Emergency fund plan', 'Vacation savings', 'Custom goal', 'House down payment']
    };
  }

  // Handle financial health check
  handleFinancialHealth(userContext) {
    const { totalIncome, totalExpenses, budgets } = userContext;
    const netAmount = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;

    let score = 0;
    let feedback = [];

    // Calculate financial health score
    if (savingsRate >= 20) score += 40;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate > 0) score += 10;

    if (budgets.length >= 3) score += 30;
    else if (budgets.length > 0) score += 15;

    if (totalExpenses < totalIncome * 0.8) score += 30;
    else if (totalExpenses < totalIncome) score += 15;

    // Generate feedback
    if (score >= 80) {
      feedback.push("🌟 Excellent financial health!");
    } else if (score >= 60) {
      feedback.push("👍 Good financial habits!");
    } else if (score >= 40) {
      feedback.push("⚠️ Room for improvement");
    } else {
      feedback.push("🚨 Time for a financial makeover!");
    }

    return {
      text: `Your financial health score: ${score}/100! ${feedback[0]} ${score < 60 ? "Want me to help you improve?" : "Keep up the great work!"}`,
      type: 'health_check',
      suggestions: score < 60 ? ['Improve my score', 'Set up budgets', 'Savings plan'] : ['Maintain habits', 'Advanced tips', 'Investment advice']
    };
  }

  // Handle greetings
  handleGreeting(userContext) {
    const greetings = [
      `Hey there! 👋 I'm Cleo, your AI money buddy. Ready to make your finances fabulous?`,
      `Hi! 💰 I'm here to help you master your money. What's on your financial mind today?`,
      `Hello! ✨ Let's talk money! I can help with spending analysis, budgets, or saving tips.`
    ];

    const { totalIncome, totalExpenses } = userContext;
    let contextualGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    if (totalIncome > 0) {
      contextualGreeting += ` I see you've been tracking your finances - love it! 📊`;
    }

    return {
      text: contextualGreeting,
      type: 'greeting',
      suggestions: ['Check my spending', 'Set up budgets', 'Savings advice', 'Financial health check']
    };
  }

  // Handle general queries
  handleGeneral(message, userContext) {
    const generalResponses = [
      `Interesting question! 🤔 I'm here to help with your finances. Want to check your spending or set up budgets?`,
      `I'm focused on making your money work better! 💪 How can I help with your finances today?`,
      `Let's talk money! 💰 I can analyze spending, suggest budgets, or give saving tips. What interests you?`
    ];

    return {
      text: generalResponses[Math.floor(Math.random() * generalResponses.length)],
      type: 'general',
      suggestions: ['Analyze my spending', 'Budget help', 'Saving tips', 'Financial goals']
    };
  }

  // Initialize response patterns and keywords
  initializePatterns() {
    return {
      intents: {
        add_transaction: ['spent', 'bought', 'paid', 'purchased', 'cost', 'add expense', 'log transaction'],
        spending_analysis: ['spending', 'analyze', 'breakdown', 'where did', 'how much', 'categories'],
        budget_help: ['budget', 'overspending', 'how much left', 'monthly limit', 'afford'],
        saving_advice: ['save', 'savings', 'put aside', 'money left', 'extra money'],
        category_inquiry: ['groceries', 'food', 'entertainment', 'utilities', 'gas', 'shopping'],
        goal_setting: ['goal', 'target', 'save for', 'saving for', 'plan for'],
        financial_health: ['how am i doing', 'financial health', 'money situation', 'overall'],
        greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'what can you do']
      },
      categories: {
        'Groceries': ['grocery', 'groceries', 'food', 'supermarket', 'walmart', 'target', 'whole foods'],
        'Dining Out': ['restaurant', 'food', 'lunch', 'dinner', 'takeout', 'pizza', 'coffee', 'starbucks'],
        'Entertainment': ['movie', 'netflix', 'spotify', 'games', 'concert', 'entertainment'],
        'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'car'],
        'Utilities': ['electric', 'electricity', 'water', 'internet', 'phone', 'cable'],
        'Shopping': ['amazon', 'clothes', 'shopping', 'bought', 'store'],
        'Healthcare': ['doctor', 'pharmacy', 'medicine', 'dental', 'health']
      },
      emotions: {
        worried: ['worried', 'concerned', 'stressed', 'anxious', 'help'],
        excited: ['excited', 'happy', 'great', 'awesome', 'amazing'],
        confused: ['confused', 'don\'t understand', 'how does', 'what is'],
        urgent: ['urgent', 'now', 'immediately', 'asap', 'quickly']
      },
      timeframes: {
        today: ['today', 'this morning', 'this afternoon'],
        week: ['this week', 'weekly', 'per week'],
        month: ['this month', 'monthly', 'per month'],
        year: ['this year', 'annually', 'per year']
      }
    };
  }

  initializeResponses() {
    return {
      encouragement: [
        "You're doing great! 🌟",
        "Keep up the good work! 💪",
        "I'm proud of your progress! 🎉",
        "You've got this! 💯"
      ],
      warnings: [
        "Hold up! ⚠️",
        "Red alert! 🚨",
        "Time to slow down! 🛑",
        "Uh oh! 😬"
      ]
    };
  }

  // Analyze spending patterns for insights
  analyzeSpending(transactions, budgets) {
    const insights = [];
    
    // Calculate category spending
    const categorySpending = {};
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const category = transaction.category_name || 'Uncategorized';
        categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
      }
    });
    
    // Find top spending categories
    const topCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));
    
    // Budget analysis
    budgets.forEach(budget => {
      const spent = categorySpending[budget.category_name] || 0;
      const percentage = (spent / budget.monthly_limit) * 100;
      
      if (percentage > 100) {
        insights.push({
          type: 'warning',
          message: `You're over budget on ${budget.category_name} by $${(spent - budget.monthly_limit).toFixed(2)} 🚨`,
          category: budget.category_name,
          severity: 'high'
        });
      } else if (percentage > 80) {
        insights.push({
          type: 'alert',
          message: `You're at ${percentage.toFixed(0)}% of your ${budget.category_name} budget. Slow down! 🟡`,
          category: budget.category_name,
          severity: 'medium'
        });
      } else if (percentage < 50) {
        insights.push({
          type: 'positive',
          message: `Great job staying under budget on ${budget.category_name}! 🎉`,
          category: budget.category_name,
          severity: 'low'
        });
      }
    });
    
    return {
      topCategories,
      insights,
      totalSpent: Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0),
      categoryBreakdown: categorySpending
    };
  }

  // Parse natural language transactions
  parseTransaction(message) {
    const analysis = this.analyzeMessage(message);
    
    if (analysis.entities.amount) {
      return {
        amount: analysis.entities.amount,
        category: analysis.entities.category,
        description: message.length > 50 ? message.substring(0, 50) + '...' : message,
        confidence: analysis.entities.category ? 0.9 : 0.6,
        type: 'expense' // Default to expense, could be enhanced to detect income
      };
    }
    
    return null;
  }

  // Generate budget recommendations based on income
  generateBudgetRecommendations(income, currentSpending = {}) {
    const recommendations = [];
    
    // 50/30/20 rule
    recommendations.push({
      type: 'rule',
      title: '50/30/20 Budget Rule 📊',
      description: 'A balanced approach to budgeting',
      allocations: {
        needs: { amount: income * 0.5, percentage: 50, description: 'Rent, groceries, utilities' },
        wants: { amount: income * 0.3, percentage: 30, description: 'Entertainment, dining out' },
        savings: { amount: income * 0.2, percentage: 20, description: 'Emergency fund, investments' }
      }
    });
    
    // Category-specific recommendations
    const categoryRecommendations = [
      { name: 'Groceries', percentage: 12, emoji: '🛒', tips: 'Meal prep and shopping lists help!' },
      { name: 'Utilities', percentage: 8, emoji: '⚡', tips: 'LED bulbs and smart thermostats save money' },
      { name: 'Entertainment', percentage: 5, emoji: '🎬', tips: 'Mix free activities with paid ones' },
      { name: 'Dining Out', percentage: 7, emoji: '🍽️', tips: 'Try cooking at home more often' },
      { name: 'Transportation', percentage: 15, emoji: '🚗', tips: 'Consider carpooling or public transit' },
      { name: 'Shopping', percentage: 5, emoji: '🛍️', tips: 'Wait 24 hours before non-essential purchases' }
    ];
    
    categoryRecommendations.forEach(category => {
      const suggested = income * (category.percentage / 100);
      const current = currentSpending[category.name] || 0;
      const status = current > suggested ? 'over' : current > suggested * 0.8 ? 'close' : 'good';
      
      recommendations.push({
        type: 'category',
        category: category.name,
        suggested: suggested,
        current: current,
        percentage: category.percentage,
        emoji: category.emoji,
        tips: category.tips,
        status: status
      });
    });
    
    return recommendations;
  }
}

module.exports = { FinancialAI };