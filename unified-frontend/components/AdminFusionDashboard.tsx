import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useWallet } from '../hooks/useWallet';

export default function AdminFusionDashboard() {
  const { account } = useWallet();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/ai-assistant/admin/insights');
        const data = await response.json();
        
        if (data.success && data.insights) {
          setInsights(data.insights);
          setError(null);
        } else {
          setError('Failed to load insights data');
        }
      } catch (error) {
        console.error('Error fetching admin insights:', error);
        setError('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <Box sx={{ width: '100%', p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading fusion insights...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!insights) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No fusion insights available
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Model Fusion Analytics Dashboard
      </Typography>
      <Typography variant="body1" paragraph>
        Monitor fusion trends, performance metrics, and user behavior to optimize the platform.
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                  {insights.success_rate}%
                </Typography>
                <Chip 
                  label={insights.success_rate > 75 ? "Good" : "Needs Improvement"} 
                  color={insights.success_rate > 75 ? "success" : "warning"}
                  size="small"
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={insights.success_rate} 
                sx={{ mt: 1, mb: 1 }}
                color={insights.success_rate > 75 ? "success" : "warning"}
              />
              <Typography variant="body2">
                Percentage of successful model fusions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Improvement
              </Typography>
              <Typography variant="h4" component="div">
                +{insights.average_improvement}%
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={insights.average_improvement * 2} 
                sx={{ mt: 1, mb: 1 }}
                color="primary"
              />
              <Typography variant="body2">
                Performance gain from model fusion
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                User Satisfaction
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" component="div" sx={{ mr: 1 }}>
                  {insights.user_satisfaction}/5
                </Typography>
                {insights.user_satisfaction >= 4 ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <WarningIcon color="warning" />
                )}
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={insights.user_satisfaction * 20} 
                sx={{ mt: 1, mb: 1 }}
                color={insights.user_satisfaction >= 4 ? "success" : "warning"}
              />
              <Typography variant="body2">
                Average user rating for fused models
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Fusions
              </Typography>
              <Typography variant="h4" component="div">
                {insights.popular_combinations.reduce((sum: number, item: any) => sum + item.usage_count, 0)}
              </Typography>
              <TrendingUpIcon color="primary" sx={{ mt: 1, mb: 1 }} />
              <Typography variant="body2">
                Total number of active model fusions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Popular Combinations */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Popular Model Combinations
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Model Combination</TableCell>
                <TableCell>Usage Count</TableCell>
                <TableCell>Popularity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {insights.popular_combinations.map((combo: any, index: number) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {combo.models.join(' + ')}
                  </TableCell>
                  <TableCell>{combo.usage_count}</TableCell>
                  <TableCell>
                    <LinearProgress 
                      variant="determinate" 
                      value={(combo.usage_count / Math.max(...insights.popular_combinations.map((c: any) => c.usage_count))) * 100} 
                      sx={{ height: 10, borderRadius: 5, width: '100%', maxWidth: 200 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recommendations */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              AI Recommendations
            </Typography>
            <List>
              {insights.recommendations.map((recommendation: string, index: number) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <LightbulbIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={recommendation} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Promote Vision-Language Combinations" 
                  secondary="Create featured section on marketplace homepage"
                />
                <Button variant="outlined" size="small">Implement</Button>
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem>
                <ListItemText 
                  primary="Add More Adapter Templates" 
                  secondary="Develop pre-configured adapters for common model combinations"
                />
                <Button variant="outlined" size="small">Schedule</Button>
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem>
                <ListItemText 
                  primary="Optimize Fusion Performance" 
                  secondary="Implement caching for frequently used model combinations"
                />
                <Button variant="outlined" size="small">Review</Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}