require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const { authMiddleware, createUser, authenticateUser } = require('./auth');
const { FinancialAI } = require('./ai-service');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize AI assistant
const ai = new FinancialAI();

app.use(cors());
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, displayName } = req.body;
    
    console.log('Registration attempt:', { username, displayName });
    
    if (!username || !password || !displayName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await createUser(username, password, displayName);
    console.log('User created successfully:', user.username);
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await authenticateUser(username, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Categories routes
app.get('/api/categories', authMiddleware, (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', (err, categories) => {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else {
      res.json(categories);
    }
  });
});

// Transactions routes
app.get('/api/transactions', authMiddleware, (req, res) => {
  const { month, year, type } = req.query;
  let query = `
    SELECT t.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
           u.display_name as user_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (month && year) {
    query += ` AND strftime('%Y-%m', t.date) = ?`;
    params.push(`${year}-${month.padStart(2, '0')}`);
  }

  if (type) {
    query += ` AND t.type = ?`;
    params.push(type);
  }

  query += ` ORDER BY t.date DESC, t.created_at DESC`;

  db.all(query, params, (err, transactions) => {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else {
      res.json(transactions);
    }
  });
});

app.post('/api/transactions', authMiddleware, (req, res) => {
  const { type, category_id, amount, description, date, notes } = req.body;
  const user_id = req.user.id;

  if (!type || !amount || !date) {
    return res.status(400).json({ error: 'Type, amount, and date are required' });
  }

  db.run(
    'INSERT INTO transactions (user_id, type, category_id, amount, description, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [user_id, type, category_id, amount, description, date, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Server error' });
      } else {
        res.status(201).json({ 
          id: this.lastID,
          message: 'Transaction created successfully'
        });
      }
    }
  );
});

app.put('/api/transactions/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { type, category_id, amount, description, date, notes } = req.body;

  db.run(
    'UPDATE transactions SET type = ?, category_id = ?, amount = ?, description = ?, date = ?, notes = ? WHERE id = ?',
    [type, category_id, amount, description, date, notes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Server error' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Transaction not found' });
      } else {
        res.json({ message: 'Transaction updated successfully' });
      }
    }
  );
});

app.delete('/api/transactions/:id', authMiddleware, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM transactions WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Transaction not found' });
    } else {
      res.json({ message: 'Transaction deleted successfully' });
    }
  });
});

// Budget routes
app.get('/api/budgets', authMiddleware, (req, res) => {
  const { month, year } = req.query;
  const monthYear = `${year}-${month.padStart(2, '0')}`;

  const query = `
    SELECT b.*, c.name as category_name, c.color as category_color, c.icon as category_icon,
           COALESCE(spent.amount, 0) as spent_amount
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN (
      SELECT category_id, SUM(amount) as amount
      FROM transactions
      WHERE type = 'expense' AND strftime('%Y-%m', date) = ?
      GROUP BY category_id
    ) spent ON b.category_id = spent.category_id
    WHERE b.month_year = ?
  `;

  db.all(query, [monthYear, monthYear], (err, budgets) => {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else {
      res.json(budgets);
    }
  });
});

app.post('/api/budgets', authMiddleware, (req, res) => {
  const { category_id, monthly_limit, month_year } = req.body;

  if (!category_id || !monthly_limit || !month_year) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run(
    'INSERT OR REPLACE INTO budgets (category_id, monthly_limit, month_year) VALUES (?, ?, ?)',
    [category_id, monthly_limit, month_year],
    function(err) {
      if (err) {
        res.status(500).json({ error: 'Server error' });
      } else {
        res.status(201).json({ 
          id: this.lastID,
          message: 'Budget created/updated successfully'
        });
      }
    }
  );
});

// Dashboard stats
app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  const { month, year } = req.query;
  const monthYear = `${year}-${month.padStart(2, '0')}`;

  const statsQuery = `
    SELECT 
      t.type,
      c.name as category_name,
      c.color as category_color,
      c.icon as category_icon,
      SUM(t.amount) as total_amount,
      COUNT(t.id) as transaction_count,
      u.display_name as user_name,
      t.user_id
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE strftime('%Y-%m', t.date) = ?
    GROUP BY t.type, t.category_id, t.user_id
    ORDER BY total_amount DESC
  `;

  const summaryQuery = `
    SELECT 
      type,
      SUM(amount) as total
    FROM transactions
    WHERE strftime('%Y-%m', date) = ?
    GROUP BY type
  `;

  db.all(statsQuery, [monthYear], (err, detailStats) => {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else {
      db.all(summaryQuery, [monthYear], (err, summaryStats) => {
        if (err) {
          res.status(500).json({ error: 'Server error' });
        } else {
          const totalIncome = summaryStats.find(s => s.type === 'income')?.total || 0;
          const totalExpenses = summaryStats.find(s => s.type === 'expense')?.total || 0;
          
          res.json({
            totalIncome,
            totalExpenses,
            netAmount: totalIncome - totalExpenses,
            detailStats
          });
        }
      });
    }
  });
});

// Export data
app.get('/api/export/csv', authMiddleware, (req, res) => {
  const { month, year } = req.query;
  let query = `
    SELECT t.*, c.name as category_name, u.display_name as user_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    LEFT JOIN users u ON t.user_id = u.id
  `;
  const params = [];

  if (month && year) {
    query += ` WHERE strftime('%Y-%m', t.date) = ?`;
    params.push(`${year}-${month.padStart(2, '0')}`);
  }

  query += ` ORDER BY t.date DESC`;

  db.all(query, params, (err, transactions) => {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else {
      const csvHeader = 'Date,Type,Category,Amount,Description,User,Notes\n';
      const csvData = transactions.map(t => 
        `${t.date},${t.type},${t.category_name || ''},${t.amount},"${t.description || ''}",${t.user_name},"${t.notes || ''}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csvHeader + csvData);
    }
  });
});

