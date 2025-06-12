# Couple's Budget Tracker

A modern, responsive web application for couples to track their shared finances. Built with React, Express, and SQLite.

## Features

- **User Management**: Simple authentication system for two users
- **Income & Expense Tracking**: Add, edit, and delete transactions with categories
- **Budget Planning**: Set monthly budget limits with visual progress bars
- **Dashboard**: Overview with charts showing spending breakdown and trends
- **Reports**: Monthly analytics with data export functionality
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Recharts (for data visualization)
- Lucide React (icons)
- Axios (HTTP client)
- React Router DOM
- Date-fns (date utilities)

### Backend
- Node.js
- Express.js
- SQLite3
- bcrypt (password hashing)
- JSON Web Tokens (authentication)
- CORS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd budget-app
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   The server `.env` file is already configured with default values:
   ```
   PORT=5000
   JWT_SECRET=your-secret-key-change-in-production
   NODE_ENV=development
   ```
   
   For production, change the `JWT_SECRET` to a secure random string.

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server will run on http://localhost:5000

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   Client will run on http://localhost:5173

3. **Access the application**
   Open your browser and go to http://localhost:5173

### First Time Setup

1. **Use Demo Accounts** (Easiest way to explore)
   - **Username**: `willnamayi`, **Password**: `password123`
   - **Username**: `megnamayi`, **Password**: `password123`
   - Both accounts have shared financial data with sample transactions

2. **Or Create Your Own Accounts**
   - Click "Sign up" on the login page
   - Create accounts for both partners
   - Add your own income and expense transactions
   - Set budget limits for different categories

## Database

The application uses SQLite with the following tables:
- `users` - User accounts and authentication
- `categories` - Expense/income categories with colors and icons
- `transactions` - All financial transactions
- `budgets` - Monthly budget limits by category

The database file (`budget.db`) is automatically created in the `database/` directory when you first run the server.

## Default Categories

The app comes with pre-configured categories:
- **Expenses**: Groceries 🛒, Utilities ⚡, Entertainment 🎬, Transportation 🚗, Healthcare 🏥, Dining Out 🍽️, Shopping 🛍️
- **Income**: Salary 💰, Freelance 💼, Other Income 💵

## API Endpoints

### Authentication
- `POST /api/register` - Create new user account
- `POST /api/login` - User login

### Transactions
- `GET /api/transactions` - Get transactions (with filters)
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get budget data for a month
- `POST /api/budgets` - Create/update budget limit

### Categories
- `GET /api/categories` - Get all categories

### Dashboard & Reports
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/export/csv` - Export transactions as CSV

## Deployment

### Railway Deployment (Recommended)

**Quick Deploy to Railway:**
1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/budget-tracker.git
   git push -u origin main
   ```

2. **Deploy on Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub
   - Click "Deploy from GitHub repo"
   - Select your budget-tracker repository
   - Railway auto-builds and deploys!

3. **Set Environment Variables** in Railway dashboard:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-production-key
   ```

4. **Access your app** at the Railway-provided URL!

**Alternative Options:**
- **Vercel + Railway**: Frontend on Vercel, backend on Railway
- **Render**: Similar to Railway with good SQLite support

## Development

### Project Structure
```
budget-app/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts (auth, theme)
│   │   └── main.jsx     # Entry point
│   ├── public/
│   └── package.json
├── server/          # Express backend
│   ├── server.js    # Main server file
│   ├── database.js  # Database setup and schema
│   ├── auth.js      # Authentication logic
│   └── package.json
├── database/        # SQLite database file
└── README.md
```

### Adding New Features

1. **New API Endpoints**: Add routes in `server/server.js`
2. **Database Changes**: Modify schema in `server/database.js`
3. **Frontend Components**: Add React components in `client/src/components/`
4. **Styling**: Use Tailwind CSS classes, extend theme in `tailwind.config.js`

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- CORS is configured for development
- For production, update JWT_SECRET and enable HTTPS

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section below
2. Create an issue in the repository
3. Review the code comments for implementation details

## Troubleshooting

**Database Connection Issues**
- Ensure the `database/` directory exists
- Check file permissions
- Restart the server

**Frontend Build Issues**
- Clear node_modules and reinstall dependencies
- Check for version conflicts
- Ensure all peer dependencies are installed

**Authentication Problems**
- Clear browser localStorage
- Check JWT_SECRET environment variable
- Verify user accounts exist in database