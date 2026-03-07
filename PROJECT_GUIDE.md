# B-CEL: Blockchain-Based Cyber Evidence Locker
## Complete Frontend Implementation

### Project Overview

B-CEL is a professional, academic-grade frontend application for secure digital evidence storage using Blockchain and IPFS technology. Built with Next.js 16, React, Tailwind CSS, and shadcn/ui components with a sophisticated green color theme.

---

## 📋 Pages Implemented

### 1. **Landing Page** (`/`)
- Hero section with compelling value proposition
- Key features section (6 main capabilities)
- 4-step process flow diagram
- Call-to-action sections
- Responsive navigation and footer
- Link to all other pages

### 2. **Register Page** (`/register`)
- User registration form with validation
- Fields: Full Name, Email, Organization, Password, Confirm Password
- Password strength validation (minimum 8 characters)
- Client-side validation with error messages
- Success state with redirect to sign-in
- Professional card-based design with green theme

### 3. **Sign In Page** (`/signin`)
- User login form with email and password
- Client-side validation
- Error handling and user feedback
- Links to registration and forgot password pages
- Responsive mobile-first design
- Token storage integration ready

### 4. **Upload Evidence Page** (`/upload`)
- Drag-and-drop file upload zone
- File input with validation
- Loading states during upload
- Success state showing:
  - Evidence ID
  - SHA-256 Hash
  - IPFS CID
  - Blockchain Timestamp
- Copy-to-clipboard functionality for all fields
- Navigation to dashboard and additional uploads
- Comprehensive info box explaining the process

### 5. **Verification Page** (`/verify`)
- Evidence ID search form
- Evidence details display including:
  - Evidence ID
  - File Name
  - Uploaded By
  - Blockchain Timestamp
  - SHA-256 Hash
  - IPFS CID
- Status badge (Verified or Compromised)
- Copy-to-clipboard for all technical fields
- Help section explaining verification process
- Empty state handling

### 6. **Dashboard Page** (`/dashboard`)
- Navigation header with links and sign-out
- Statistics cards showing:
  - Total Evidence count
  - Verified count
  - Pending count
  - Compromised count
- Search functionality by Evidence ID or filename
- Evidence table with columns:
  - Evidence ID
  - File Name
  - Status (badge)
  - Timestamp
  - Actions (View/Verify buttons)
- Loading and empty states
- CTA buttons for uploading and verification
- Responsive table design

### 7. **About & Architecture Page** (`/about`)
- Problem and solution overview
- System architecture section with 3 main components:
  - SHA-256 Hashing (with cryptographic details)
  - IPFS Storage (with distributed network info)
  - Blockchain Records (with Ethereum details)
- Evidence upload & verification flow (5 steps)
- Technical specifications covering:
  - Cryptography
  - Storage
  - Blockchain
  - Performance
- Security measures and compliance standards
- Call-to-action for getting started

---

## 🎨 Design System

### Color Palette (Green Theme)
- **Primary**: `oklch(0.52 0.16 142.49)` - Vibrant green
- **Secondary**: `oklch(0.78 0.08 142.49)` - Light green
- **Accent**: `oklch(0.65 0.15 142.49)` - Medium green
- **Muted**: `oklch(0.92 0.01 142.49)` - Very light green
- **Background**: `oklch(0.99 0.001 70.08)` - Off-white
- **Foreground**: `oklch(0.23 0.02 138.32)` - Dark green

### Typography
- **Font Family**: Geist (sans-serif) for all text
- **Font Mono**: Geist Mono for code/hashes
- **Responsive Headings**: h1-h6 with scaled sizing
- **Line Height**: Optimized for readability (1.4-1.6)

### Components Used
- Button (with variants: default, outline, ghost)
- Input (text, email, password fields)
- Card (CardHeader, CardContent, CardDescription)
- Alert (with variants: default, destructive)
- Badge (with variants and colors)
- Tables (responsive with hover states)

---

## 🔌 API Integration Points

All pages are prepared for backend API calls to a Node.js server. Expected endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login

### Evidence Management
- `POST /api/evidence/upload` - Upload evidence file
- `GET /api/evidence/verify/:evidenceId` - Verify evidence
- `GET /api/evidence/list` - Get user's evidence list

### Response Format Expected

**Upload Response:**
```json
{
  "evidenceId": "EV-2024-00001",
  "hash": "a2f43d6c8e1b9f2c4d5e6a7b8c9d0e1f...",
  "cid": "QmX7vF9k2mKzf3a4L7pQ9nW2bY5cZ8dX1eF4gH7jK9mN0o",
  "timestamp": "2024-01-20 14:30:45 UTC"
}
```

