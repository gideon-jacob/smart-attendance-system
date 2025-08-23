# Backend Endpoints for Postman Testing

**Base URL:** `http://localhost:4000/api`

---

### 1. Authentication Endpoints (`auth.ts`)

*   **`POST /auth/login`**
    *   **Description:** Authenticates a user and returns a JWT token.
    *   **Authentication:** None
    *   **Request Body (JSON):**
        ```json
        {
          "email": "admin@example.com",
          "password": "admin123"
        }
        ```
    *   **Example Response:**
        ```json
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "user": {
            "id": "...",
            "email": "admin@example.com",
            "fullName": "Admin",
            "role": "admin"
          }
        }
        ```

---

### 2. User Management Endpoints (`users.ts`)

*   **Authentication:** All endpoints in this section require a JWT token with an `admin` role. Include `Authorization: Bearer <YOUR_TOKEN>` in the request headers.

*   **`GET /users`**
    *   **Description:** Retrieves a list of all users.
    *   **Authentication:** Admin
    *   **Parameters:** None
    *   **Request Body:** None
    *   **Example Response:** `[...]` (array of user objects, without passwordHash)

*   **`GET /users/:id`**
    *   **Description:** Retrieves a single user by ID.
    *   **Authentication:** Admin
    *   **Parameters:** `id` (path parameter, e.g., `/users/50cb08fa-c5d0-4487-b71f-a59c9e6dd3ba`)
    *   **Request Body:** None
    *   **Example Response:** `{ "id": "...", "email": "...", "fullName": "...", "role": "..." }`

*   **`POST /users`**
    *   **Description:** Creates a new user.
    *   **Authentication:** Admin
    *   **Request Body (JSON):**
        ```json
        {
          "email": "newuser@example.com",
          "fullName": "New User",
          "role": "student",
          "password": "password123",
          "parentId": null,
          "phone": null
        }
        ```
    *   **Example Response:** `{ "id": "..." }`

*   **`PUT /users/:id`**
    *   **Description:** Updates an existing user by ID.
    *   **Authentication:** Admin
    *   **Parameters:** `id` (path parameter)
    *   **Request Body (JSON):** (Partial updates are allowed)
        ```json
        {
          "fullName": "Updated Name",
          "active": true,
          "password": "newpassword"
        }
        ```
    *   **Example Response:** `{ "id": "..." }`

*   **`DELETE /users/:id`**
    *   **Description:** Deletes a user by ID.
    *   **Authentication:** Admin
    *   **Parameters:** `id` (path parameter)
    *   **Request Body:** None
    *   **Example Response:** `(204 No Content)`

---

### 3. Course Management Endpoints (`courses.ts`)

*   **Authentication:** All endpoints in this section require a JWT token. Specific roles are noted. Include `Authorization: Bearer <YOUR_TOKEN>` in the request headers.

*   **`GET /courses`**
    *   **Description:** Retrieves a list of all courses.
    *   **Authentication:** Admin
    *   **Parameters:** None
    *   **Request Body:** None
    *   **Example Response:** `[...]` (array of course objects with instructor details)

*   **`POST /courses`**
    *   **Description:** Creates a new course.
    *   **Authentication:** Admin
    *   **Request Body (JSON):**
        ```json
        {
          "courseName": "Advanced Algorithms",
          "courseCode": "CS401",
          "instructorId": "...", // UUID of an instructor user
          "startTimeMinutes": 540, // 09:00 AM
          "endTimeMinutes": 630,   // 10:30 AM
          "daysOfWeek": [1, 3]     // Monday, Wednesday
        }
        ```
    *   **Example Response:** `{ "id": "...", "courseName": "...", ... }`

*   **`GET /courses/mine`**
    *   **Description:** Retrieves courses taught by the authenticated instructor.
    *   **Authentication:** Instructor
    *   **Parameters:** None
    *   **Request Body:** None
    *   **Example Response:** `[...]` (array of course objects)

*   **`GET /courses/:id`**
    *   **Description:** Retrieves a single course by ID, including instructor and enrolled students.
    *   **Authentication:** Any authenticated user (role-based access might be further refined in frontend/business logic)
    *   **Parameters:** `id` (path parameter)
    *   **Request Body:** None
    *   **Example Response:** `{ "id": "...", "courseName": "...", "instructor": {...}, "students": [...] }`

*   **`PUT /courses/:id`**
    *   **Description:** Updates an existing course by ID.
    *   **Authentication:** Admin
    *   **Parameters:** `id` (path parameter)
    *   **Request Body (JSON):** (Partial updates are allowed)
        ```json
        {
          "courseName": "Updated Algorithms",
          "endTimeMinutes": 660 // 11:00 AM
        }
        ```
    *   **Example Response:** `{ "id": "...", "courseName": "...", ... }`

*   **`DELETE /courses/:id`**
    *   **Description:** Deletes a course by ID.
    *   **Authentication:** Admin
    *   **Parameters:** `id` (path parameter)
    *   **Request Body:** None
    *   **Example Response:** `(204 No Content)`

