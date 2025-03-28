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

#### 4. Detailed CNAME Configuration for Squarespace DNS

If you're using Squarespace as your DNS provider, follow these specific steps:

1. **Certificate Validation CNAME Record**:
   - Log in to Squarespace > Settings > Domains > otalkie.com > Advanced settings > DNS Settings
   - Add a new CNAME record:
     - **Host**: `_7715cc3f08e1c25b505c794fb2b1d1ec` (from AWS Certificate Manager)
     - **Value**: `_75b865420b85c4a3cfa22c23433af6a5.xlfgrmvvlj.acm-validations.aws` (from AWS Certificate Manager)
     - **TTL**: 3600 (or lowest available)

2. **API Gateway CNAME Record** (after certificate validation):
   - Add another CNAME record:
     - **Host**: `qualitymassage`
     - **Value**: The distribution domain name from API Gateway
     - **TTL**: 3600 (or lowest available)

> **⚠️ IMPORTANT NOTE:** As of March 27, 2025, the Host CNAME record for `qualitymassage` has not been added to the DNS configuration. This is because we are waiting for the SSL certificate to change from "PENDING_VALIDATION" to "ISSUED" status in AWS Certificate Manager. The certificate validation CNAME record has been added, but validation may take up to 24-48 hours to complete. Once the certificate is validated, we will run the setup-domain.js script to get the distribution domain name and then add the final CNAME record.

## Maintenance

### Updating Business Information
Business information (name, address, phone, email) is stored as global variables in `app.js` for easy maintenance.

### DNS and Domain Management
When making changes to the DNS configuration or domain settings:
1. Always check certificate validation status before running domain setup scripts
2. Keep track of certificate ARNs and expiration dates
3. Monitor DNS propagation after making changes
4. Test the website with HTTPS to ensure SSL is working properly

## License
This project is licensed under the MIT License.
