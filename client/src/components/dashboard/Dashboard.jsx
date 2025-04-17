import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Box, Typography, Grid, Card, CardContent, CardHeader, Avatar, Divider } from '@mui/material';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import GroupsIcon from '@mui/icons-material/Groups';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    groups: 0,
    contributions: 0,
    loans: 0,
    investments: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activitiesRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/activities/recent'),
        ]);
        setStats(statsRes.data);
        setRecentActivities(activitiesRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const contributionData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 6000 },
    { name: 'Apr', amount: 2000 },
    { name: 'May', amount: 5000 },
    { name: 'Jun', amount: 8000 },
  ];

  const groupDistribution = [
    { name: 'Savings', value: 45 },
    { name: 'Investments', value: 30 },
    { name: 'Loans', value: 25 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.name || 'Member'}
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <GroupsIcon />
                </Avatar>
              }
              title="Groups"
            />
            <CardContent>
              <Typography variant="h4">{stats.groups}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active groups
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  <AttachMoneyIcon />
                </Avatar>
              }
              title="Contributions"
            />
            <CardContent>
              <Typography variant="h4">KSh {stats.contributions.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total contributions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <SavingsIcon />
                </Avatar>
              }
              title="Loans"
            />
            <CardContent>
              <Typography variant="h4">KSh {stats.loans.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                Active loans
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <TrendingUpIcon />
                </Avatar>
              }
              title="Investments"
            />
            <CardContent>
              <Typography variant="h4">KSh {stats.investments.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                Total investments
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Contributions
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#2E7D32" name="Amount (KSh)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Group Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={groupDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {groupDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;