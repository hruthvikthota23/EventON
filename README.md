# 🎫 EventON — Event Management System

> 🚀 A modern, responsive, role-based **Event Management Web Application built with React.js**.

EventON is a React-based event management platform that allows users to **discover events, book tickets, manage bookings, create events, manage events, and monitor event activity** through dedicated dashboards.

The application supports three major roles:

- 👤 **Attendee**
- 🎤 **Organizer**
- 🛡️ **Admin**

---

## 🌟 Project Overview

EventON is designed to provide a complete digital platform for managing events and bookings.

The application provides separate workflows for different users:

```text
                         🎫 EVENTON
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
         👤 Attendee     🎤 Organizer    🛡️ Admin
             │              │              │
             ▼              ▼              ▼
        Discover Events   Create Events   Manage Users
        Book Tickets      Manage Events   Manage Events
        My Bookings       View Bookings   Manage Bookings
        Profile           Dashboard       Dashboard
```

### 🎯 Main Objectives

- 🎫 Simplify event discovery and ticket booking
- 🎤 Help organizers create and manage events
- 🛡️ Give administrators centralized platform management
- 📊 Provide dashboards for monitoring events and bookings
- 🔐 Implement role-based access
- 📱 Provide a responsive user experience
- 🧩 Maintain reusable React components
- 🔄 Keep event and booking data synchronized across the application

---

# ✨ Features

## 👤 Attendee Features

Attendees can:

- 🏠 Browse the EventON home page
- 🔎 Search for events
- 🏷️ Filter events by category
- 📍 Filter events by location
- 📅 View event details
- 🎟️ Book tickets
- 💰 View booking amount
- ✅ View booking confirmation
- 📋 View personal bookings
- 🔍 Search bookings
- 📊 Filter bookings by status
- 📄 View booking details
- ❌ Cancel eligible upcoming bookings
- 👤 View and edit their profile

---

## 🎤 Organizer Features

Organizers can:

- 📊 Access an organizer dashboard
- ➕ Create events
- ✏️ Edit events
- 📅 View their events
- 🔎 Search events
- 🏷️ Filter events
- 🎟️ Track tickets sold
- 👥 Track available seats
- 💰 Monitor event revenue
- 📋 View bookings for their events
- 📄 View booking details
- ❌ Cancel eligible bookings
- 🚫 Cancel eligible events
- 📈 Monitor event performance

---

## 🛡️ Admin Features

Administrators can:

- 📊 Access the admin dashboard
- 👥 Manage users
- 👤 View user details
- 📅 Manage events
- 🔎 Search and filter events
- 📄 View event details
- 🎟️ Monitor tickets
- 📋 Manage bookings
- 📄 View booking details
- 📈 Monitor event performance
- ❌ Cancel eligible bookings
- 🚫 Cancel eligible events

---

# ⚛️ Technology Stack

EventON is a **React-based frontend application**.

| Technology | Purpose |
|---|---|
| ⚛️ React.js | Frontend UI and component architecture |
| ⚡ Vite | Development server and production build tool |
| 🎨 Tailwind CSS | Styling and responsive layouts |
| 🧭 React Router | Client-side routing |
| 🎯 Lucide React | UI icons |
| 💾 LocalStorage | Current frontend data persistence |
| 🧹 ESLint | Code quality and linting |
| 🟨 JavaScript | Application programming language |

---

# ⚛️ React Architecture

EventON follows a component-based React architecture.

```text
                    ⚛️ React Application
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
      Components           Pages             Layouts
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
                 Context          Utilities
                    │                 │
                    ▼                 ▼
             Authentication      Storage Logic
```

The application is organized into:

- 🧩 Reusable components
- 📄 Page-level components
- 🏗️ Layout components
- 🔐 React Context
- 💾 Storage utilities
- 🛡️ Route protection

---

# 📁 Project Structure

