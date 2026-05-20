# Testing Guide — Browser & VPS Database

This guide covers manual testing using the browser UI with the direct VPS database connection.

## Setup Prerequisites

1. **Servers running:**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:3000
   - API: http://localhost:4000

2. **VPS Database configured** in `apps/api/.env`:
   ```bash
   DIRECT_DATABASE_URL=postgresql://itsriober:%40yug%213846%2C@156.232.88.133:5432/illustrioberdb?schema=public
   ```

3. **Prisma generated:**
   ```bash
   npm run prisma:generate --workspace apps/api
   ```

---

## Step 1: Create an Admin User on VPS

### Option A: Using Prisma Studio (easiest)

```bash
npm run prisma:studio --workspace apps/api
```

1. Opens Prisma Studio at `http://localhost:5555`
2. Navigate to **User** table
3. Find your user record (or create one if needed)
4. Change `role` from `USER` to `ADMIN`
5. Save

### Option B: Using PostgreSQL Client (direct SQL)

If you have `psql` installed locally with access to the VPS:

```bash
psql -h 156.232.88.133 -U itsriober -d illustrioberdb -c \
  "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

### Option C: Register and Promote (if needed)

If no user exists yet:

1. Go to http://localhost:3000/register
2. Create an account with your email
3. Use **Option A** above to change role to `ADMIN`

---

## Step 2: Authentication Tests

### Test 2a: User Registration

1. Navigate to **http://localhost:3000/register**
2. Fill in the form:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "SecurePass123!"
   - Confirm Password: "SecurePass123!"
3. Click **Register**
4. ✅ Should redirect to **login page** with success message
5. Check VPS database → new user in `User` table with `role='USER'`

### Test 2b: User Login

1. Navigate to **http://localhost:3000/login**
2. Enter credentials:
   - Email: testuser@example.com
   - Password: SecurePass123!
3. Click **Login**
4. ✅ Should redirect to **/dashboard** (authenticated)
5. Browser DevTools → **Application** → **Cookies** → Check `illustriober_refresh` cookie is set

### Test 2c: Token Refresh (Automatic)

1. Logged in at http://localhost:3000/dashboard
2. Open **DevTools** → **Network** tab
3. Keep the page open for 15+ minutes
4. Make any request (click anything)
5. ✅ Should see a `POST /api/auth/refresh` call in Network tab
6. Check **Cookies** → `illustriober_refresh` value changed (rotated token)

### Test 2d: Logout

1. At http://localhost:3000/dashboard
2. Click **Logout** button
3. ✅ Redirects to http://localhost:3000/
4. Try to access /dashboard → redirects to /login

---

## Step 3: Rate Limiting Test

### Test 3a: Login Rate Limiting

1. Navigate to **http://localhost:3000/login**
2. Attempt to login with wrong credentials multiple times:
   - Enter a fake email (e.g., "spammer@test.com")
   - Enter a wrong password (e.g., "wrong")
   - Click **Login** button 11 times in quick succession
3. ✅ On the 11th attempt, page should show: **"Too many attempts. Please try again later."**
4. Wait 15 minutes or check the API response headers for `Retry-After`

---

## Step 4: Contact Form (Enquiry) Tests

### Test 4a: Submit Enquiry

1. Navigate to **http://localhost:3000/enquiry**
2. Fill in the form:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Company: "Acme Corp"
   - Project Type: "Web App"
   - Budget: "$50K-$100K"
   - Timeline: "3 months"
   - Description: "We need a modern dashboard."
3. Click **Submit**
4. ✅ Redirects to **Thank You page** with 5-second countdown
5. ✅ Should see message: "We've received your inquiry at john@example.com"
6. Countdown redirects to home page after 5 seconds

### Test 4b: Verify Enquiry in Admin Panel

1. Login as **ADMIN** user at http://localhost:3000/login
2. Navigate to **http://localhost:3000/admin**
3. ✅ Should land on `/admin/enquiries`
4. ✅ Your submitted enquiry appears in the list with:
   - Name: "John Doe"
   - Email: "john@example.com"
   - Status: "PENDING"

---

## Step 5: Admin Panel Tests

### Test 5a: Admin Access Control

1. Logged in as **regular USER** (not admin)
2. Try to access **http://localhost:3000/admin**
3. ✅ Should redirect to **/login** or **/dashboard**

### Test 5b: Enquiry Management (Admin Only)

1. Login as **ADMIN** at http://localhost:3000/login
2. Go to **http://localhost:3000/admin**
3. ✅ Should show list of all enquiries
4. Click on an enquiry row → opens **detail view** with:
   - Full contact info
   - Project description
   - Status badge
   - "Convert to Client" button

### Test 5c: Convert Enquiry to Client

1. In Admin Panel, click an enquiry → detail view
2. Click **"Convert to Client"** button
3. ✅ Should show a modal or inline message with an **Invite URL**
4. Copy the invite URL
5. ✅ Go to that URL in a new incognito/private window
6. Should land on **/invite/[token]** with account activation form

---

## Step 6: Invite System Tests

### Test 6a: Validate Invite Token

1. From admin panel, click "Convert to Client" on an enquiry
2. Copy the invite URL (e.g., `http://localhost:3000/invite/abc123xyz`)
3. Open in **new incognito window** (fresh session)
4. ✅ Should display:
   - Pre-filled email
   - Password setup form
   - "Activate Account" button

