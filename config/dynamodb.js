const AWS = require('aws-sdk');
const dynamoose = require('dynamoose');

// Configure AWS SDK
const isLambda = process.env.NODE_ENV === 'lambda';

if (isLambda) {
  // When running in Lambda, AWS credentials are automatically provided
  console.log('Running in Lambda environment');
} else {
  // For local development, use local credentials
  console.log('Running in local development environment');
  // AWS SDK will use credentials from ~/.aws/credentials or environment variables
}

// Configure Dynamoose
dynamoose.aws.sdk = AWS;

// Use DynamoDB Local for development if needed
if (process.env.NODE_ENV === 'development' && process.env.DYNAMODB_LOCAL === 'true') {
  dynamoose.aws.ddb.local('http://localhost:8000');
}

module.exports = {
  AWS,
  dynamoose
};