```text
EventON/
│
├── 📁 public/
│
├── 📁 src/
│   │
│   ├── 📁 components/
│   │   │
│   │   ├── 📁 bookings/
│   │   │   ├── BookingCard.jsx
│   │   │   ├── BookingEmptyState.jsx
│   │   │   ├── BookingStatus.jsx
│   │   │   └── ...
│   │   │
│   │   ├── 📁 common/
│   │   │   ├── RoleRoute.jsx
│   │   │   ├── ScrollToTop.jsx
│   │   │   └── ...
│   │   │
│   │   ├── 📁 events/
│   │   │   ├── EventCard.jsx
│   │   │   ├── CategorySection.jsx
│   │   │   ├── FeaturedEvents.jsx
│   │   │   ├── UpcomingEvents.jsx
│   │   │   └── ...
│   │   │
│   │   ├── 📁 home/
│   │   │   ├── WhyEventON.jsx
│   │   │   ├── OrganizerCTA.jsx
│   │   │   └── ...
│   │   │
│   │   └── 📁 layout/
│   │       ├── Navbar.jsx
│   │       └── Footer.jsx
│   │
│   ├── 📁 context/
│   │   └── AuthContext.jsx
│   │
│   ├── 📁 data/
│   │   ├── events.js
│   │   └── bookings.js
│   │
│   ├── 📁 layouts/
│   │   ├── AppLayout.jsx
│   │   └── DashboardLayout.jsx
│   │
│   ├── 📁 pages/
│   │   │
│   │   ├── 📁 public/
│   │   │   ├── Home.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── About.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Careers.jsx
│   │   │   ├── HelpCenter.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   └── TermsConditions.jsx
│   │   │
│   │   ├── 📁 auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── 📁 authenticated/
│   │   │   ├── Booking.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── MyBookingDetails.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── EditProfile.jsx
│   │   │
│   │   ├── 📁 management/
│   │   │   ├── Events.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── BookingDetails.jsx
│   │   │   └── EventDetails.jsx
│   │   │
│   │   ├── 📁 organizer/
│   │   │   ├── OrganizerDashboard.jsx
│   │   │   ├── OrganizerEvents.jsx
│   │   │   ├── CreateEvent.jsx
│   │   │   ├── EditEvent.jsx
│   │   │   └── ...
│   │   │
│   │   └── 📁 admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminUsers.jsx
│   │       ├── AdminUserDetails.jsx
│   │       ├── AdminEvents.jsx
│   │       ├── AdminEventDetails.jsx
│   │       ├── AdminBookings.jsx
│   │       └── AdminBookingDetails.jsx
│   │
│   ├── 📁 services/
│   │   └── bookingService.js
│   │
│   ├── 📁 utils/
│   │   ├── bookingStorage.js
│   │   └── eventStorage.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── 📄 .gitignore
├── 📄 eslint.config.js
├── 📄 index.html
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 README.md
└── 📄 vite.config.js
```

> 📌 The project structure can evolve as development continues and unused modules are removed or reorganized.

---

# 🧭 Application Routing

EventON uses **React Router** for client-side navigation.

## 🌐 Public Routes

```text
/
├── /events
├── /events/:id
├── /about
├── /contact
├── /careers
├── /help-center
├── /privacy-policy
└── /terms-and-conditions
```

---

## 🔐 Authentication Routes

```text
/login
/register
```

---

## 👤 Attendee Routes

```text
/events/:id/book
/booking-confirmation
/my-bookings
/my-bookings/:bookingId
/profile
/profile/edit
```

---

## 🎤 Organizer Routes

```text
/organizer/dashboard
/organizer/events
/organizer/events/create
/organizer/events/:id
/organizer/events/:id/edit
/organizer/bookings
/organizer/bookings/:bookingId
```

---

## 🛡️ Admin Routes

```text
/admin/dashboard
/admin/users
/admin/users/:userId
/admin/events
/admin/events/:id
/admin/bookings
/admin/bookings/:bookingId
```

---

# 🔐 Authentication & Authorization

EventON uses a React Context-based authentication system.

Main authentication logic is handled through:

```text
src/context/AuthContext.jsx
```

The authentication system manages:

- 🔑 Login
- 📝 Registration
- 🚪 Logout
- 👤 Current user
- 🔄 User restoration
- ✏️ Profile updates
- ✅ Registration validation

---

## 👥 User Roles

EventON supports three major roles:

```text
👤 Attendee
🎤 Organizer
🛡️ Admin
```

Role-based access is controlled through:

```text
RoleRoute.jsx
```

### Role Flow

```text
                    🔐 Authentication
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
        👤 Attendee    🎤 Organizer    🛡️ Admin
            │              │              │
            ▼              ▼              ▼
       My Bookings    Organizer       Admin
       Profile        Dashboard       Dashboard
       Booking        Events          Users
                      Bookings        Events
                                      Bookings
```

---

# 💾 Data Persistence

The current EventON frontend uses **Browser LocalStorage** for data persistence.

### 👤 Current User

```text
eventon_user
```

### 👥 Accounts

```text
eventon_accounts
```

### 📅 Events

```text
eventon_events
```

