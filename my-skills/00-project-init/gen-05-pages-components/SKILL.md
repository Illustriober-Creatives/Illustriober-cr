---
name: gen-05-pages-components
description: Generate complete page and component breakdown for frontend including layouts, routes, and component hierarchy
risk: low
source: custom
date_added: 2026-04-12
---

# Pages & Components Generator (05)

You are a **frontend architect** responsible for designing the complete page structure, component hierarchy, and user interface layout based on features and user roles.

## Use this skill when

- The orchestrator invokes you with brief + 00_PROJECT_OVERVIEW.md + 04_API_SPEC.md
- Frontend structure needs to be defined before component development
- Page routes, layouts, and component reusability must be documented
- This is **step 6** in the specification pipeline

## Do not use this skill when

- Frontend structure already exists
- Features and API spec are undefined (depends on 04_API_SPEC.md)

## Instructions

### Input

- Client brief documents
- 00_PROJECT_OVERVIEW.md (user roles, client lifecycle)
- 04_API_SPEC.md (API endpoints, available data)
- 06_FEATURES.md (if available; otherwise infer from brief)

### Generation Steps

1. **Public Pages (Unauthenticated Users)**
   - **Home Page** (/)
     - Hero section with company branding
     - Services overview / key features
     - Call-to-action (contact, enquire, view portfolio)
     - Components: Hero, CTAButton, ServiceCard
   
   - **About Page** (/about)
     - Company story, team, values
     - Studio capabilities, certifications
     - Components: TeamCard, TimelineItem, ValueProposition
   
   - **Services Page** (/services)
     - Detailed service descriptions
     - Pricing tiers (if applicable)
     - Components: ServiceDetail, PricingCard, FeatureList
   
   - **Portfolio/Work Page** (/portfolio)
     - Project gallery or case studies
     - Filter/search by project type
     - Components: ProjectCard, ProjectGrid, ProjectDetail modal
   
   - **Enquiry Form** (/enquiry)
     - Form fields: name, email, project description, budget, services needed
     - Submit to API endpoint: POST /api/enquiries
     - Components: Form, FormField, SubmitButton, SuccessMessage
   
   - **Contact Page** (/contact)
     - Contact form or information
     - Links to social media, email, phone
     - Components: ContactForm, ContactInfo, SocialLinks

2. **Layout Structure**
   - **Root Layout** (shared across all pages)
     - Header/Navbar (navigation, logo, CTA button)
     - Main content area
     - Footer (links, social, contact info, copyright)
     - Components: Navbar, Footer, LayoutWrapper
   
   - **Dashboard Layout** (for authenticated users)
     - Sidebar navigation (projects, tickets, account, settings)
     - Top bar (user profile dropdown, notifications, logout)
     - Main content area
     - Components: Sidebar, NavItem, UserMenu, TopBar

3. **Authenticated Pages (Clients)**
   - **Dashboard** (/dashboard)
     - Quick overview: active projects, recent tickets, messages
     - Components: ProjectCard, TicketPreview, ActivityFeed
   
   - **Projects List** (/dashboard/projects)
     - List of all client's projects with status
     - Create project button (admin only)
     - Components: ProjectList, ProjectRow, ProjectCreateModal
   
   - **Project Detail** (/dashboard/projects/[id])
     - Project info, status, team members
     - Tickets/tasks sub-section
     - Messages/comments sub-section
     - Components: ProjectHeader, TicketList, MessageThread
   
   - **Tickets/Tasks** (/dashboard/projects/[id]/tickets)
     - List all project tickets with filters
     - Create / edit ticket forms
     - Components: TicketTable, TicketFilters, TicketForm, TicketModal
   
   - **Files/Deliverables** (/dashboard/projects/[id]/files)
     - List uploaded files
     - File upload form
     - Download / preview
     - Components: FileList, FileUploadZone, FileCard
   
   - **Account Settings** (/dashboard/settings)
     - User profile (name, email, avatar)
     - Password change
     - Notification preferences
     - Components: SettingsForm, PasswordChangeForm, PreferenceToggle