### Test 6b: Create Account via Invite

1. At the invite page with valid token
2. Fill in:
   - Name: "Jane Doe"
   - Password: "InvitePass123!"
   - Confirm Password: "InvitePass123!"
3. Click **Activate Account**
4. ✅ Should redirect to **/dashboard** (auto-logged in)
5. Check VPS database → new user with `role='CLIENT'`

### Test 6c: Expired/Invalid Invite

1. Go to `http://localhost:3000/invite/invalidtoken123`
2. ✅ Should show **"Invalid or expired invite"** message
3. Link back to home page or login

---

## Step 7: Theme & UI Tests

### Test 7a: Light/Dark Mode Toggle

1. Navigate to http://localhost:3000/
2. Click the **Moon/Sun icon** in the top-right corner
3. ✅ Page theme switches (light → dark or vice versa)
4. Refresh page
5. ✅ Theme persists (saved in localStorage via next-themes)

### Test 7b: Responsive Design

1. At http://localhost:3000/
2. Open **DevTools** → **Toggle device toolbar**
3. Test at different breakpoints:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1024px)
4. ✅ All pages should be readable and functional

---

## Step 8: Email Tests (Optional)

### Test 8a: Enquiry Confirmation Email

1. Submit an enquiry at http://localhost:3000/enquiry
2. Check your email inbox (or Resend dashboard if using test email)
3. ✅ Should receive confirmation email with enquiry details

### Test 8b: Invite Email

1. Admin converts enquiry to client (triggers invite email)
2. Check email inbox
3. ✅ Email should contain:
   - Invite link
   - Recipient's email
   - Expiration info

---

## Step 9: Database Verification

### Check User Table

Using **Prisma Studio**:
```bash
npm run prisma:studio --workspace apps/api
```

Navigate to **User** table → verify:
- Registration created new users
- Admin users have `role='ADMIN'`
- Client users have `role='CLIENT'`
- `createdAt` timestamps are recent

### Check Enquiry Table

In Prisma Studio, **Enquiry** table → verify:
- Submitted enquiries appear
- Status is "PENDING" or "CONVERTED"
- Contact info matches what you submitted

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid or expired invite" | Token may have expired (typically 24-48 hours). Generate a new one from admin panel. |
| Rate limiting blocks login immediately | Wait 15 minutes or restart API (`npm run dev --workspace apps/api`). |
| Admin panel blank | Make sure you're logged in as ADMIN role. Check VPS DB role field. |
| Theme not persisting | Clear localStorage: DevTools → Application → LocalStorage → Delete `next-themes-*` |
| Email not received | Check Resend API key in `.env`. Verify `ENQUIRY_ADMIN_EMAIL` is set. |

---

## Quick Checklist

- [ ] Local servers running (`npm run dev`)
- [ ] Admin user created in VPS DB
- [ ] User registration works
- [ ] Admin login works
- [ ] Enquiry submission works
- [ ] Admin panel accessible
- [ ] Enquiry → Client conversion works
- [ ] Invite link activates new account
- [ ] Theme toggle works
- [ ] Rate limiting blocks spam
