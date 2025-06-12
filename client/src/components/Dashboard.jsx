import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, Users, Bot, Sparkles, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import DashboardPremium from './DashboardPremium';

const Dashboard = () => {
  // Use the premium dashboard with all enhanced UI/UX features
  return <DashboardPremium />;
};

export default Dashboard;