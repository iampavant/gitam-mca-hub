// Run ONCE after schema.sql: node seed.js
// This adds all 55 students + staff with correct password hashes
require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const STUDENT_NAMES = [
  "Aarav Sharma","Aditya Verma","Akash Reddy","Akshay Kumar","Amaan Khan",
  "Amit Patel","Ananya Singh","Anjali Gupta","Ankit Yadav","Ankita Joshi",
  "Arjun Nair","Aryan Mishra","Bhavna Saxena","Chirag Shah","Deepak Tiwari",
  "Deepika Pandey","Divya Mehta","Farhan Siddiqui","Gaurav Jain","Harini Krishnan",
  "Harsh Agarwal","Ishaan Bose","Isha Malhotra","Jay Patel","Jyoti Rao",
  "Karan Kapoor","Kavya Nambiar","Khushi Dubey","Kunal Sinha","Lakshmi Iyer",
  "Manish Chauhan","Meera Pillai","Mohammed Irfan","Mohit Bansal","Nandini Kulkarni",
  "Nikhil Srivastava","Nilufar Rashid","Nishanth Kumar","Pooja Desai","Priya Venkat",
  "Rahul Chowdhury","Rajan Menon","Rakesh Bhat","Riya Agrawal","Rohan Joshi",
  "Sahil Hussain","Sakshi Tripathi","Sameer Ansari","Sandesh Patil","Shreya Dutta",
  "Siddharth Rao","Sneha Nair","Tanvi Bhatt","Vikas Tomar","Zara Qureshi",
];

const STAFF = [
  { name:"Super Admin",  username:"admin",   password:"admin@123",  role:"admin",   subject:"",    first_login:false },
  { name:"Ravi Kumar",   username:"cr_ravi", password:"cr@123",     role:"cr",      subject:"",    first_login:false },
  { name:"Prof. Sharma", username:"sharma",  password:"teach@123",  role:"teacher", subject:"DSA", first_login:true  },
  { name:"Prof. Meena",  username:"meena",   password:"meena@123",  role:"teacher", subject:"DBMS",first_login:true  },
  { name:"Prof. Kapoor", username:"kapoor",  password:"kapoor@123", role:"teacher", subject:"CN",  first_login:true  },
];

async function seed() {
  console.log("🚀 Starting seed...\n");

  // Delete existing users
  await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("🗑  Cleared existing users");

  // Seed staff
  for (const s of STAFF) {
    const hashed = await bcrypt.hash(s.password, 10);
    const { error } = await supabase.from("users").insert([{ ...s, password: hashed, roll: "" }]);
    if (error) console.error(`❌ Staff error (${s.username}):`, error.message);
    else console.log(`✅ Staff: ${s.name} (${s.username})`);
  }

  // Seed 55 students
  console.log("\n📚 Seeding 55 students...");
  for (let i = 0; i < STUDENT_NAMES.length; i++) {
    const roll = `MCA${String(i + 1).padStart(3, "0")}`;
    const hashed = await bcrypt.hash(roll, 10); // default password = roll number
    const { error } = await supabase.from("users").insert([{
      name: STUDENT_NAMES[i], username: roll, roll,
      password: hashed, role: "student", subject: "", first_login: true
    }]);
    if (error) console.error(`❌ Student error (${roll}):`, error.message);
    else process.stdout.write(`✅ ${roll} `);
  }

  console.log("\n\n🎉 Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👑 Admin:      admin    / admin@123");
  console.log("🎓 CR:         cr_ravi  / cr@123");
  console.log("👨‍🏫 Teacher:   sharma   / teach@123");
  console.log("🧑‍💻 Student:   MCA001   / MCA001");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  process.exit(0);
}

seed().catch(err => { console.error("Fatal:", err); process.exit(1); });
