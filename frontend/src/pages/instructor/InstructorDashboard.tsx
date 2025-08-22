import { Link, Route, Routes, Navigate } from 'react-router-dom';
import Nav from '../../components/Nav';
import MyCourses from './MyCourses';
import CourseView from './CourseView';

export default function InstructorDashboard() {
  return (
    <div>
      <Nav />
      <div style={{ display: 'flex' }}>
        <aside style={{ width: 200, borderRight: '1px solid #ddd', padding: 12 }}>
          <ul>
            <li><Link to="courses">My Courses</Link></li>
          </ul>
        </aside>
        <main style={{ flex: 1, padding: 16 }}>
          <Routes>
            <Route path="courses" element={<MyCourses />} />
            <Route path="courses/:id" element={<CourseView />} />
            <Route path="*" element={<Navigate to="courses" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
