# Quality Massage LLC Booking Website

This project is a massage booking website built with Node.js, Express, EJS templating, and an SQLite database using Sequelize ORM. It provides a complete solution for Quality Massage LLC to manage bookings, services, and business hours.

## Business Information

- **Name**: Quality Massage LLC
- **Address**: 12229 Voyager pkwy Northgate Village Unit 160, Colorado Springs, CO 80921
- **Phone**: 7199309548
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

## AWS Lambda Deployment

This application can be deployed to AWS Lambda with API Gateway for a serverless architecture. This approach is ideal for low-to-medium traffic websites with a pay-as-you-go pricing model.

### Prerequisites

- AWS Account
- AWS CLI installed and configured
- Serverless Framework installed globally (`npm install -g serverless`)
- Domain name (qualitymassage.otalkie.com)

### Deployment Steps

1. **Install required packages**:
   ```bash
   npm install serverless-http aws-sdk dynamoose --save
   npm install serverless-offline serverless-domain-manager --save-dev
   ```

2. **Configure AWS credentials**:
   ```bash
   aws configure
   ```
   Enter your AWS Access Key ID, Secret Access Key, region (us-east-1), and output format (json).

3. **Test locally with Serverless Offline**:
   ```bash
   npm run offline
   ```

4. **Create DynamoDB tables**:
   ```bash
   npm run create-tables
   ```

5. **Migrate data from SQLite to DynamoDB**:
   ```bash
   npm run migrate-db
   ```

6. **Deploy to AWS Lambda**:
   ```bash
   npm run deploy
   ```

7. **Set up custom domain**:
   - Request an SSL certificate in AWS Certificate Manager for qualitymassage.otalkie.com
   - Run the domain setup script:
     ```bash
     npm run setup-domain
     ```
   - Create a CNAME record in your DNS provider pointing qualitymassage.otalkie.com to the API Gateway domain

### DNS Configuration

Setting up the proper DNS configuration is crucial for your domain to work with AWS services. Follow these steps carefully:

#### 1. SSL Certificate Setup

1. **Request a certificate in AWS Certificate Manager**:
   ```bash
   aws acm request-certificate --domain-name qualitymassage.otalkie.com --validation-method DNS
   ```
   Or use the AWS Console: Certificate Manager > Request certificate > Public certificate

2. **Get certificate validation details**:
   ```bash
   aws acm describe-certificate --certificate-arn YOUR_CERTIFICATE_ARN
   ```
   Look for the `ResourceRecord` section which contains the Name and Value for DNS validation.

3. **Add certificate validation CNAME record in your DNS provider**:
   - **Host/Name**: Use only the part before your domain (e.g., `_7715cc3f08e1c25b505c794fb2b1d1ec`)
   - **Value**: The validation value (e.g., `_75b865420b85c4a3cfa22c23433af6a5.xlfgrmvvlj.acm-validations.aws`)
   - **TTL**: 3600 seconds (or lowest available)

4. **Wait for certificate validation**:
   - Check validation status with:
     ```bash
     aws acm describe-certificate --certificate-arn YOUR_CERTIFICATE_ARN
     ```
   - Look for "Status": "ISSUED" (can take 30 minutes to 24 hours)

#### 2. API Gateway Custom Domain Setup

1. **Run the domain setup script after certificate validation**:
   ```bash
   node scripts/setup-domain.js
   ```
   This creates a custom domain in API Gateway and maps it to your API.

2. **Get the distribution domain name**:
   - From script output, or
   - Using AWS CLI:
     ```bash
     aws apigateway get-domain-name --domain-name qualitymassage.otalkie.com
     ```
   - Look for the `distributionDomainName` value

3. **Add API Gateway CNAME record in your DNS provider**:
   - **Host/Name**: `qualitymassage`
   - **Value**: The distribution domain name (e.g., `d-abc123xyz.execute-api.us-east-1.amazonaws.com`)
   - **TTL**: 3600 seconds (or lowest available)

4. **Verify DNS propagation**:
   - Use online tools like [whatsmydns.net](https://www.whatsmydns.net/)
   - Check from command line:
     ```bash
     dig CNAME qualitymassage.otalkie.com
     ```

#### 3. DNS Troubleshooting

- **Certificate not validating**: Double-check CNAME record values for typos
- **Domain not resolving**: Ensure DNS propagation has completed (can take 24-48 hours)
- **SSL errors**: Verify certificate is issued and properly associated with API Gateway

### CI/CD Pipeline with GitHub Actions

This project uses GitHub Actions for continuous integration and deployment. When you push to the main branch, the application is automatically deployed to AWS Lambda.

#### 1. GitHub Repository Setup

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for AWS Lambda deployment"
   git push origin main
   ```

2. **Add GitHub Secrets**:
   - Go to your GitHub repository > Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `AWS_ACCESS_KEY_ID`: Your AWS access key
     - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
     - `SESSION_SECRET`: Your session secret for the application
     - `ADMIN_PASSWORD_HASH`: The bcrypt hash of your admin password

#### 2. GitHub Actions Workflow

The workflow file is already configured at `.github/workflows/deploy.yml`. It performs the following steps:

1. **Checkout code** from the repository
2. **Set up Node.js** environment
3. **Install dependencies** with npm ci
4. **Deploy to AWS** using Serverless Framework
5. **Set environment variables** for the Lambda function

#### 3. Monitoring Deployments

- **View deployment status** in the "Actions" tab of your GitHub repository
- **Check deployment logs** for any errors or issues
- **Verify Lambda function** in AWS Console after deployment

#### 4. Manual Deployment

If needed, you can also deploy manually:

```bash
npm run deploy
```

### AWS Resources Created

- **Lambda Function**: Runs the Express.js application
- **API Gateway**: Handles HTTP requests and routes them to Lambda
- **DynamoDB Tables**: Stores services, bookings, and admin data
- **IAM Roles**: Provides necessary permissions
- **CloudWatch Logs**: Captures application logs
- **Certificate Manager**: Manages SSL certificate
- **Custom Domain**: Maps your domain to API Gateway

### Monitoring and Troubleshooting

- **CloudWatch Logs**: Check Lambda function logs
- **API Gateway Dashboard**: Monitor API requests
- **DynamoDB Dashboard**: View database metrics

### Local Development with DynamoDB Local

For local development with DynamoDB:

1. Install DynamoDB Local:
   ```bash
   npm install -g dynamodb-local
   ```

2. Start DynamoDB Local:
   ```bash
   dynamodb-local -port 8000
   ```

3. Set environment variable:
   ```
   DYNAMODB_LOCAL=true
   ```

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
