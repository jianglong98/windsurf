# Massage Booking System

A professional web application for managing massage service bookings with a secure admin dashboard.

*Last updated: March 13, 2025*

## Features

### Customer Features
- Browse available massage services
- Book appointments with preferred time slots
- Check service availability in real-time
- Receive booking confirmations
- View service descriptions and pricing

### Admin Features
- Secure admin dashboard with session-based authentication
- Manage massage services (add, edit, delete)
- View and manage bookings
- Set business hours for weekdays and weekends
- Configure special dates and holiday hours
- CSRF protection for enhanced security
- Rate limiting to prevent abuse

## Tech Stack

- **Backend**: Node.js with Express.js
- **View Engine**: EJS templates
- **Database**: SQLite with Sequelize ORM
- **Frontend**: 
  - Bootstrap 5 for responsive UI
  - Custom CSS for styling
  - JavaScript for dynamic interactions
- **Security**:
  - Session-based authentication
  - CSRF protection
  - Rate limiting
  - HTTP-only cookies

## Setup

1. Clone the repository:
```bash
git clone https://github.com/jianglong98/windsurf.git
cd windsurf
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with:
```
SESSION_SECRET=your_session_secret
ADMIN_PASSWORD_HASH=your_admin_password_hash
```

4. Start the server:
```bash
npm start
```

The application will be running at http://localhost:3000

## Project Structure

```
windsurf/
├── app.js              # Application entry point
├── config/             # Configuration files
├── middleware/         # Custom middleware
│   ├── auth.js        # Authentication middleware
│   └── csrf.js        # CSRF protection
├── models/            # Sequelize models
│   ├── booking.js
│   ├── service.js
│   └── businessHours.js
├── routes/            # Express routes
│   ├── index.js      # Public routes
│   └── admin.js      # Admin routes
├── views/            # EJS templates
│   ├── admin/       # Admin views
│   └── partials/    # Reusable components
├── public/          # Static assets
└── database.sqlite  # SQLite database
```

## Admin Access

- URL: http://localhost:3000/admin/login
- Default password: admin123 (change this in production)
- Features accessible:
  - Dashboard: Overview of bookings
  - Services: Manage massage services
  - Business Hours: Set operating hours
  - Logout: Secure session termination

## Security Notes

1. Change the default admin password before deployment
2. Set a strong SESSION_SECRET in production
3. Enable HTTPS in production
4. Regular database backups recommended

## Development

- Run in development mode:
```bash
npm run dev
```

- Linting:
```bash
npm run lint
```

## License

MIT License - See LICENSE file for details