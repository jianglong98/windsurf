# Massage Booking Website

This project is a massage booking website built with Node.js, Express, EJS templating, and an SQLite database using Sequelize ORM. It provides a complete solution for massage businesses to manage bookings, services, and business hours.

## Features

### User Features
- Browse available massage services with detailed descriptions and pricing
- Book appointments by selecting service, date, and available time slots
- View and manage personal bookings
- Contact form for inquiries and feedback
- Responsive design for mobile and desktop devices

### Admin Features
- Secure admin dashboard with authentication
- Manage massage services (add, edit, deactivate)
- View and manage all bookings (confirm, cancel, reschedule)
- Set business hours for each day of the week
- View analytics on bookings and popular services
- Filter bookings by date range and status

## Tech Stack
- **Backend**: Node.js, Express.js
- **Frontend**: EJS templates, Bootstrap 5, JavaScript
- **Database**: SQLite with Sequelize ORM
- **Authentication**: Session-based with bcrypt password hashing
- **Testing**: Jest, Puppeteer for E2E testing, Supertest for API testing

## Screenshots

### Home Page
![Home Page](https://via.placeholder.com/800x400?text=Home+Page)

### Booking Form
![Booking Form](https://via.placeholder.com/800x400?text=Booking+Form)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x400?text=Admin+Dashboard)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jianglong98/windsurf.git
   cd windsurf
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   SESSION_SECRET=your_session_secret_here
   DB_PATH=./database.sqlite
   PORT=3000
   ```

4. Set up the database and seed initial data:
   ```bash
   npm run seed
   ```

5. Run the application:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. Access the application at `http://localhost:3000`

## Default Accounts

After seeding the database, you can use these accounts:

- **Admin Account**:
  - Email: admin@example.com
  - Password: admin123

- **User Account**:
  - Email: john@example.com
  - Password: password123

## Project Structure

```
massage-booking/
├── app.js                 # Main application entry point
├── models/                # Database models
│   ├── index.js           # Sequelize initialization
│   ├── user.js            # User model
│   ├── service.js         # Service model
│   ├── booking.js         # Booking model
│   └── businessHours.js   # Business hours model
├── routes/                # Route handlers
│   ├── index.js           # Main routes
│   ├── booking.js         # Booking routes
│   └── admin.js           # Admin routes
├── views/                 # EJS templates
│   ├── partials/          # Reusable template parts
│   ├── admin/             # Admin views
│   └── booking/           # Booking views
├── public/                # Static assets
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side JavaScript
│   └── img/               # Images
├── seeders/               # Database seeders
├── tests/                 # Test files
│   ├── models/            # Model tests
│   ├── routes/            # Route tests
│   └── e2e/               # End-to-end tests
└── .env                   # Environment variables
```

## Automated Testing

The project includes automated tests to ensure functionality across all pages:

```bash
# Run all tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test suite
npm test -- tests/booking.test.js
```

## Development

To run the application in development mode with automatic restart:

```bash
npm run dev
```

## API Endpoints

### Public Endpoints
- `GET /` - Home page
- `GET /services` - View all services
- `GET /about` - About page
- `GET /contact` - Contact page
- `GET /booking` - Booking form
- `POST /booking` - Submit booking

### Admin Endpoints
- `GET /admin/login` - Admin login page
- `POST /admin/login` - Admin login authentication
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/services` - Manage services
- `POST /admin/services` - Add new service
- `POST /admin/services/:id` - Update service
- `GET /admin/bookings` - View all bookings
- `POST /admin/bookings/:id/status` - Update booking status
- `GET /admin/business-hours` - Manage business hours
- `POST /admin/business-hours/:id` - Update business hours

## Future Enhancements

- User registration and login system
- Email notifications for booking confirmations
- Online payment integration
- Calendar view for bookings
- Staff management with individual schedules
- Multi-language support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
