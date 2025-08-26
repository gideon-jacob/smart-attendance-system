import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../auth/useAuth';

export default function Nav() {
  const { user, logout } = useAuth();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart Attendance
        </Typography>
        {user && <Typography sx={{ mr: 2 }}>{user.fullName} ({user.role})</Typography>}
        {user && <Button color="inherit" onClick={logout}>Logout</Button>}
      </Toolbar>
    </AppBar>
  );
}