*   **`POST /courses/:id/students`**
    *   **Description:** Enrolls a student in a course.
    *   **Authentication:** Admin
    *   **Parameters:** `id` (path parameter - course ID)
    *   **Request Body (JSON):**
        ```json
        {
          "studentId": "..." // UUID of a student user
        }
        ```
    *   **Example Response:** `(201 Created)`

*   **`DELETE /courses/:id/students/:studentId`**
    *   **Description:** Unenrolls a student from a course.
    *   **Authentication:** Admin
    *   **Parameters:** `id` (path parameter - course ID), `studentId` (path parameter - student ID)
    *   **Request Body:** None
    *   **Example Response:** `(204 No Content)`

---

### 4. Student Endpoints (`student.ts`)

*   **Authentication:** All endpoints in this section require a JWT token. Specific roles are noted. Include `Authorization: Bearer <YOUR_TOKEN>` in the request headers.

*   **`GET /student/attendance`**
    *   **Description:** Retrieves attendance records for the authenticated student or their child (if parent).
    *   **Authentication:** Student, Parent
    *   **Parameters (Query):** `childId` (optional, UUID of a child student, only for `parent` role)
    *   **Request Body:** None
    *   **Example Request (Student):** `GET /api/student/attendance`
    *   **Example Request (Parent):** `GET /api/student/attendance?childId=...`
    *   **Example Response:** `[...]` (array of attendance record objects)

*   **`GET /student/courses`**
    *   **Description:** Retrieves courses the authenticated student is enrolled in.
    *   **Authentication:** Student
    *   **Parameters:** None
    *   **Request Body:** None
    *   **Example Response:** `[...]` (array of course objects with instructor details)

---

### 5. Attendance Endpoints (`attendance.ts`)

*   **Authentication:** Specific roles are noted. Include `Authorization: Bearer <YOUR_TOKEN>` in the request headers for authenticated endpoints.

*   **`GET /attendance/live/:courseId`**
    *   **Description:** Establishes a Server-Sent Events (SSE) connection for live attendance updates for a specific course.
    *   **Authentication:** Instructor
    *   **Parameters:** `courseId` (path parameter)
    *   **Request Body:** None
    *   **Note:** This endpoint is for SSE. Postman can connect, but a browser or SSE client is better for real-time updates.

*   **`POST /attendance/record`**
    *   **Description:** Records a student's attendance for a course.
    *   **Authentication:** None (intended for hardware/system use, but can be tested manually)
    *   **Request Body (JSON):**
        ```json
        {
          "studentId": "...", // UUID of a student
          "courseId": "...",  // UUID of a course
          "timestamp": "2025-08-23T09:05:00.000Z" // Optional, defaults to current time
        }
        ```
    *   **Example Response:** `{ "id": "...", "studentId": "...", "courseId": "...", "status": "Present", ... }`

*   **`PUT /attendance/override`**
    *   **Description:** Overrides a student's attendance status for a course.
    *   **Authentication:** Instructor
    *   **Request Body (JSON):**
        ```json
        {
          "studentId": "...", // UUID of a student
          "courseId": "...",  // UUID of a course
          "status": "Absent", // "Present", "Absent", or "Late"
          "reason": "Student was ill"
        }
        ```
    *   **Example Response:** `{ "id": "...", "studentId": "...", "courseId": "...", "status": "Absent", "isOverride": true, ... }`

---

### 6. Reports Endpoints (`reports.ts`)

*   **Authentication:** All endpoints in this section require a JWT token with `admin` or `instructor` role. Include `Authorization: Bearer <YOUR_TOKEN>` in the request headers.

*   **`GET /reports`**
    *   **Description:** Generates attendance reports.
    *   **Authentication:** Admin, Instructor
    *   **Parameters (Query):**
        *   `courseId` (optional, UUID)
        *   `studentId` (optional, UUID)
        *   `from` (optional, ISO 8601 datetime string, e.g., `2025-08-01T00:00:00.000Z`)
        *   `to` (optional, ISO 8601 datetime string)
        *   `format` (optional, `json` (default), `csv`, or `pdf`)
    *   **Request Body:** None
    *   **Example Request (JSON):** `GET /api/reports?courseId=...&from=2025-08-01T00:00:00.000Z&to=2025-08-31T23:59:59.999Z`
    *   **Example Request (CSV):** `GET /api/reports?format=csv&courseId=...`
    *   **Example Request (PDF):** `GET /api/reports?format=pdf&studentId=...`
    *   **Example Response (JSON):** `[...]` (array of attendance record objects)
    *   **Example Response (CSV/PDF):** Raw CSV or PDF file content.

---

Remember to replace placeholder UUIDs (`...`) with actual IDs from your seeded data or created resources. You can get user and course IDs by first logging in as an admin and fetching the `/users` and `/courses` lists.