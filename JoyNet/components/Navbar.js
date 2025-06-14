import { useState } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Box, 
    IconButton, 
    Menu, 
    MenuItem, 
    Container,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Divider
} from '@mui/material';
import { 
    Menu as MenuIcon,
    AccountCircle,
    Wallet as WalletIcon
} from '@mui/icons-material';
import { useRouter } from 'next/router';

export default function Navbar() {
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    
    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleClose = () => {
        setAnchorEl(null);
    };
    
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    
    const navigateTo = (path) => {
        router.push(path);
        setMobileOpen(false);
        handleClose();
    };
    
    const menuItems = [
        { label: 'Home', path: '/' },
        { label: 'AI Models', path: '/models' },
        { label: 'Datasets', path: '/datasets' },
        { label: 'Model Fusion', path: '/model-fusion' },
        { label: 'Build AI', path: '/model-builder' }
    ];
    
    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                JoyNet
            </Typography>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton 
                            sx={{ textAlign: 'center' }}
                            onClick={() => navigateTo(item.path)}
                        >
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
    
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Container maxWidth="lg">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2, display: { sm: 'none' } }}
                            onClick={handleDrawerToggle}
                        >
                            <MenuIcon />
                        </IconButton>
                        
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                flexGrow: 1, 
                                cursor: 'pointer' 
                            }}
                            onClick={() => navigateTo('/')}
                        >
                            JoyNet
                        </Typography>
                        
                        <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                            {menuItems.map((item) => (
                                <Button 
                                    key={item.label}
                                    color="inherit"
                                    onClick={() => navigateTo(item.path)}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </Box>
                        
                        <Button 
                            color="inherit"
                            startIcon={<WalletIcon />}
                            variant="outlined"
                            sx={{ ml: 2 }}
                        >
                            Connect
                        </Button>
                        
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                            sx={{ ml: 1 }}
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={() => navigateTo('/profile')}>Profile</MenuItem>
                            <MenuItem onClick={() => navigateTo('/dashboard')}>Dashboard</MenuItem>
                            <MenuItem onClick={handleClose}>Logout</MenuItem>
                        </Menu>
                    </Toolbar>
                </Container>
            </AppBar>
            
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better mobile performance
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
            >
                {drawer}
            </Drawer>
        </Box>
    );
}