### 🎟️ Bookings

```text
eventon_bookings
```

> ⚠️ LocalStorage is currently used as the frontend persistence layer. It is suitable for this project's current frontend/prototype architecture but should be replaced by a secure backend database for production use.

---

# 📅 Event Data Flow

```text
🎤 Organizer
      │
      ▼
➕ Create Event
      │
      ▼
eventStorage.js
      │
      ▼
💾 LocalStorage
      │
      ▼
📅 EventON Events
      │
 ┌────┼───────────────┐
 ▼    ▼               ▼
Home Events      Organizer      Admin
                Dashboard     Dashboard
```

---

# 🎟️ Booking Data Flow

```text
👤 Attendee
     │
     ▼
📅 Event Details
     │
     ▼
🎟️ Book Tickets
     │
     ▼
bookingStorage.js
     │
     ▼
💾 LocalStorage
     │
 ┌───┼───────────────┐
 ▼   ▼               ▼
My Bookings     Organizer       Admin
               Bookings        Bookings
```

---

# 🔄 Live Data Synchronization

EventON uses browser events to keep different pages synchronized.

### 📅 Event Updates

```javascript
EVENTS_UPDATED_EVENT
```

### 🎟️ Booking Updates

```javascript
BOOKINGS_UPDATED_EVENT
```

Pages can listen for these events and refresh their data when changes occur.

The application also uses the browser:

```javascript
storage
```

event to respond to LocalStorage changes from another browser tab.

---

# 🎫 Booking & Seat Management

EventON maintains consistency between:

- 🎟️ Tickets sold
- 🪑 Booked seats
- 🪑 Available seats
- 💰 Revenue
- 📋 Booking records

The core seat rule is:

```text
Booked Seats <= Event Capacity
```

Available seats:

```text
Available Seats = Capacity - Booked Seats
```

The system also ensures:

```text
0 <= Booked Seats <= Capacity
```

---

## ➕ Booking Flow

When a booking is created:

```text
🎟️ Booking Created
       │
       ▼
📈 Booked Seats Increase
       │
       ▼
📉 Available Seats Decrease
```

---

## ❌ Cancellation Flow

When an eligible booking is cancelled:

```text
❌ Booking Cancelled
       │
       ▼
📉 Booked Seats Decrease
       │
       ▼
📈 Available Seats Increase
```

---

## 🔄 Cancellation Rollback

If the booking update fails after seats have been changed:

```text
Decrease Seats
      │
      ▼
Update Booking
      │
      ▼
   ❌ Failed
      │
      ▼
Restore Seats
```

This prevents the event from keeping an incorrect seat count.

---

# 📅 Event Lifecycle

EventON uses four main event lifecycle statuses:

### 🟢 Upcoming

The event has not started yet.

### 🔵 Ongoing

The current time is between the event's start and end time.

### ⚫ Completed

The event's end time has passed.

### 🔴 Cancelled

The event has been cancelled.

---

## 🎟️ Sold Out

**Sold Out is an availability state rather than a lifecycle status.**

An event becomes sold out when:

```text
Booked Seats >= Capacity
```

Therefore:

```text
Lifecycle:
🟢 Upcoming
🔵 Ongoing
⚫ Completed
🔴 Cancelled

Availability:
🟢 Available
🟠 Sold Out
```

---

# 🎟️ Booking Status

The shared booking status component is:

```text
src/components/bookings/BookingStatus.jsx
```

Supported booking statuses:

```text
🟡 Upcoming
🔵 Ongoing
🟢 Completed
🔴 Cancelled
```

The displayed booking lifecycle does not use:

```text
❌ Confirmed
❌ Pending
```

---

# 📅 Event Creation

Organizers can create an event using:

- 📝 Event title
- 📄 Description
- 🏷️ Category
- 📅 Date
- 🕐 Start time
- 🕐 End time
- 📍 Location
- 🌆 City
- 👥 Capacity
- 💰 Ticket price
- 🖼️ Image URL
- ⭐ Featured option

### ✅ Validation

Required event information must be provided.

### 📝 Description

Maximum:

```text
150 words
```

### 🖼️ Image

The image field supports HTTP/HTTPS image URLs.

> ℹ️ A normal webpage URL is not necessarily a direct image resource. An `<img>` element requires an image resource URL or a supported image endpoint.

---

# ✏️ Event Editing

Organizers can edit their events through the edit-event interface.

The edit interface follows the same design approach as the create-event interface.

Editable information includes:

