# Testing Guide for Project Management Features

This guide covers the verification of the new Project Management features (Issues #37 and #38).

## 1. Admin Flow: Project Initialization (#37)

### Prerequisites
- You must be logged in as an **ADMIN**.
- At least one user with the **CLIENT** role must exist in the database.

### Steps
1. **Navigate to Projects:** Log in as admin and go to `/admin/projects`.
2. **Start Initialization:** Click the "Initialize Project" button.
3. **Fill Form:**
   - **Project Name:** Enter a name (e.g., "Digital Rebrand").
   - **Slug:** Auto-generated from name (can be manually edited).
   - **Client:** Select an existing client from the dropdown.
   - **Description:** Provide a description (min 10 chars).
4. **Submit:** Click "Create Project".
5. **Verify:** You should be redirected back to `/admin/projects`, and the new project should be visible in the list.

## 2. Client Dashboard: Project Visibility (#38)

### Prerequisites
- A project must have been assigned to your client account.

### Steps
1. **Login as Client:** Log in using a client account that has assigned projects.
2. **Dashboard Overview:** You should be redirected to `/dashboard`.
3. **Verify Projects:**
   - Under "Your Projects", you should see the projects assigned to you.
   - Ensure you **only** see your projects and not projects belonging to other clients.
4. **View Details:** Click "View Project" to ensure the slug-based routing works (details page is a skeleton but confirms the link).

## 3. API & Security Verification

### Automated Tests
Run the backend tests to verify data isolation and validation:
```bash
npm run test --workspace apps/api src/routes/admin-projects.test.ts
```

### Manual API Checks
- **Unauthorized Access:** Try accessing `/api/admin/projects` with a Client token. It should return `403 Forbidden`.
- **Data Validation:** Try creating a project via API with a missing `clientId` or a description less than 10 characters. It should return `400 Bad Request`.
