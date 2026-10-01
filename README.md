# 🎫 EventON --- Event Management System

> A modern, responsive, role-based event management web application
> built with React.js, Vite and Tailwind CSS.

**EventON** is a frontend event management platform for discovering
events, booking tickets, managing bookings, creating events, and
managing users/events through separate attendee, organizer, and admin
workflows.

🌐 **Live Application:** https://eventon-iota.vercel.app/\
💻 **GitHub Repository:** https://github.com/hruthvikthota23/EventON

------------------------------------------------------------------------

## ✨ Project Overview

EventON provides three main role-based experiences:

``` text
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

### Main Goals

-   🎫 Discover and book events
-   📅 Manage event lifecycle and availability
-   🎤 Give organizers tools to create and manage their own events
-   🛡️ Give admins platform-level management
-   🔐 Protect routes by user role
-   🎟️ Keep ticket and seat counts synchronized
-   📊 Provide dashboard statistics and event performance information
-   📱 Provide a responsive UI
-   🧩 Use reusable React components and centralized storage utilities
-   🚀 Deploy the frontend as a production Vite application

------------------------------------------------------------------------

# 👥 User Roles

## 👤 Attendee

Attendees can:

-   Browse public events
-   Search and filter events
-   View event details
-   Book tickets
-   View booking confirmation
-   View and search their bookings
-   Filter bookings by status
-   View booking details
-   Cancel eligible upcoming bookings
-   View and edit their profile

## 🎤 Organizer

Organizers can:

-   Access the organizer dashboard
-   Create events
-   View and search their events
-   Filter events
-   View event details
-   Edit/manage their events
-   View bookings for their own events
-   View booking details
-   Cancel eligible bookings
-   Cancel eligible events
-   Monitor ticket sales, seats and event performance

## 🛡️ Admin

Admins can:

-   Access the admin dashboard
-   Manage users
-   View user details
-   Manage all events
-   View event details
-   Manage all bookings
-   View booking details
-   Cancel eligible bookings
-   Cancel eligible events
-   Monitor platform statistics and event performance

------------------------------------------------------------------------

# 🚀 Core Features

## 🌐 Public Experience

-   Home page
-   Event discovery
-   Event search
-   Category filtering
-   Location filtering
-   Event details
-   Event availability
-   About
-   Contact
-   Careers
-   Help Center
-   Privacy Policy
-   Terms & Conditions

## 🔐 Authentication

-   Login
-   Registration
-   User session restoration
-   Role-based route protection
-   Logout
-   Profile management
-   Profile editing

## 🎟️ Booking System

-   Ticket quantity selection
-   Booking confirmation
-   Booking details
-   My Bookings
-   Booking search
-   Booking status filters
-   Booking cancellation
-   Ticket/seat count updates
-   Seat rollback when a cancellation update fails
-   Event availability updates

## 📅 Event Management

-   Create event
-   Edit event
-   Event search
-   Event filters
-   Category information
-   Location information
-   Capacity management
-   Booked-seat tracking
-   Sold-out handling
-   Event cancellation
-   Dynamic event lifecycle status

## 📊 Dashboards

### Organizer Dashboard

Includes:

-   Event statistics
-   Booking statistics
-   Ticket information
-   Revenue information
-   Recent bookings
-   Recent events
-   Event performance information

### Admin Dashboard

Includes:

-   User statistics
-   Event statistics
-   Booking statistics
-   Revenue information
-   Recent bookings
-   Recent events
-   Top event performance information

------------------------------------------------------------------------

# 🔄 Event Lifecycle

EventON uses these displayed event lifecycle statuses:

``` text
🟡 Upcoming
      │
      ▼
🔵 Ongoing
      │
      ▼
🟢 Completed
```

An event can also become:

``` text
🔴 Cancelled
```

### Sold Out

**Sold Out is an availability state, not a lifecycle status.**

``` text
Booked Seats >= Capacity
        ↓
     Sold Out
