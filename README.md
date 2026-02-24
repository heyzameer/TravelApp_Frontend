# TravelApp Frontend Ecosystem

Welcome to the **TravelApp Frontend** repository. This directory contains the complete frontend ecosystem for the TravelApp platform, featuring a customer-facing portal, an administrative dashboard, and a partner management interface.

## 🌏 Live Links

- **Main Website**: [www.letsgoto.in](https://www.letsgoto.in/)
- **Admin Dashboard**: [admin.letsgoto.in](https://admin.letsgoto.in/admin/dashboard)
- **Partner Dashboard**: [partner.letsgoto.in](https://partner.letsgoto.in/partner/dashboard)

---

## 🏗 Project Architecture

The frontend is divided into three specialized applications, each serving a distinct part of the travel ecosystem:

### 1. 🚀 Main Website (`travel_hub_next`)
The primary gateway for travelers to discover and book their next adventure.

- **Purpose**: Customer-facing booking and discovery platform.
- **Key Features**:
  - **Discovery**: Browse destinations, activities, and travel packages.
  - **Search & Filter**: Find properties and adventures based on preferences.
  - **Booking System**: Seamless checkout and payment workflow.
  - **User Portal**: Wishlists, profile management, and booking history.
  - **Responsive Design**: Mobile-first approach for travelers on the go.
- **Tech Stack**:
  - **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
  - **Styling**: Tailwind CSS
  - **Animations**: Framer Motion
  - **Maps**: Leaflet & React Leaflet
  - **Icons**: Lucide React
  - **Notifications**: Sonner

### 2. 🛡 Admin Dashboard (`admin`)
The central nervous system for platform administrators to manage the entire TravelApp ecosystem.

- **Purpose**: Internal operations and management.
- **Key Features**:
  - **Analytics**: Real-time business insights and booking trends using Recharts.
  - **Management**: Oversee users, partners, and properties.
  - **Booking Control**: Detailed tracking and management of all platform bookings.
  - **Real-time Sync**: Live updates via Socket.io for immediate operational awareness.
  - **Map Integration**: Visualizing property locations and delivery partner tracking.
- **Tech Stack**:
  - **Framework**: [React 19](https://react.dev/) (Vite)
  - **State Management**: Redux Toolkit & Redux Persist
  - **Routing**: React Router 7
  - **Styling**: Tailwind CSS 4
  - **Charts**: Recharts
  - **Communication**: Socket.io Client

### 3. 🤝 Partner Dashboard (`partner_web`)
An empowering tool for travel partners to manage their inventory and interact with the platform.

- **Purpose**: Vendor/Partner inventory and booking management.
- **Key Features**:
  - **Inventory Management**: Create and manage properties, rooms, and activities.
  - **Availability Calendar**: Manage room inventory and seasonal pricing.
  - **Order Fulfillment**: Track and manage guest bookings and requests.
  - **Invoicing**: Generate PDF invoices for guests and financial tracking.
  - **PWA**: Progressive Web App support for efficient mobile management.
- **Tech Stack**:
  - **Framework**: [React 19](https://react.dev/) (Vite)
  - **State Management**: Redux Toolkit
  - **Styling**: Tailwind CSS 4
  - **Utilities**: html2canvas & jsPDF for document generation
  - **PWA**: Vite PWA Plugin

---

## 🛠 Shared Technical Foundation

Across all projects, we maintain high standards of code quality and developer experience:

- **Language**: [TypeScript](https://www.typescriptlang.org/) for robust type safety.
- **API Communication**: [Axios](https://axios-http.com/) with centralized service layers.
- **Icons**: [Lucide React](https://lucide.dev/) for a consistent, modern icon system.
- **Mapping**: [Leaflet](https://leafletjs.com/) for lightweight, customizable map experiences.
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation.

---

## 🔗 Backend Integration

This frontend ecosystem connects to a robust Node.js/Express backend.
- **Backend Repository**: [server_3.0](https://github.com/heyzameer/server_3.0/tree/main)

---

## 🚦 Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- npm or yarn

### Installation
Clone the repository and install dependencies in each project:

```bash
# For Main Website
cd travel_hub_next
npm install

# For Admin Dashboard
cd admin
npm install

# For Partner Dashboard
cd partner_web
npm install
```

### Running Locally
```bash
# Run development server
npm run dev
```
