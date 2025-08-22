import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

type Course = { id: string; courseName: string; courseCode: string };

export default function MyCourses() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/courses/mine', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCourses(data);
    })();
  }, []);

  return (
    <div>
      <h2>My Courses</h2>
      <ul>
        {courses.map(c => <li key={c.id}><Link to={`/instructor/courses/${c.id}`}>{c.courseCode} - {c.courseName}</Link></li>)}
      </ul>
    </div>
  );
}
