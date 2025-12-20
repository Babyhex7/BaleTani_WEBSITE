const crypto = require('crypto');

/**
 * Generate a secure JWT secret key
 * Usage: node scripts/generateJwtSecret.js
 */
function generateJwtSecret() {
  const secret = crypto.randomBytes(64).toString('hex');
  
  console.log('\n='.repeat(80));
  console.log('SECURE JWT SECRET GENERATED');
  console.log('='.repeat(80));
  console.log('\nCopy this secret to your .env file:');
  console.log('\nJWT_SECRET=' + secret);
  console.log('\n' + '='.repeat(80));
  console.log('\nIMPORTANT:');
  console.log('1. Add this to your .env file');
  console.log('2. Never commit this secret to version control');
  console.log('3. Use different secrets for development and production');
  console.log('4. Keep this secret safe and secure');
  console.log('='.repeat(80) + '\n');
  
  return secret;
}

generateJwtSecret();