// AI Assistant routes
app.post('/api/ai/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user's financial context for AI
    const userContext = await getUserFinancialContext(userId);
    
    // Get AI response
    const aiResponse = await ai.chat(message, userContext);
    
    res.json(aiResponse);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'AI service error' });
  }
});

app.post('/api/ai/parse-transaction', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const parsedTransaction = ai.parseTransaction(message);
    
    if (parsedTransaction) {
      // Map category name to category ID
      const categories = await new Promise((resolve, reject) => {
        db.all('SELECT * FROM categories', (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      const category = categories.find(cat => 
        cat.name.toLowerCase() === parsedTransaction.category?.toLowerCase()
      );

      if (category) {
        parsedTransaction.category_id = category.id;
      }

      res.json(parsedTransaction);
    } else {
      res.json({ error: 'Could not parse transaction from message' });
    }
  } catch (error) {
    console.error('Transaction parsing error:', error);
    res.status(500).json({ error: 'Parsing service error' });
  }
});

app.get('/api/ai/insights', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    
    // Get user's transactions and budgets
    const monthYear = month && year ? `${year}-${month.padStart(2, '0')}` : null;
    
    const transactions = await new Promise((resolve, reject) => {
      let query = `
        SELECT t.*, c.name as category_name, c.color as category_color
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = ? OR t.user_id IN (SELECT id FROM users)
      `;
      const params = [];
      
      if (monthYear) {
        query += ` AND strftime('%Y-%m', t.date) = ?`;
        params.push(monthYear);
      }
      
      query += ` ORDER BY t.date DESC`;
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const budgets = await new Promise((resolve, reject) => {
      let query = `
        SELECT b.*, c.name as category_name
        FROM budgets b
        LEFT JOIN categories c ON b.category_id = c.id
      `;
      const params = [];
      
      if (monthYear) {
        query += ` WHERE b.month_year = ?`;
        params.push(monthYear);
      }
      
      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const insights = ai.analyzeSpending(transactions, budgets);
    res.json(insights);
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Insights service error' });
  }
});

app.get('/api/ai/budget-recommendations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const userContext = await getUserFinancialContext(userId);
    
    const recommendations = ai.generateBudgetRecommendations(
      userContext.totalIncome,
      userContext.categorySpending
    );
    
    res.json(recommendations);
  } catch (error) {
    console.error('Budget recommendations error:', error);
    res.status(500).json({ error: 'Recommendations service error' });
  }
});

// Helper function to get user's financial context
async function getUserFinancialContext(userId) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

  // Get current month's transactions
  const transactions = await new Promise((resolve, reject) => {
    db.all(`
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE strftime('%Y-%m', t.date) = ?
      ORDER BY t.date DESC
    `, [monthYear], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Get current month's budgets
  const budgets = await new Promise((resolve, reject) => {
    db.all(`
      SELECT b.*, c.name as category_name
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.month_year = ?
    `, [monthYear], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get top categories
  const categorySpending = {};
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      const category = transaction.category_name || 'Uncategorized';
      categorySpending[category] = (categorySpending[category] || 0) + transaction.amount;
    }
  });

  const topCategories = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));

  return {
    totalIncome,
    totalExpenses,
    topCategories,
    budgets,
    recentTransactions: transactions.slice(0, 10),
    categorySpending
  };
}

// Catch-all handler for React Router in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});