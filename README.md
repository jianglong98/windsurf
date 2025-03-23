# Quality Massage LLC Booking Website

This project is a massage booking website built with Node.js, Express, EJS templating, and an SQLite database using Sequelize ORM. It provides a complete solution for Quality Massage LLC to manage bookings, services, and business hours.

## Business Information

- **Name**: Quality Massage LLC
- **Address**: 12229 Voyager Pkwy #160, Colorado Springs, CO 80921
- **Phone**: (719) 930-9548
- **Email**: yilinzhang1969@gmail.com

## Services

### FOOT MASSAGE
- 30 minutes .............................. $30.00
- 60 minutes .............................. $55.00

### COMBO MASSAGE
- 30 minutes foot 30 minutes body ....... $60.00
- 30 minutes foot 60 minutes body ....... $85.00

### BODY MASSAGE
- 30 minutes full body massage .......... $40.00
- 60 minutes full body massage .......... $65.00
- 90 minutes full body massage .......... $90.00

## Features

### User Features
- Browse available massage services with detailed descriptions, pricing, and images
- Book appointments by selecting service, date, and available time slots
- Visual service selection with images to enhance the booking experience
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
  - Email: yilinzhang1969@gmail.com
  - Password: admin123

## Admin Login

The admin login functionality provides secure access to the admin dashboard. To access the admin area:

1. Navigate to `/admin/login` or click on the "Admin Login" link in the footer
2. Enter the admin credentials (email: yilinzhang1969@gmail.com, password: admin123)
3. You will be redirected to the admin dashboard where you can manage bookings, services, and business hours

## Project Structure

```
windsurf/
├── app.js               # Main application entry point
├── models/              # Database models (Sequelize)
│   ├── index.js         # Database connection and model associations
│   ├── user.js          # User model
│   ├── service.js       # Service model
│   ├── booking.js       # Booking model
│   └── businessHours.js # Business hours model
├── public/              # Static assets
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
│   └── img/             # Images
├── routes/              # Route handlers
│   ├── index.js         # Main routes
│   ├── booking.js       # Booking routes
│   ├── admin.js         # Admin routes
│   └── api.js           # API routes for AJAX requests
├── views/               # EJS templates
│   ├── partials/        # Reusable template parts
│   │   ├── header.ejs   # Page header
│   │   └── footer.ejs   # Page footer
│   ├── admin/           # Admin area templates
│   │   ├── dashboard.ejs # Admin dashboard
│   │   ├── bookings.ejs  # Bookings management
│   │   └── services.ejs  # Services management
│   ├── index.ejs        # Homepage
│   ├── booking.ejs      # Booking form
│   ├── contact.ejs      # Contact page
│   └── about.ejs        # About page
├── seed.js              # Database seeder
├── test-admin-login.js  # Admin login test script
├── fix-admin.js         # Admin account fix script
├── .env.example         # Example environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies
├── migrations/          # Database migrations
│   └── add-service-images.js # Migration to add image URLs to services
├── update-service-images.js # Script to update service images
└── README.md            # Project documentation
```

## API Endpoints

### Public Endpoints
- `GET /` - Homepage
- `GET /services` - View all active services
- `GET /booking` - Booking form
- `POST /booking` - Create a new booking
- `GET /about` - About page
- `GET /contact` - Contact page
- `POST /contact` - Submit contact form

### Admin Endpoints
- `GET /admin/login` - Admin login page
- `POST /admin/login` - Admin login process
- `GET /admin/dashboard` - Admin dashboard
- `GET /admin/bookings` - Manage bookings
- `GET /admin/services` - Manage services
- `GET /admin/business-hours` - Manage business hours
- `POST /admin/logout` - Admin logout

## Development

### Running Tests
```bash
npm test
```

### Testing Admin Login
```bash
node test-admin-login.js
```

### Fixing Admin Account
If you encounter issues with the admin login, you can reset the admin account:
```bash
node fix-admin.js
```

## Maintenance

### Updating Business Information
Business information (name, address, phone, email) is stored as global variables in `app.js` for easy maintenance.

## License
This project is licensed under the MIT License.