```

There is no displayed **Draft** event status in the current application.

------------------------------------------------------------------------

# 🎟️ Booking Lifecycle

Displayed booking statuses are:

``` text
Upcoming
Ongoing
Completed
Cancelled
```

Cancellation is available only when the booking is eligible for
cancellation, such as an upcoming booking.

When a booking is cancelled, the related event's booked-seat count is
reduced.

The storage logic also supports rollback if the booking update fails
after the seat count has already been changed.

------------------------------------------------------------------------

# 🧠 Data Flow

The current EventON version is a **frontend application using browser
LocalStorage** as its persistence mechanism.

``` text
                    React UI
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
     AuthContext     Pages      Components
          │            │            │
          └────────────┼────────────┘
                       │
              Storage Utilities
                 ┌─────┴─────┐
                 │           │
                 ▼           ▼
          eventStorage   bookingStorage
                 │           │
                 └─────┬─────┘
                       ▼
                  LocalStorage
```

### Main LocalStorage Keys

  Key                      Purpose
  ------------------------ --------------------------------------------
  `eventon_user`           Current logged-in user/session
  `eventon_accounts`       Registered account data
  `eventon_events`         Stored event data
  `eventon_bookings`       Stored booking data
  `eventon_data_version`   Clean-data initialization/version tracking

### Important

Because the current application uses LocalStorage:

-   Data is stored in the user's browser.
-   Data is not shared between different browsers/devices.
-   Clearing site/browser storage removes the stored data.
-   This version does not use a backend database.
-   The architecture is suitable for a frontend project, prototype,
    portfolio project and demonstration.

For a real multi-user production platform, EventON would need a backend
and database.

------------------------------------------------------------------------

# 🏗️ React Architecture

``` text
                     ⚛️ React Application
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
      Components            Pages              Layouts
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
             AuthContext             Storage Utilities
                 │                         │
                 ▼                    ┌────┴────┐
            RoleRoute              Events    Bookings
```

The application uses:

-   Reusable components
-   Page-level components
-   Layout components
-   React Context
-   Centralized LocalStorage utilities
-   Protected role-based routes
-   Shared management pages for Admin and Organizer

------------------------------------------------------------------------

# 📁 Project Structure

``` text
EventON/
│
├── public/
│
├── src/
│   │
│   ├── components/
│   │   ├── bookings/
│   │   │   ├── BookingCard.jsx
│   │   │   ├── BookingEmptyState.jsx
│   │   │   └── BookingStatus.jsx
│   │   │
│   │   ├── common/
│   │   │   ├── RoleRoute.jsx
│   │   │   └── ScrollToTop.jsx
│   │   │
│   │   ├── events/
│   │   │   ├── CategorySection.jsx
│   │   │   ├── EventCard.jsx
│   │   │   ├── FeaturedEvents.jsx
│   │   │   └── UpcomingEvents.jsx
│   │   │
│   │   ├── home/
│   │   │   ├── HomeHero.jsx
│   │   │   ├── OrganizerCTA.jsx
│   │   │   └── WhyEventON.jsx
│   │   │
│   │   └── layout/
│   │       ├── Footer.jsx
│   │       └── Navbar.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── data/
│   │   └── events.js
│   │
│   ├── layouts/
│   │   ├── AppLayout.jsx
│   │   └── DashboardLayout.jsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── Home.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── Careers.jsx
│   │   │   ├── HelpCenter.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   └── TermsConditions.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── authenticated/
│   │   │   ├── Booking.jsx
│   │   │   ├── BookingConfirmation.jsx
│   │   │   ├── EditProfile.jsx
│   │   │   ├── MyBookingDetails.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── management/
│   │   │   ├── ManagementBookingDetails.jsx
│   │   │   ├── ManagementBookings.jsx
│   │   │   ├── ManagementEventDetails.jsx
│   │   │   └── ManagementEvents.jsx
│   │   │
│   │   ├── organizer/
│   │   │   ├── CreateEvent.jsx
│   │   │   └── OrganizerDashboard.jsx
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminUserDetails.jsx
│   │       └── AdminUsers.jsx
│   │
│   ├── utils/
│   │   ├── bookingStorage.js
│   │   ├── dataInitialization.js
│   │   └── eventStorage.js
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── vercel.json
└── vite.config.js
```

------------------------------------------------------------------------

# 🧭 Application Routes

EventON uses React Router.

## 🌐 Public / General Routes

``` text
/
├── /events
├── /events/:id
├── /events/:id/book
├── /booking-confirmation
├── /about
├── /contact
├── /careers
├── /help-center
├── /privacy-policy
└── /terms
```

## 🔐 Authentication Routes

``` text
/login
/register
```

## 👤 Authenticated User Routes

``` text
/profile
/profile/edit
/my-bookings
/my-bookings/:bookingId
```

## 🎤 Organizer Routes

Protected for the `organizer` role:

``` text
/organizer
/organizer/events
/organizer/events/create
/organizer/events/:id
/organizer/bookings
/organizer/bookings/:bookingId
/organizer/profile
```

## 🛡️ Admin Routes

Protected for the `admin` role:

``` text
/admin
/admin/users
/admin/users/:userId
/admin/events
/admin/events/:id
/admin/bookings
/admin/bookings/:bookingId
/admin/profile
```

------------------------------------------------------------------------

# 🔐 Role-Based Access

`RoleRoute.jsx` is used to protect organizer and admin routes.

``` text
                  User
                   │
                   ▼
                RoleRoute
                   │
          ┌────────┴────────┐
          │                 │
      Organizer            Admin
          │                 │
          ▼                 ▼
   Organizer Routes    Admin Routes
