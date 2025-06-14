import { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import Layout from '../../components/layout/Layout';
import AdminFusionDashboard from '../../components/AdminFusionDashboard';
import { useWallet } from '../../hooks/useWallet';
import { useAIAssistant } from '../../hooks/useAIAssistant';

export default function FusionDashboardPage() {
  const { account, isAdmin } = useWallet();
  const { getAdminInsights } = useAIAssistant();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      setLoading(true);
      try {
        // In a real app, we would check if the user is an admin
        // For now, we'll simulate this check
        const isUserAdmin = await isAdmin();
        setAuthorized(isUserAdmin);
      } catch (error) {
        console.error('Error checking authorization:', error);
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    if (account) {
      checkAuthorization();
    } else {
      setAuthorized(false);
      setLoading(false);
    }
  }, [account, isAdmin]);

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
          <Typography>Loading...</Typography>
        </Container>
      </Layout>
    );
  }

  if (!account) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
          <Alert severity="warning">
            Please connect your wallet to access this page.
          </Alert>
        </Container>
      </Layout>
    );
  }

  if (!authorized) {
    return (
      <Layout>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
          <Alert severity="error">
            You do not have permission to access this page.
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Admin Fusion Dashboard
          </Typography>
          <Typography variant="body1">
            Monitor and manage model fusion performance, trends, and user behavior.
          </Typography>
        </Box>
        
        <AdminFusionDashboard />
      </Container>
    </Layout>
  );
}