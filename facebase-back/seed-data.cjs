/**
 * Seed Test Data Script - CommonJS version
 * Creates test Brand and Task directly in MongoDB
 */

const mongoose = require('mongoose');
require('dotenv').config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Define schemas
const BrandSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  long_description: { type: String },
  location: { type: String, required: true },
  theme: { type: String, required: true },
  image: { type: String },
  platform: { type: String, required: true },
  promoted: { type: Boolean, default: false },
  status: { type: String, default: 'active' }
}, { timestamps: true });

const TaskSchema = new mongoose.Schema({
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  brand_avatar: { type: String },
  title: { type: String, required: true },
  description: { type: String, required: true },
  briefing: { type: String },
  subscribers: { type: Number },
  reward: { type: Number, required: true },
  reward_total: { type: Number, required: true },
  deadline: { type: Date, required: true },
  rules: [{
    text: { type: String, required: true }
  }],
  steps: [{
    step_number: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true, enum: ['form', 'file_upload', 'link', 'report'] },
    required: { type: Boolean, default: true },
    fields: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      label: { type: String, required: true },
      required: { type: Boolean, default: false },
      options: [{ type: String }]
    }]
  }],
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
}, { timestamps: true });

async function seedData() {
  console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}    FaceBase API - Seeding Test Data${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/facebase?authSource=admin';
    console.log(`${colors.cyan}Connecting to MongoDB...${colors.reset}`);
    await mongoose.connect(mongoUri);
    console.log(`${colors.green}✓ Connected to MongoDB${colors.reset}\n`);

    // Get or create models
    const Brand = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
    const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

    // Check if test data already exists
    const existingBrand = await Brand.findOne({ title: "Test Tech Brand" });
    if (existingBrand) {
      console.log(`${colors.yellow}⚠ Test brand already exists, deleting old data...${colors.reset}`);
      await Task.deleteMany({ brand: existingBrand._id });
      await Brand.deleteOne({ _id: existingBrand._id });
      console.log(`${colors.green}✓ Old test data cleaned up${colors.reset}\n`);
    }

    // Step 1: Create Brand
    console.log(`${colors.cyan}Step 1:${colors.reset} Creating test brand...`);
    
    const brandData = {
      title: "Test Tech Brand",
      description: "A test brand for API testing",
      long_description: "This is a comprehensive test brand created for automated API testing purposes.",
      location: "moscow",
      theme: "gadgets",
      image: "https://via.placeholder.com/400x300",
      platform: "Telegram",
      status: "active",
      promoted: true
    };

    const brand = await Brand.create(brandData);
    console.log(`${colors.green}✓ Brand created:${colors.reset} ${brand.title}`);
    console.log(`  ID: ${colors.yellow}${brand._id}${colors.reset}`);

    // Step 2: Create Task
    console.log(`\n${colors.cyan}Step 2:${colors.reset} Creating test task with steps...`);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7); // Deadline in 7 days

    const taskData = {
      brand: brand._id,
      brand_avatar: brand.image,
      title: "Test Marketing Campaign",
      description: "Complete this test marketing campaign by following all steps",
      briefing: "# Test Campaign Brief\n\n## Objective\nTest the task submission flow\n\n## Requirements\n- Fill out form\n- Upload required files\n- Submit links",
      subscribers: 1000,
      reward: 500,
      reward_total: 5000,
      deadline: tomorrow,
      rules: [
        { text: "Complete all steps in order" },
        { text: "Provide accurate information" },
        { text: "Submit within deadline" }
      ],
      steps: [
        {
          step_number: 1,
          title: "Personal Information",
          description: "Fill out your basic information",
          type: "form",
          required: true,
          fields: [
            {
              name: "firstName",
              type: "text",
              label: "First Name",
              required: true
            },
            {
              name: "email",
              type: "email",
              label: "Email Address",
              required: true
            },
            {
              name: "experience",
              type: "select",
              label: "Experience Level",
              required: true,
              options: ["Beginner", "Intermediate", "Advanced"]
            }
          ]
        },
        {
          step_number: 2,
          title: "Upload Content",
          description: "Upload your promotional content",
          type: "file_upload",
          required: true,
          fields: [
            {
              name: "contentFile",
              type: "file",
              label: "Content File",
              required: true
            },
            {
              name: "description",
              type: "textarea",
              label: "Content Description",
              required: false
            }
          ]
        },
        {
          step_number: 3,
          title: "Submit Links",
          description: "Provide links to your published content",
          type: "link",
          required: true,
          fields: [
            {
              name: "postUrl",
              type: "url",
              label: "Post URL",
              required: true
            },
            {
              name: "notes",
              type: "textarea",
              label: "Additional Notes",
              required: false
            }
          ]
        }
      ],
      status: "active"
    };

    const task = await Task.create(taskData);
    console.log(`${colors.green}✓ Task created:${colors.reset} ${task.title}`);
    console.log(`  ID: ${colors.yellow}${task._id}${colors.reset}`);
    console.log(`  Steps: ${colors.cyan}${task.steps.length}${colors.reset}`);
    console.log(`  Reward: ${colors.cyan}${task.reward}${colors.reset} per completion`);
    console.log(`  Deadline: ${colors.cyan}${task.deadline.toLocaleDateString()}${colors.reset}`);

    // Summary
    console.log(`\n${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.blue}                    SUMMARY${colors.reset}`);
    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
    
    console.log(`${colors.green}✓ Test data created successfully!${colors.reset}\n`);
    console.log(`Brand ID:  ${colors.yellow}${brand._id}${colors.reset}`);
    console.log(`Task ID:   ${colors.yellow}${task._id}${colors.reset}\n`);
    
    console.log(`${colors.cyan}Test commands:${colors.reset}\n`);
    
    console.log(`1. Test step submission (curl):`);
    console.log(`   curl -X POST "http://localhost:5001/api/tasks/${task._id}/steps/1?userId=test_123" \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"firstName":"John","email":"john@test.com","experience":"Intermediate"}'\n`);
    
    console.log(`2. Run full test suite:`);
    console.log(`   node test-all-endpoints.js\n`);
    
    console.log(`3. View in Admin Panel:`);
    console.log(`   http://localhost:5001/admin\n`);

    console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);

    await mongoose.connection.close();
    console.log(`${colors.cyan}✓ MongoDB connection closed${colors.reset}\n`);
    process.exit(0);

  } catch (error) {
    console.error(`${colors.red}✗ Error:${colors.reset}`, error.message);
    console.error(error.stack);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

seedData();