```

The management pages are shared where the workflows are common:

``` text
ManagementEvents
ManagementEventDetails
ManagementBookings
ManagementBookingDetails
```

The current application therefore avoids maintaining separate duplicate
implementations for the same management workflows.

------------------------------------------------------------------------

# 💾 Storage Layer

## Event Storage

`src/utils/eventStorage.js` manages:

-   Reading events
-   Saving events
-   Creating events
-   Updating events
-   Deleting events
-   Finding events
-   Organizer event filtering
-   Featured events
-   Available seats
-   Sold-out state
-   Updating booked seats
-   Incrementing booked seats
-   Decrementing booked seats
-   Initializing event data
-   Clearing stored events

Main storage key:

``` text
eventon_events
```

## Booking Storage

`src/utils/bookingStorage.js` manages:

-   Reading bookings
-   Finding bookings
-   User bookings
-   Attendee bookings
-   Event bookings
-   Saving bookings
-   Updating bookings
-   Removing bookings
-   Cancelling bookings
-   Clearing bookings

Main storage key:

``` text
eventon_bookings
```

## Data Initialization

`src/utils/dataInitialization.js` handles the clean-data foundation and
migration version.

It uses:

``` text
eventon_data_version
```

and removes legacy storage keys when a new clean-data migration version
is introduced.

------------------------------------------------------------------------

# 🎟️ Seat Management

EventON keeps the seat relationship within:

``` text
0 <= bookedSeats <= capacity
```

### Booking

``` text
Available Seats
      ↓
Book Tickets
      ↓
Increase bookedSeats
      ↓
Recalculate availability
```

### Cancellation

``` text
Booking Cancellation
      ↓
Decrease bookedSeats
      ↓
Recalculate availability
      ↓
Sold Out can become available again
```

### Failed Update Rollback

If seat data is changed before a booking update and the booking update
fails, the seat change is rolled back to keep event and booking data
consistent.

------------------------------------------------------------------------

# 📊 Dashboard Data

Dashboards calculate information from the stored events and bookings.

Examples include:

-   Total events
-   Upcoming events
-   Ongoing events
-   Completed events
-   Cancelled events
-   Sold-out events
-   Total bookings
-   Tickets sold
-   Revenue
-   Recent bookings
-   Recent events
-   Event performance

The admin dashboard also includes top event performance information.

------------------------------------------------------------------------

# 🎨 UI & UX

The project focuses on:

-   Responsive layouts
-   Consistent dashboard styling
-   Reusable cards
-   Search interfaces
-   Status filters
-   Dropdowns
-   Confirmation modals
-   Empty states
-   Status badges
-   Responsive navigation
-   Event availability indicators
-   Clear booking flows

The interface uses **Lucide React** icons and **Tailwind CSS** utility
classes.

------------------------------------------------------------------------

# 🛠️ Technology Stack

  Technology       Purpose
  ---------------- -----------------------------------------
  React 19         UI and component architecture
  Vite 8           Development server and production build
  Tailwind CSS 4   Styling and responsive UI
  React Router 7   Client-side routing
  Lucide React     Icons
  JavaScript       Application language
  LocalStorage     Current browser-side persistence
  ESLint           Linting and code quality
  Vercel           Production deployment
  Git / GitHub     Version control

------------------------------------------------------------------------

# 📦 Installation

## 1. Clone the repository

``` bash
git clone https://github.com/hruthvikthota23/EventON.git
```

## 2. Enter the project

``` bash
cd EventON
```

## 3. Install dependencies

``` bash
npm install
```

## 4. Start development

``` bash
npm run dev
```

Vite will provide the local development URL, normally:

``` text
http://localhost:5173
```

------------------------------------------------------------------------

# 🧹 Linting

Run:

``` bash
npm run lint
```

This checks the project using ESLint.

------------------------------------------------------------------------

# 🏗️ Production Build

Create a production build:

``` bash
npm run build
```

Vite generates the production files inside:

``` text
dist/
```

Preview the production build locally:

``` bash
npm run preview
```

------------------------------------------------------------------------

# 🚀 Deployment

EventON is deployed on **Vercel**.

🌐 Live application:

https://eventon-iota.vercel.app/

The project includes a `vercel.json` rewrite configuration for React
Router SPA navigation:

``` json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This allows direct navigation and browser refreshes on client-side
routes to be handled by the React application.

