const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/budget.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Transactions table
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      category_id INTEGER,
      amount DECIMAL(10,2) NOT NULL,
      description TEXT,
      date DATE NOT NULL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )`);

    // Budgets table
    db.run(`CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      monthly_limit DECIMAL(10,2) NOT NULL,
      month_year TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category_id, month_year),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )`);

    // Insert default categories
    const defaultCategories = [
      { name: 'Groceries', color: '#10B981', icon: '🛒' },
      { name: 'Utilities', color: '#3B82F6', icon: '⚡' },
      { name: 'Entertainment', color: '#8B5CF6', icon: '🎬' },
      { name: 'Transportation', color: '#F59E0B', icon: '🚗' },
      { name: 'Healthcare', color: '#EF4444', icon: '🏥' },
      { name: 'Dining Out', color: '#F97316', icon: '🍽️' },
      { name: 'Shopping', color: '#EC4899', icon: '🛍️' },
      { name: 'Salary', color: '#059669', icon: '💰' },
      { name: 'Freelance', color: '#0D9488', icon: '💼' },
      { name: 'Other Income', color: '#7C3AED', icon: '💵' }
    ];

    const stmt = db.prepare('INSERT OR IGNORE INTO categories (name, color, icon) VALUES (?, ?, ?)');
    defaultCategories.forEach(category => {
      stmt.run(category.name, category.color, category.icon);
    });
    stmt.finalize();
  });
}

module.exports = db;