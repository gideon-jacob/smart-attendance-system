import { Route, Routes, Navigate, Link as RouterLink } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemText, Toolbar } from '@mui/material';
import MyCourses from './MyCourses';
import CourseView from './CourseView';

const drawerWidth = 240;

export default function InstructorDashboard() {
  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', top: 'auto' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="courses">
                <ListItemText primary="My Courses" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="courses" element={<MyCourses />} />
          <Route path="courses/:id" element={<CourseView />} />
          <Route path="*" element={<Navigate to="courses" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}