------------------------------------------------------------------------

# 🧪 Recommended Testing Flow

## 👤 Attendee

``` text
Register
   ↓
Login
   ↓
Browse Events
   ↓
Search / Filter
   ↓
View Event
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

## 🎤 Organizer

``` text
Login
   ↓
Organizer Dashboard
   ↓
Create Event
   ↓
Manage Events
   ↓
View Event
   ↓
Edit / Cancel Event
   ↓
View Bookings
   ↓
Manage Booking
```

## 🛡️ Admin

``` text
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

------------------------------------------------------------------------

# 📌 Important Development Rules

### 1. No displayed Draft status

The current event lifecycle is:

``` text
Upcoming
Ongoing
Completed
Cancelled
```

### 2. Sold Out is availability

Sold Out is calculated from ticket availability and is not treated as a
lifecycle status.

### 3. Centralized storage

Use:

``` text
eventStorage.js
bookingStorage.js
```

for event and booking persistence instead of creating separate
LocalStorage implementations.

### 4. Seat consistency

Maintain:

``` text
0 <= bookedSeats <= capacity
```

### 5. Organizer isolation

Organizers should manage only:

``` text
Their own events
Their own event bookings
```

### 6. Admin access

Admins have platform-level management access to:

``` text
Users
Events
Bookings
```

### 7. Shared components

Reuse common components such as:

``` text
BookingStatus
EventCard
BookingCard
RoleRoute
```

when functionality is shared.

### 8. Keep lint clean

Run:

``` bash
npm run lint
```

before committing significant changes.

### 9. Verify production builds

Run:

``` bash
npm run build
```

before deployment.

------------------------------------------------------------------------

# 📊 Role Permissions

  Feature                    👤 Attendee   🎤 Organizer   🛡️ Admin
  ------------------------- ------------- -------------- ----------
  Browse Events                  ✅             ✅           ✅
  Search Events                  ✅             ✅           ✅
  View Event Details             ✅             ✅           ✅
  Book Tickets                   ✅            ---          ---
  View Own Bookings              ✅            ---          ---
  Cancel Own Booking             ✅            ---          ---
  Create Events                  ---            ✅          ---
  Edit Own Events                ---            ✅          ---
  Manage Own Events              ---            ✅          ---
  View Own Event Bookings        ---            ✅          ---
  Organizer Dashboard            ---            ✅          ---
  Manage Users                   ---           ---           ✅
  Manage All Events              ---           ---           ✅
  Manage All Bookings            ---           ---           ✅
  Admin Dashboard                ---           ---           ✅

------------------------------------------------------------------------

# 🐛 Important Problem Areas Addressed

During development, EventON required work across several connected
areas:

### Authentication

-   Login and registration flow
-   User restoration
-   Role-based routing
-   Profile updates
-   Logout handling

### Navigation

-   Public routes
-   Authenticated routes
-   Organizer routes
-   Admin routes
-   Back navigation
-   Route redirects
-   React Router refresh handling

### Events

-   Event creation
-   Event editing
-   Event cancellation
-   Event lifecycle calculation
-   Capacity handling
-   Sold-out calculation
-   Search and filtering
-   Dynamic date/time handling

### Bookings