**Verify Response:**
```json
{
  "evidenceId": "EV-2024-00001",
  "fileName": "evidence-photo.jpg",
  "uploadedBy": "Officer Smith",
  "hash": "a2f43d6c8e1b9f2c...",
  "cid": "QmX7vF9k2mKzf3a4L7pQ9...",
  "timestamp": "2024-01-20 14:30:45 UTC",
  "status": "verified"
}
```

---

## 🚀 Features Implemented

✅ Professional, clean UI with green color theme
✅ Responsive design (mobile, tablet, desktop)
✅ 7 complete pages with full navigation
✅ Form validation on client-side
✅ Loading states and error handling
✅ Success/confirmation states
✅ Copy-to-clipboard functionality
✅ Search and filtering capabilities
✅ Status badges and indicators
✅ Tables with actions
✅ Drag-and-drop file upload UI
✅ Statistics cards/KPIs
✅ Help sections with information boxes
✅ Fully styled with shadcn/ui components
✅ Academic, professional aesthetic
✅ Clear labeling and sections
✅ Accessibility-ready components

---

## 📱 Responsive Layout

- **Mobile First Design**: All pages optimized for mobile (320px+)
- **Tablet Support**: Enhanced layouts for 768px+ screens
- **Desktop**: Optimized for 1024px+ screens
- **Max Width Container**: 6xl (1280px) for content
- **Grid Layouts**: Auto-responsive with md: and lg: prefixes
- **Flexible Navigation**: Responsive header with mobile-friendly menus

---

## 🔐 Security Considerations

The frontend is ready for secure backend integration:
- Token-based authentication (JWT)
- localStorage for client-side token storage
- Form validation and error handling
- HTTPS-ready for production
- Environment variables for API endpoints (to be configured)
- Copy-to-clipboard for secure credential handling

---

## 🎯 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the project
git clone [your-repo]

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=B-CEL
```

---

## 📝 File Structure

```
app/
├── layout.tsx          # Root layout with metadata
├── globals.css         # Green theme and Tailwind styles
├── page.tsx            # Landing page
├── register/
│   └── page.tsx        # Registration page
├── signin/
│   └── page.tsx        # Sign-in page
├── upload/
│   └── page.tsx        # Upload evidence page
├── verify/
│   └── page.tsx        # Verify evidence page
├── dashboard/
│   └── page.tsx        # Dashboard page
└── about/
    └── page.tsx        # About & Architecture page
```

---

## 🔗 Navigation Flow

```
Landing Page (/)
├── Register → Register Page (/register)
├── Sign In → Sign In Page (/signin)
├── About → About Page (/about)
└── Get Started → Register Page (/register)

Dashboard (/dashboard)
├── Upload → Upload Page (/upload)
├── Verify → Verify Page (/verify)
├── About → About Page (/about)
└── View/Verify → Verify Page (/verify)

Upload (/upload)
├── Dashboard → Dashboard Page (/dashboard)
└── Upload Another → Upload Page (/upload)

Verify (/verify)
├── Dashboard → Dashboard Page (/dashboard)
└── Search Another → Verify Page (/verify)
```

---

## 🎓 Academic & Professional Standards

✅ Clean, minimalist UI following design best practices
✅ Clear information hierarchy
✅ Professional color scheme (green for trust/security)
✅ Consistent typography and spacing
✅ Accessible component usage
✅ Educational content about blockchain/IPFS/SHA-256
✅ Enterprise-ready structure
✅ Law enforcement appropriate design
✅ Transparent technical descriptions
✅ Compliance-aware messaging

---

## 🔄 Next Steps for Backend Integration

1. Create Node.js/Express backend server
2. Implement authentication endpoints
3. Set up database for evidence storage
4. Integrate IPFS for file storage
5. Deploy smart contracts for blockchain records
6. Configure environment variables
7. Add API error handling
8. Implement logging and monitoring

---

## 📞 Support & Notes

This frontend is a complete, production-ready template for B-CEL. All pages are fully styled, responsive, and ready for backend API integration. The design follows academic and professional standards suitable for law enforcement and digital investigation contexts.

For questions or modifications, refer to the component documentation in shadcn/ui or modify the respective page files in the `/app` directory.

---

**B-CEL Frontend v1.0** | Blockchain-Based Cyber Evidence Locker | For Authorized Law Enforcement Use Only