- 📝 Title
- 📄 Description
- 🏷️ Category
- 📅 Date
- 🕐 Start time
- 🕐 End time
- 📍 Location
- 🌆 City
- 👥 Capacity
- 💰 Ticket price
- 🖼️ Image
- ⭐ Featured option

---

# 📊 Dashboards

## 🎤 Organizer Dashboard

The organizer dashboard provides event and booking information such as:

```text
📅 Total Events
🎟️ Tickets Sold
💰 Revenue
🟢 Upcoming Events
🔵 Ongoing Events
⚫ Completed Events
🔴 Cancelled Events
📋 Recent Bookings
📅 Recent Events
📈 Event Performance
```

---

## 🛡️ Admin Dashboard

The admin dashboard provides platform-level information such as:

```text
👥 Users
📅 Events
🎟️ Bookings
💰 Revenue
📋 Recent Bookings
📅 Recent Events
📈 Event Performance
```

---

# 📈 Event Performance

Event performance information can include:

- 🎟️ Tickets sold
- 💰 Revenue
- 📊 Booking percentage
- 👥 Event capacity
- 📅 Event status

The dashboard includes an event performance section for events with active bookings.

---

# 🎨 UI / UX

EventON follows a clean, modern dashboard-oriented interface.

## 🎨 Visual Style

```text
⬜ White
⬛ Slate / Dark Text
🟧 Orange Primary
🟢 Emerald Success
🔵 Blue Information
🔴 Red Cancellation
🟡 Amber Upcoming
```

## ✨ UI Characteristics

- ✨ Clean cards
- 🔲 Rounded corners
- 🌫️ Soft shadows
- 🎨 Consistent status colors
- 📱 Responsive layouts
- 🧩 Reusable components
- 🖱️ Interactive states
- 🔍 Search and filtering
- 📊 Dashboard statistics
- 🪟 Confirmation modals
- 📭 Empty states

---

# 📱 Responsive Design

EventON is designed for:

- 💻 Desktop
- 💻 Laptop
- 📱 Mobile
- 📲 Tablet

Tailwind CSS responsive utilities are used throughout the application.

Responsive areas include:

- 🧭 Navigation
- 🎫 Event cards
- 📊 Dashboard cards
- 🔎 Search filters
- 📝 Forms
- 📋 Tables
- 🎟️ Booking pages
- 🪟 Modals
- 📱 Management pages

---

# 🧩 Reusable Components

EventON uses reusable React components for common functionality.

Examples include:

```text
BookingCard
BookingEmptyState
BookingStatus
EventCard
CategorySection
FeaturedEvents
UpcomingEvents
RoleRoute
ScrollToTop
Navbar
Footer
```

Reusable components help maintain:

- 🎨 UI consistency
- 🧹 Cleaner code
- ♻️ Code reuse
- 🔧 Easier maintenance

---

# 🗂️ Important Utility Modules

## 📅 eventStorage.js

Responsible for event persistence and event-related operations.

Examples include:

```javascript
getStoredEvents()
getStoredEventById()
getStoredEventsByOrganizer()
createStoredEvent()
updateStoredEvent()
incrementEventSeats()
decrementEventSeats()
updateEventSeats()
```

---

## 🎟️ bookingStorage.js

Responsible for booking persistence and booking-related operations.

Examples include:

```javascript
getStoredBookings()
createStoredBooking()
updateStoredBooking()
```

---

## 🔐 AuthContext.jsx

Responsible for authentication state and user management.

---

# 🧠 Application Architecture

```text
                         ⚛️ React Application
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
        🌐 Public UI        🔐 Authentication      📊 Dashboards
             │                    │                    │
             │                    ▼              ┌─────┴─────┐
             │               AuthContext         │           │
             │                                  🎤          🛡️
             │                               Organizer     Admin
             │
             ▼
        📅 Events
             │
             ▼
        📄 Event Details
             │
             ▼
        🎟️ Booking
             │
             ▼
        💾 Storage Layer
             │
       ┌─────┴─────┐
       ▼           ▼
eventStorage   bookingStorage
       │           │
       └─────┬─────┘
             ▼
       💾 LocalStorage
```

---