4. **Admin Pages** (/admin/*)
   - **Enquiries Dashboard** (/admin/enquiries)
     - List all enquiries with status, dates
     - Mark as contacted, converted, rejected
     - Components: EnquiryTable, EnquiryModal, StatusBadge
   
   - **User Management** (/admin/users)
     - List all users, roles, activity
     - Create / edit / deactivate users
     - Components: UserTable, UserForm, RoleSelect
   
   - **All Projects** (/admin/projects)
     - Global project overview
     - Assign projects to users, manage status
     - Components: ProjectTable, ProjectForm
   
   - **Reports** (/admin/reports)
     - Project completion rate, revenue (if applicable), team utilization
     - Components: Chart, MetricCard, DateRangeFilter

5. **Shared Components Library**
   - **Layout Components**
     - Layout, Navbar, Sidebar, Footer, Container, Grid
   
   - **Form Components**
     - Form, FormField, Input, Textarea, Select, Checkbox, RadioGroup, SubmitButton
   
   - **Data Display**
     - Table, Card, Badge, Avatar, Tag, Chip
   
   - **Navigation**
     - Link, Breadcrumb, Tabs, Pagination
   
   - **Feedback**
     - Alert, Toast, Spinner, Skeleton, Empty State, Error Boundary
   
   - **Modals & Drawers**
     - Modal, Drawer, Dialog, Confirmation Dialog
   
   - **Advanced**
     - DatePicker, TimePicker, SearchInput, Dropdown, Tooltip, Popover

6. **Component Hierarchy Example**
   ```
   <RootLayout>
     <Navbar />
     <main>
       <ProjectDetailPage>
         <ProjectHeader />
         <Tabs>
           <Tab label="Tickets">
             <TicketList>
               <TicketTable>
                 <TicketRow />
               </TicketTable>
             </TicketList>
           </Tab>
           <Tab label="Files">
             <FileList>
               <FileCard />
             </FileList>
           </Tab>
         </Tabs>
       </ProjectDetailPage>
     </main>
     <Footer />
   </RootLayout>
   ```

7. **Route Structure**
   ```
   /                              # Home (public)
   /about                         # About (public)
   /services                      # Services (public)
   /portfolio                     # Portfolio (public)
   /enquiry                       # Enquiry form (public)
   /contact                       # Contact (public)
   /auth/login                    # Login (public)
   /auth/register                 # Register (public)
   /dashboard                     # Client dashboard (authenticated)
   /dashboard/projects            # Projects list (authenticated)
   /dashboard/projects/[id]       # Project detail (authenticated)
   /dashboard/projects/[id]/tickets
   /dashboard/projects/[id]/files
   /dashboard/settings            # Account settings (authenticated)
   /admin                         # Admin dashboard (admin-only)
   /admin/enquiries               # Enquiries management (admin-only)
   /admin/users                   # User management (admin-only)
   /admin/projects                # All projects (admin-only)
   /admin/reports                 # Reports (admin-only)
   ```

8. **Data Flow & State Management**
   - Document which pages fetch data from which API endpoints
   - Use TanStack Query for server state management
   - Use Zustand or Context API for client state (user auth, UI state)
   - Example: `ProjectDetail` fetches `GET /api/projects/:id` on mount

### Output Format

Markdown file: `05_PAGES_AND_COMPONENTS.md`

Standard sections:
- **Public Pages** — Home, About, Services, Portfolio, Enquiry, Contact (with API integrations)
- **Dashboard Layout** — Navbar, Sidebar, main content structure
- **Authenticated Pages** — Dashboard, Projects, Project Detail, Tickets, Files, Settings
- **Admin Pages** — Enquiries, Users, Projects, Reports
- **Shared Components** — Common UI components and their props
- **Route Structure** — Complete URL map with access control
- **Component Hierarchy** — Example nesting and composition
- **Data Flow** — Which pages call which API endpoints

### Validation

- ✓ All user roles (public, client, admin) have appropriate pages
- ✓ Every API endpoint from 04 has a corresponding frontend page/component
- ✓ Routes match Next.js conventions ([id] for dynamic routes)
- ✓ Shared components are reusable across multiple pages
- ✓ Data flow shows which components fetch from which endpoints
- ✓ Admin features are separated and authenticated

### Safety

- All authenticated routes must check user role on both client (optimistic) and server (authoritative)
- Do not display sensitive data (API keys, passwords, other users' info) on any page
- Use environment variables for API base URL (never hardcode domain)
- Implement error boundaries to catch and gracefully display component failures

## Purpose

This blueprint is the **visual roadmap for frontend development** — developers pull this spec and build pages/components matching the documented structure.

