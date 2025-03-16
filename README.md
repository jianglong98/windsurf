# Quality Massage LLC Booking Website

This project is a massage booking website built with Node.js, Express, EJS templating, and an SQLite database using Sequelize ORM. It provides a complete solution for Quality Massage LLC to manage bookings, services, and business hours.

## Business Information

- **Name**: Quality Massage LLC
- **Address**: 12229 Voyager Pkwy #160, Colorado Springs, CO 80921
- **Phone**: (719) 900-8424
- **Email**: yilinzhang1969@gmail.com

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

## Admin Login

The admin login functionality provides secure access to the admin dashboard. To access the admin area:

1. Navigate to `/admin/login` or click on the "Admin Login" link in the navigation bar
2. Enter the admin credentials (email: admin@example.com, password: admin123)
3. Upon successful login, you'll be redirected to the admin dashboard

The admin dashboard provides access to:
- Today's bookings and pending bookings overview
- Services management (add, edit, view services)
- Business hours management
- All bookings with filtering options

## Testing

The project includes automated tests for the admin functionality:

1. Install Puppeteer (if not already installed):
   ```bash
   npm install puppeteer
   ```

2. Run the admin login test:
   ```bash
   node test-admin-login.js
   ```

This test verifies:
- Admin login functionality
- Access to the admin dashboard
- Navigation to services and business hours pages
- Logout functionality

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
│   ├── admin.js           # Admin routes
│   ├── bookings.js        # Booking routes
│   └── services.js        # Service routes
├── views/                 # EJS templates
│   ├── partials/          # Reusable template parts
│   ├── admin/             # Admin views
│   ├── bookings/          # Booking views
│   └── services/          # Service views
├── public/                # Static assets
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side JavaScript
│   └── img/               # Images
├── middleware/            # Custom middleware
├── utils/                 # Utility functions
├── test/                  # Test files
├── seed.js                # Database seeder
├── test-admin-login.js    # Admin login test script
├── .env                   # Environment variables
└── package.json           # Project dependencies
```

## API Endpoints

### Public Endpoints
- `GET /` - Home page
- `GET /services` - List all active services
- `GET /booking` - Booking form
- `POST /booking` - Create a new booking
- `GET /about` - About page
- `GET /contact` - Contact page
- `POST /contact` - Submit contact form

### Admin Endpoints
- `GET /admin/login` - Admin login page
- `POST /admin/login` - Admin login authentication
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/bookings` - All bookings
- `GET /admin/services` - Manage services
- `POST /admin/services` - Add new service
- `GET /admin/business-hours` - Business hours management
- `POST /admin/business-hours/:id` - Update business hours
- `GET /admin/logout` - Admin logout

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- Email notifications for booking confirmations
- SMS reminders for upcoming appointments
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

## Contact

Project Link: [https://github.com/jianglong98/windsurf](https://github.com/jianglong98/windsurf)
