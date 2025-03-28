const AWS = require('aws-sdk');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configure AWS SDK
const apiGateway = new AWS.APIGateway({ region: 'us-east-1' });
const route53 = new AWS.Route53();
const acm = new AWS.ACM({ region: 'us-east-1' });

const domainName = 'qualitymassage.otalkie.com';
const basePath = '';
const stage = 'prod';

async function setupDomain() {
  try {
    console.log('Setting up custom domain...');
    
    // Step 1: Check if certificate exists
    console.log('Checking for existing SSL certificate...');
    const certificates = await acm.listCertificates().promise();
    let certificateArn = null;
    
    for (const cert of certificates.CertificateSummaryList) {
      if (cert.DomainName === domainName || cert.DomainName === `*.${domainName.split('.').slice(1).join('.')}`) {
        certificateArn = cert.CertificateArn;
        console.log(`Found existing certificate: ${certificateArn}`);
        break;
      }
    }
    
    if (!certificateArn) {
      console.log('No existing certificate found. Please request a certificate in ACM first.');
      console.log('Visit AWS Console > Certificate Manager > Request certificate');
      console.log(`Request a certificate for: ${domainName}`);
      console.log('After certificate validation, run this script again.');
      return;
    }
    
    // Step 2: Create custom domain name in API Gateway
    try {
      console.log('Creating custom domain in API Gateway...');
      await apiGateway.createDomainName({
        domainName: domainName,
        certificateArn: certificateArn,
        endpointConfiguration: {
          types: ['EDGE']
        },
        securityPolicy: 'TLS_1_2'
      }).promise();
      console.log('Custom domain created successfully!');
    } catch (error) {
      if (error.code === 'ConflictException') {
        console.log('Custom domain already exists.');
      } else {
        throw error;
      }
    }
    
    // Step 3: Get API ID
    console.log('Getting API ID...');
    const apis = await apiGateway.getRestApis().promise();
    const api = apis.items.find(api => api.name === 'quality-massage-booking-prod');
    
    if (!api) {
      console.log('API not found. Deploy your API first using Serverless Framework.');
      return;
    }
    
    const apiId = api.id;
    console.log(`Found API ID: ${apiId}`);
    
    // Step 4: Create base path mapping
    try {
      console.log('Creating base path mapping...');
      await apiGateway.createBasePathMapping({
        domainName: domainName,
        restApiId: apiId,
        stage: stage,
        basePath: basePath
      }).promise();
      console.log('Base path mapping created successfully!');
    } catch (error) {
      if (error.code === 'ConflictException') {
        console.log('Base path mapping already exists.');
      } else {
        throw error;
      }
    }
    
    // Step 5: Get domain name target
    const domainInfo = await apiGateway.getDomainName({ domainName }).promise();
    const distributionDomainName = domainInfo.distributionDomainName;
    
    console.log(`\nDomain setup complete!`);
    console.log(`\nNext steps:`);
    console.log(`1. Create a DNS record in Route 53 or your DNS provider:`);
    console.log(`   - Type: CNAME`);
    console.log(`   - Name: ${domainName}`);
    console.log(`   - Value: ${distributionDomainName}`);
    console.log(`2. Wait for DNS propagation (may take up to 24-48 hours)`);
    console.log(`3. Your API will be available at: https://${domainName}`);
    
  } catch (error) {
    console.error('Error setting up domain:', error);
  }
}

setupDomain();
