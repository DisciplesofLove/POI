import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useContractManager } from '../hooks/useContractManager';
import { Box, Button, TextField, Typography, Card, CardContent, Grid, Tab, Tabs, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ethers } from 'ethers';

interface ContractData {
  id: string;
  name: string;
  version: string;
  sourceCode: string;
  abi: any;
  deployedAddress?: string;
  isVerified: boolean;
  createdAt: number;
  lastUpdated: number;
}

interface ContractFormData {
  name: string;
  version: string;
  sourceCode: string;
}

export const SmartContractManager: React.FC<{ marketplaceAddress: string }> = ({ marketplaceAddress }) => {
  const { account } = useWallet();
  const { registerContract, updateContract, deployContract, getContractInfo, getUserContracts, loading, error } = useContractManager(marketplaceAddress);
  
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedContract, setSelectedContract] = useState<ContractData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ContractFormData>({
    name: '',
    version: '1.0.0',
    sourceCode: ''
  });

  // Load user's contracts
  useEffect(() => {
    const loadContracts = async () => {
      if (!account) return;
      
      try {
        const contractIds = await getUserContracts();
        const contractsData = await Promise.all(
          contractIds.map(id => getContractInfo(id))
        );
        setContracts(contractsData);
      } catch (err) {
        console.error('Error loading contracts:', err);
      }
    };

    loadContracts();
  }, [account]);

  const handleCreateContract = async () => {
    try {
      // Basic Solidity compiler validation
      if (!formData.sourceCode.includes('pragma solidity')) {
        throw new Error('Invalid Solidity code: Missing pragma statement');
      }

      // Register contract
      const contractId = await registerContract({
        name: formData.name,
        version: formData.version,
        sourceCode: formData.sourceCode,
        abi: [] // This would be populated after compilation
      });

      // Refresh contracts list
      const newContract = await getContractInfo(contractId);
      setContracts([...contracts, newContract]);

      // Reset form
      setFormData({
        name: '',
        version: '1.0.0',
        sourceCode: ''
      });
    } catch (err) {
      console.error('Error creating contract:', err);
    }
  };

  const handleUpdateContract = async (contractId: string) => {
    try {
      await updateContract(contractId, {
        name: formData.name,
        version: formData.version,
        sourceCode: formData.sourceCode,
        abi: selectedContract?.abi || []
      });

      // Refresh contract data
      const updated = await getContractInfo(contractId);
      setContracts(contracts.map(c => c.id === contractId ? updated : c));
      setIsEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating contract:', err);
    }
  };

  const handleDeployContract = async (contract: ContractData) => {
    try {
      // This would typically involve compiling the contract first
      const bytecode = ''; // Get this from compilation
      const deployedAddress = await deployContract(contract.id, contract.abi, bytecode);
      
      // Refresh contract data
      const updated = await getContractInfo(contract.id);
      setContracts(contracts.map(c => c.id === contract.id ? updated : c));
    } catch (err) {
      console.error('Error deploying contract:', err);
    }
  };

  const handleEditClick = (contract: ContractData) => {
    setSelectedContract(contract);
    setFormData({
      name: contract.name,
      version: contract.version,
      sourceCode: contract.sourceCode
    });
    setIsEditDialogOpen(true);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Smart Contract Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="My Contracts" />
        <Tab label="Create New Contract" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          {contracts.map((contract) => (
            <Grid item xs={12} md={6} key={contract.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{contract.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Version: {contract.version}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(contract.createdAt).toLocaleDateString()}
                  </Typography>
                  {contract.deployedAddress && (
                    <Typography variant="body2">
                      Deployed at: {contract.deployedAddress}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mr: 1 }}
                      onClick={() => handleEditClick(contract)}
                    >
                      Edit
                    </Button>
                    {!contract.deployedAddress && (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                        onClick={() => handleDeployContract(contract)}
                      >
                        Deploy
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {activeTab === 1 && (
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Contract Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Version"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Contract Code"
            multiline
            rows={10}
            value={formData.sourceCode}
            onChange={(e) => setFormData({ ...formData, sourceCode: e.target.value })}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleCreateContract}
            disabled={!formData.name || !formData.version || !formData.sourceCode}
          >
            Create Contract
          </Button>
        </Box>
      )}

      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Contract</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Contract Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Version"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Contract Code"
            multiline
            rows={10}
            value={formData.sourceCode}
            onChange={(e) => setFormData({ ...formData, sourceCode: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedContract && handleUpdateContract(selectedContract.id)}
            variant="contained"
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};