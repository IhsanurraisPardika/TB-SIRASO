const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up TB-SIRASO application...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# Database connection
DATABASE_URL="mysql://root:password@localhost:3306/tb_siraso"

# Session secret
SESSION_SECRET="rahasia-super-aman-untuk-session"

# Server port (optional, defaults to 3000)
PORT=3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env file');
} else {
  console.log('ℹ️  .env file already exists');
}

console.log('\n📋 Setup Instructions:');
console.log('1. Make sure MySQL is running on your system');
console.log('2. Create a database named "tb_siraso"');
console.log('3. Update the DATABASE_URL in .env file with your MySQL credentials');
console.log('4. Run the following commands:');
console.log('   npm install');
console.log('   npx prisma generate');
console.log('   npx prisma db push');
console.log('   npm start');
console.log('\n�� Setup complete!'); 