# 🛠️ Installation

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/hruthvikthota23/EventON.git
```

---

## 2️⃣ Navigate to the Project

```bash
cd EventON
```

---

## 3️⃣ Install Dependencies

```bash
npm install
```

---

## 4️⃣ Start the Development Server

```bash
npm run dev
```

The Vite development server will provide the local application URL in the terminal.

Usually:

```text
http://localhost:5173
```

---

# 🧹 Run ESLint

To check the project for lint errors and warnings:

```bash
npm run lint
```

ESLint helps identify:

- ❌ Unused variables
- ⚠️ Hook dependency issues
- 🧹 Code-quality problems
- 🧩 React-related lint problems

---

# 🏗️ Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# 🧪 Recommended Testing Flow

## 👤 Attendee Testing

```text
Register
   ↓
Login
   ↓
Browse Events
   ↓
Search Event
   ↓
Filter Event
   ↓
View Event Details
   ↓
Book Tickets
   ↓
Booking Confirmation
   ↓
My Bookings
   ↓
Booking Details
   ↓
Cancel Upcoming Booking
```

---

## 🎤 Organizer Testing

```text
Login
   ↓
Organizer Dashboard
   ↓
Create Event
   ↓
My Events
   ↓
Event Details
   ↓
Edit Event
   ↓
View Bookings
   ↓
Booking Details
   ↓
Manage Event
```

---

## 🛡️ Admin Testing

```text
Login
   ↓
Admin Dashboard
   ↓
Users
   ↓
User Details
   ↓
Events
   ↓
Event Details
   ↓
Bookings
   ↓
Booking Details
```

---

# 🔄 Event Lifecycle Testing

## Normal Lifecycle

```text
🟢 Upcoming
      │
      ▼
🔵 Ongoing
      │
      ▼
⚫ Completed
```

## Cancellation

```text
🟢 Upcoming
      │
      ▼
🔴 Cancelled
```

## Sold Out

```text
🟢 Upcoming
      │
      ▼
🎟️ Booked Seats = Capacity
      │
      ▼
🟠 Sold Out
```

---

# 🐛 Development & Bug-Tracking Areas

During development, important areas include:

## 🔐 Authentication

- Login redirect
- Registration
- Role-based routing
- User restoration
- Logout
- Profile updates

## 🧭 Navigation

- Public routes
- Protected routes
- Organizer routes
- Admin routes
- Back navigation
- Route redirects

## 📅 Events

- Event creation
- Event editing
- Event cancellation
- Event status calculation
- Event capacity
- Sold-out calculation
- Search
- Filtering

## 🎟️ Bookings

- Booking creation
- Ticket quantity
- Booking status
- Booking cancellation
- Seat rollback
- Booking details
- Booking filtering

## 🔄 Data Flow

- Event storage
- Booking storage
- Cross-page updates
- LocalStorage synchronization
- Custom browser events

## 🎨 UI

- Responsive layouts
- Dashboard consistency
- Search
- Filters
- Dropdowns
- Modals
- Empty states
- Status indicators

---

# 📌 Important Development Rules

## 1️⃣ No Draft Event Status

EventON uses the following event lifecycle statuses:

```text
Upcoming
Ongoing
Completed
Cancelled
```

Draft is not part of the displayed event lifecycle.

---

## 2️⃣ Sold Out Is an Availability State

Sold Out represents ticket availability rather than event lifecycle.

```text
Booked Seats >= Capacity
```

---

## 3️⃣ Booking Status

The application uses:

```text
Upcoming
Ongoing
Completed
Cancelled
```

for displayed booking status.

---

## 4️⃣ Use Storage Utilities

Components should use the centralized storage utilities:

```text
eventStorage.js
bookingStorage.js
```

instead of creating separate LocalStorage implementations.

---

## 5️⃣ Seat Consistency

Always maintain:

```text
0 <= bookedSeats <= capacity
```

---

## 6️⃣ Cancellation Rollback

If seat count is changed before a booking cancellation and the booking update fails, the seat count must be restored.

---

## 7️⃣ Organizer Data Isolation

Organizers should only manage:

```text
Their own events
Their own event bookings
```

---

## 8️⃣ Admin Access

Admins can manage platform-level:

```text
Users
Events
Bookings
```

---

## 9️⃣ Shared Components

Common functionality should use shared components such as:

```text
BookingStatus
EventCard
BookingCard
RoleRoute
```

rather than creating duplicate versions.

---

## 🔟 ESLint

Lint issues should be fixed instead of disabling ESLint rules.

Run:

```bash
npm run lint
```

---

# 📊 Role Permissions

| Feature | 👤 Attendee | 🎤 Organizer | 🛡️ Admin |
|---|:---:|:---:|:---:|
| Browse Events | ✅ | ✅ | ✅ |
| Search Events | ✅ | ✅ | ✅ |
| View Event Details | ✅ | ✅ | ✅ |
| Book Tickets | ✅ | ❌ | ❌ |
| View Own Bookings | ✅ | ❌ | ❌ |
| Cancel Own Booking | ✅ | ❌ | ❌ |
| Create Event | ❌ | ✅ | ❌ |
| Edit Own Event | ❌ | ✅ | ❌ |
| Manage Own Events | ❌ | ✅ | ❌ |
| View Own Event Bookings | ❌ | ✅ | ❌ |
| Organizer Dashboard | ❌ | ✅ | ❌ |
| Manage Users | ❌ | ❌ | ✅ |
| Manage All Events | ❌ | ❌ | ✅ |
| Manage All Bookings | ❌ | ❌ | ✅ |
| Admin Dashboard | ❌ | ❌ | ✅ |

---

# 🔮 Future Improvements

The current project is primarily a frontend implementation. A future full-stack version can introduce additional infrastructure.

## 🖥️ Backend

Potential future additions:

- 🟢 Node.js
- 🚂 Express.js
- 🗄️ MySQL / PostgreSQL
- 🌐 REST APIs
- 🔐 JWT authentication
- 🛡️ Server-side authorization

---

## 💳 Payments

Potential future additions:

- 💳 Online ticket payment
- 💰 Payment verification
- 🔄 Refund processing
- 🧾 Payment history

---

## 🎟️ Digital Tickets

Potential future additions:

- 📱 QR-code tickets
- 📄 Ticket downloads
- 📧 Email tickets
- 🔍 Ticket verification

---

## ☁️ Event Images

Potential future additions:

- 📤 Image upload
- ☁️ Cloud image storage
- 🖼️ Image optimization
- 🗂️ Media management

---

## 📧 Notifications

Potential future additions:

- 📩 Booking confirmation emails
- ⏰ Event reminders
- ❌ Cancellation notifications
- 🎤 Organizer notifications

---

## 📊 Advanced Analytics

Potential future additions:

- 📈 Revenue analytics
- 📊 Booking trends
- 👥 Attendance analytics
- 🎟️ Ticket sales reports
- 📅 Event performance reports

---

# 🏗️ Future Full-Stack Architecture

A future production architecture could follow:

```text
                 ⚛️ React Frontend
                        │
                        ▼
                   🌐 REST API
                        │
                        ▼
              🟢 Node.js / Express
                        │
                        ▼
                    🗄️ Database
                        │
             ┌──────────┼──────────┐
             │          │          │
             ▼          ▼          ▼
           Users      Events     Bookings
