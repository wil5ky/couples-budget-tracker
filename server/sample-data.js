const db = require('./database');
const { createUser } = require('./auth');

async function createSampleData() {
  console.log('Creating sample data...');

  try {
    // Create sample users
    console.log('Creating sample users...');
    const user1 = await createUser('willnamayi', 'password123', 'Will Namayi');
    const user2 = await createUser('megnamayi', 'password123', 'Meg Namayi');
    
    console.log('Sample users created:', user1.username, 'and', user2.username);

    // Create sample transactions
    console.log('Creating sample transactions...');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Get category IDs
    const categories = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM categories', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const groceriesCategory = categories.find(c => c.name === 'Groceries');
    const salaryCategory = categories.find(c => c.name === 'Salary');
    const utilitiesCategory = categories.find(c => c.name === 'Utilities');
    const entertainmentCategory = categories.find(c => c.name === 'Entertainment');
    const diningCategory = categories.find(c => c.name === 'Dining Out');

    const sampleTransactions = [
      // Income
      {
        user_id: user1.id,
        type: 'income',
        category_id: salaryCategory?.id,
        amount: 4500.00,
        description: 'Monthly Salary',
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
        notes: 'Will\'s monthly salary'
      },
      {
        user_id: user2.id,
        type: 'income',
        category_id: salaryCategory?.id,
        amount: 3800.00,
        description: 'Monthly Salary',
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
        notes: 'Meg\'s monthly salary'
      },
      
      // Expenses
      {
        user_id: user1.id,
        type: 'expense',
        category_id: groceriesCategory?.id,
        amount: 145.67,
        description: 'Weekly grocery shopping',
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-03`,
        notes: 'Whole Foods - organic produce and essentials'
      },
      {
        user_id: user2.id,
        type: 'expense',
        category_id: utilitiesCategory?.id,
        amount: 89.45,
        description: 'Electricity bill',
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-05`,
        notes: 'Monthly electricity bill'
      },
      {
        user_id: user1.id,
        type: 'expense',
        category_id: diningCategory?.id,
        amount: 67.89,
        description: 'Date night dinner',
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-07`,
        notes: 'Italian restaurant downtown'
      },
      {
        user_id: user2.id,
        type: 'expense',
        category_id: groceriesCategory?.id,
        amount: 234.12,
        description: 'Monthly grocery run',
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-10`,
        notes: 'Costco bulk shopping'
      },
      {
        user_id: user1.id,
        type: 'expense',
        category_id: entertainmentCategory?.id,
        amount: 45.00,
        description: 'Movie tickets',
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-12`,
        notes: 'Latest Marvel movie'
      },
      {
        user_id: user2.id,
        type: 'expense',
        category_id: utilitiesCategory?.id,
        amount: 156.78,
        description: 'Internet and cable',
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-15`,
        notes: 'Monthly internet and cable bundle'
      },
      {
        user_id: user1.id,
        type: 'expense',
        category_id: groceriesCategory?.id,
        amount: 98.45,
        description: 'Fresh produce',
        date: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-17`,
        notes: 'Farmer\'s market - organic vegetables'
      }
    ];

    // Insert sample transactions
    for (const transaction of sampleTransactions) {
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO transactions (user_id, type, category_id, amount, description, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [transaction.user_id, transaction.type, transaction.category_id, transaction.amount, transaction.description, transaction.date, transaction.notes],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
    }

    // Create sample budgets
    console.log('Creating sample budgets...');
    const monthYear = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
    
    const sampleBudgets = [
      {
        category_id: groceriesCategory?.id,
        monthly_limit: 600.00,
        month_year: monthYear
      },
      {
        category_id: utilitiesCategory?.id,
        monthly_limit: 300.00,
        month_year: monthYear
      },
      {
        category_id: entertainmentCategory?.id,
        monthly_limit: 200.00,
        month_year: monthYear
      },
      {
        category_id: diningCategory?.id,
        monthly_limit: 400.00,
        month_year: monthYear
      }
    ];

    for (const budget of sampleBudgets) {
      if (budget.category_id) {
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT OR REPLACE INTO budgets (category_id, monthly_limit, month_year) VALUES (?, ?, ?)',
            [budget.category_id, budget.monthly_limit, budget.month_year],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
      }
    }

    console.log('Sample data created successfully!');
    console.log('\nSample users:');
    console.log('Username: willnamayi, Password: password123, Display Name: Will Namayi');
    console.log('Username: megnamayi, Password: password123, Display Name: Meg Namayi');
    console.log('\nYou can now log in with either account to see the sample data.');
    
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  createSampleData().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Failed to create sample data:', error);
    process.exit(1);
  });
}

module.exports = { createSampleData };