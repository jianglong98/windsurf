# Massage Booking System

A web application for managing massage bookings with an admin dashboard.

## Features

- Book massage appointments
- View available services
- Admin dashboard for booking management
- SQLite database for easy deployment
- Session-based authentication for admin access

## Tech Stack

- Node.js/Express backend
- EJS templating engine
- SQLite database with Sequelize ORM
- Bootstrap 5 for UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The application will be available at http://localhost:3000

## Admin Access

Access the admin dashboard at http://localhost:3000/admin/login
Default password: admin123 (change this in production)

## Project Structure

- `app.js` - Main application entry point
- `config/` - Database configuration
- `models/` - Sequelize models
- `routes/` - Express routes
- `views/` - EJS templates
- `public/` - Static assets
- `database.sqlite` - SQLite database file