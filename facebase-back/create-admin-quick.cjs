/**
 * Quick Admin Creation Script
 * Creates admin@facebase.com with password: admin123
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

async function createAdmin() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}   Creating Admin Account${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  try {
    // Connect to MongoDB
    const mongoUri = 'mongodb://admin:admin123@mongodb:27017/facebase?authSource=admin';
    console.log(`${colors.cyan}Connecting to MongoDB...${colors.reset}`);
    await mongoose.connect(mongoUri);
    console.log(`${colors.green}✓ Connected${colors.reset}\n`);

    // Define Admin schema
    const AdminSchema = new mongoose.Schema({
      email: String,
      password: String,
      role: String
    });

    const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email: 'admin@facebase.com' });
    
    if (existingAdmin) {
      console.log(`${colors.yellow}⚠ Admin already exists!${colors.reset}`);
      console.log(`Email: ${colors.cyan}admin@facebase.com${colors.reset}`);
      console.log(`\n${colors.yellow}Updating password...${colors.reset}`);
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      
      console.log(`${colors.green}✓ Password updated!${colors.reset}\n`);
    } else {
      console.log(`${colors.cyan}Creating new admin...${colors.reset}`);
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const admin = await Admin.create({
        email: 'admin@facebase.com',
        password: hashedPassword,
        role: 'superadmin'
      });
      
      console.log(`${colors.green}✓ Admin created!${colors.reset}\n`);
    }

    // Print credentials
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}`);
    console.log(`${colors.green}    Admin Credentials${colors.reset}`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);
    console.log(`Email:    ${colors.yellow}admin@facebase.com${colors.reset}`);
    console.log(`Password: ${colors.yellow}admin123${colors.reset}`);
    console.log(`Role:     ${colors.yellow}superadmin${colors.reset}\n`);
    console.log(`Login at: ${colors.cyan}http://localhost:8000/admin${colors.reset}\n`);
    console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error(`${colors.red}✗ Error:${colors.reset}`, error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

createAdmin();