```

Additional services could include:

```text
💳 Payment Gateway
☁️ Cloud Storage
📧 Email Service
🔔 Notification Service
🎟️ QR Ticket Service
```

---

# 🎯 Project Goals

## 🎫 For Attendees

Provide a simple way to:

```text
Discover → View → Book → Manage
```

events and bookings.

---

## 🎤 For Organizers

Provide a complete workflow:

```text
Create → Manage → Monitor → Analyze
```

events and bookings.

---

## 🛡️ For Administrators

Provide centralized management:

```text
Users → Events → Bookings → Analytics
```

---

## 💻 For Development

Build a maintainable React application using:

- ⚛️ Component-based architecture
- 🧩 Reusable components
- 🧭 Client-side routing
- 🔐 Role-based access
- 💾 Centralized storage utilities
- 📱 Responsive UI
- 🧹 Clean code practices

---

# 📌 Current Architecture

The current EventON implementation is primarily a **React + Vite frontend application using LocalStorage as its persistence mechanism**.

This architecture is suitable for:

- 🎓 Academic projects
- 💼 Portfolio projects
- 🧪 Frontend demonstrations
- 🎨 UI/UX development
- 🚀 Prototype development

For production deployment with multiple users and secure data management, a backend and database should be introduced.

---

# 🌐 Repository

## 🔗 GitHub

**EventON Repository:**

https://github.com/hruthvikthota23/EventON

---

# 👨‍💻 Developer

## Hruthvik Thota

🎓 Computer Science / AI & ML  
💻 React.js Developer  
🚀 Building EventON

---

# ⭐ EventON

```text
              🎫 EVENTON

        Discover • Create • Manage

              📅 Events
              🎟️ Bookings
              👥 Users
              📊 Analytics
              🔐 Role-Based Access

                  ⚛️
             Built with React
```

---

# 📜 License

This project is currently developed for **educational, portfolio, and development purposes**.

A formal open-source license can be added when the project is ready for public distribution.
