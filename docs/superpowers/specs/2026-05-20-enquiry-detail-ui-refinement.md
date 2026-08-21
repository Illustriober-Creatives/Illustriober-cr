# Design Spec: Enquiry Detail UI Refinement

## 1. Problem Statement
The current Enquiry Detail page (`apps/web/src/app/admin/enquiries/[id]/page.tsx`) has poor visibility for client information. Labels and values are difficult to distinguish, and the overall layout lacks a clear visual hierarchy, making it hard for administrators to scan and process information quickly.

## 2. Goals
- Improve readability and accessibility by increasing contrast between labels and values.
- Establish a clear information hierarchy using the project's "Liquid Glass" design system.
- Enhance scannability through the use of icons and structured data groups.
- Maintain a professional, premium aesthetic suitable for a creative studio.

## 3. Proposed Design

### 3.1 Information Grouping
We will reorganize the fields into three main cards:
1. **Client Identity (Card 1)**: Name, Email, Phone, Company.
2. **Project Specs (Card 2)**: Project Type, Budget, Timeline, Referral Source, Submitted Date.
3. **Core Request (Card 3)**: Status, Full Description, and Admin Notes (if present).

### 3.2 Visual Styling
- **Cards**: Use the `.glass-card` utility class with `bg-surface/30` for a depth effect.
- **Labels**: `text-zinc-500` (Dark) / `text-zinc-400` (Light), `text-[10px]`, `uppercase`, `tracking-widest`, `font-bold`.
- **Values**: `text-foreground`, `text-base`, `font-medium`.
- **Icons**: Use `lucide-react` icons (User, Mail, Phone, Building, Briefcase, Coins, Calendar, Info, Clock).

### 3.3 Layout
- **Desktop**: A two-column layout. 
  - Left column (narrower): Identity and Specs cards.
  - Right column (wider): Core Request card.
- **Mobile**: Single column stacked view.
- **Header**: Navigation breadcrumbs and the primary action button ("Convert to Client").

## 4. Technical Implementation
- **Icons**: Import `User`, `Mail`, `Phone`, `Building`, `Briefcase`, `Coins`, `Calendar`, `Info`, `Clock`, `ArrowLeft` from `lucide-react`.
- **Components**: Utilize existing `Button` component.
- **State**: Maintain existing fetch logic and conversion state management.

## 5. Verification Plan
- **Manual Review**: Verify contrast in both Light and Dark modes.
- **Responsive Check**: Ensure layout scales correctly on mobile devices.
- **Functional Check**: Verify "Convert to Client" button still functions correctly and displays the resulting invite link.
