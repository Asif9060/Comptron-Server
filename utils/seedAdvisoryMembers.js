import mongoose from 'mongoose';
import AdvisoryMember from '../models/AdvisoryMember.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
try {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('MongoDB connected successfully');
} catch (err) {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}

const seedData = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@comptron.edu",
    phone: "+1234567890",
    gender: "female",
    role: "advisor",
    skills: ["Machine Learning", "Artificial Intelligence", "Research Methodology"],
    bio: "Dr. Sarah Johnson is a leading expert in AI and Machine Learning with over 15 years of experience in academia and industry research.",
    socials: {
      linkedin: "https://linkedin.com/in/sarahjohnson",
      github: "https://github.com/drsarah",
      portfolio: "https://sarahjohnson.dev",
      cv: "https://sarahjohnson.dev/cv.pdf"
    },
    customId: "CMAP-1023"
  },
  {
    name: "Prof. Michael Chen",
    email: "michael.chen@comptron.edu",
    phone: "+1234567891",
    gender: "male",
    role: "moderator",
    skills: ["Data Science", "Python", "Deep Learning"],
    bio: "Professor Chen specializes in data science and deep learning applications. He has mentored numerous successful projects and research initiatives.",
    socials: {
      linkedin: "https://linkedin.com/in/michaelchen",
      github: "https://github.com/profchen",
      portfolio: "https://michaelchen.dev"
    },
    customId: "CMAP-1534"
  },
  {
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@comptron.edu",
    phone: "+1234567892",
    gender: "female",
    role: "moderator",
    skills: ["Software Architecture", "System Design", "Cloud Computing"],
    bio: "Dr. Rodriguez brings extensive experience in software architecture and cloud computing. She leads various technical initiatives and mentoring programs.",
    socials: {
      linkedin: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyr",
      cv: "https://emilyrodriguez.dev/cv.pdf"
    },
    customId: "CMAP-1872"
  },
  {
    name: "Dr. James Wilson",
    email: "james.wilson@comptron.edu",
    phone: "+1234567893",
    gender: "male",
    role: "head",
    skills: ["Leadership", "Research Management", "Computer Science Education"],
    bio: "As Department Head, Dr. Wilson oversees all academic programs and research initiatives. He has published extensively in computer science education.",
    socials: {
      linkedin: "https://linkedin.com/in/jameswilson",
      portfolio: "https://jameswilson.edu",
      cv: "https://jameswilson.edu/cv.pdf"
    },
    customId: "HEAD-2049"
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await AdvisoryMember.deleteMany({});

    // Set validity dates for all members (2 years from now)
    const validityDate = new Date();
    validityDate.setFullYear(validityDate.getFullYear() + 2);

    // Add validity date to each member
    const membersWithDates = seedData.map(member => ({
      ...member,
      validityDate
    }));

    // Insert new data
    await AdvisoryMember.insertMany(membersWithDates);
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