-   Ticket quantity
-   Booking creation
-   Booking status
-   Booking cancellation
-   Seat updates
-   Seat rollback
-   Booking details
-   Booking filtering

### Data Flow

-   Event storage
-   Booking storage
-   Authentication storage
-   Cross-page updates
-   Browser storage events
-   Custom application update events

### UI

-   Dashboard consistency
-   Responsive layouts
-   Dropdown behavior
-   Search
-   Filters
-   Modals
-   Empty states
-   Status indicators

------------------------------------------------------------------------

# 🗺️ Current Development State

The current EventON version is a deployed frontend application.

``` text
React
  ↓
Vite
  ↓
Tailwind CSS
  ↓
LocalStorage
  ↓
Vercel
```

It is suitable for:

-   🎓 Academic demonstration
-   💼 Portfolio presentation
-   🧪 Frontend prototyping
-   🧩 React practice
-   🚀 Learning through building and debugging

The current version does **not** provide a shared server-side database.

------------------------------------------------------------------------

# 🔮 Future Improvements

The next major architectural step is a full-stack implementation.

## 🖥️ Backend

Potential stack:

``` text
React Frontend
      ↓
REST API
      ↓
Node.js / Express
      ↓
MySQL / PostgreSQL
```

Potential backend features:

-   Server-side authentication
-   Secure password hashing
-   JWT/session management
-   Server-side authorization
-   Persistent users
-   Persistent events
-   Persistent bookings
-   Shared data between devices

## 💳 Payments

Potential additions:

-   Online ticket payments
-   Payment verification
-   Refund processing
-   Payment history

## 🎟️ Digital Tickets

Potential additions:

-   QR-code tickets
-   Ticket downloads
-   Email tickets
-   Ticket verification

## ☁️ Media

Potential additions:

-   Image uploads
-   Cloud image storage
-   Image optimization
-   Media management

## 📧 Notifications

Potential additions:

-   Booking confirmation emails
-   Event reminders
-   Cancellation notifications
-   Organizer notifications

## 📊 Advanced Analytics

Potential additions:

-   Revenue analytics
-   Booking trends
-   Attendance analytics
-   Ticket sales reports
-   Event performance reports

------------------------------------------------------------------------

# 🏗️ Future Full-Stack Architecture

``` text
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
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
            Users        Events      Bookings
```

Additional services can later be connected:

``` text
💳 Payment Gateway
☁️ Cloud Storage
📧 Email Service
🔔 Notification Service
🎟️ QR Ticket Service
```

------------------------------------------------------------------------

# 📚 Learning Outcomes

Building EventON provided practical experience with:

-   React component architecture
-   React Router
-   Protected routes
-   Role-based access
-   React Context
-   LocalStorage persistence
-   CRUD-style event management
-   Booking workflows
-   Seat management
-   State synchronization
-   Responsive UI development
-   Tailwind CSS
-   ESLint
-   Git and GitHub
-   Vite production builds
-   Vercel deployment
-   Debugging and refactoring

------------------------------------------------------------------------

# 💻 Development Philosophy

EventON was built through an iterative development process:

``` text
Think
  ↓
Build
  ↓
Test
  ↓
Break
  ↓
Debug
  ↓
Understand
  ↓
Fix
  ↓
Refactor
  ↓
Deploy
```

The project is an example of learning by building: features were
developed, tested, debugged, refined and eventually deployed as a
working web application.

------------------------------------------------------------------------

# 🌐 Project Links

### Live Application

https://eventon-iota.vercel.app/

### GitHub Repository

https://github.com/hruthvikthota23/EventON

------------------------------------------------------------------------

# 👨‍💻 Developer

## Hruthvik Thota

Computer Science / AI & ML

Built with:

``` text
⚛️ React
⚡ Vite
🎨 Tailwind CSS
🧭 React Router
💾 LocalStorage
🐙 GitHub
▲ Vercel
```

------------------------------------------------------------------------

# 🎫 EventON

``` text
              🎫 EVENTON

       Discover • Book • Manage

             📅 Events
             🎟️ Bookings
             👥 Users
             📊 Dashboards
             🔐 Role-Based Access

              Built with React
```

------------------------------------------------------------------------

# 📜 License

This project is currently intended for educational, portfolio and
development purposes.

A formal open-source license can be added if the project is later
distributed as an open-source application.
