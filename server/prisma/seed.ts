import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AlmaLink database with authentic MES IMCC data...");

  // 1. Seed Roles
  const roles = [
    { name: "SUPER_ADMIN" },
    { name: "COLLEGE_ADMIN" },
    { name: "CELL_COORDINATOR" },
    { name: "ALUMNI" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
  console.log("✅ Roles seeded (SUPER_ADMIN, COLLEGE_ADMIN, CELL_COORDINATOR, ALUMNI)");

  const roleRecords = await prisma.role.findMany();
  const roleMap = new Map(roleRecords.map((r) => [r.name, r.roleId]));

  // Default Password Hash for seeded test users: "Imcc@2026"
  const defaultPasswordHash = await bcrypt.hash("Imcc@2026", 10);

  // 2. Seed College Administrator (Dr. Anjali Joshi - HOD & Admin)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@imcc.mespune.in" },
    update: {},
    create: {
      roleId: roleMap.get("COLLEGE_ADMIN")!,
      email: "admin@imcc.mespune.in",
      passwordHash: defaultPasswordHash,
      fullName: "Dr. Anjali Joshi",
      phone: "9822012345",
      status: "ACTIVE",
    },
  });
  console.log("✅ College Administrator seeded: Dr. Anjali Joshi (admin@imcc.mespune.in)");

  // 3. Seed College Cells
  const cells = [
    {
      name: "Technical & Co-curricular Cell",
      code: "TECH",
      description: "Organizes coding hackathons, technical symposiums, and software workshops.",
      headStaffId: adminUser.userId,
    },
    {
      name: "Placement & Career Guidance Cell",
      code: "PLACE",
      description: "Coordinates campus placement drives, mock interviews, and career counseling.",
      headStaffId: adminUser.userId,
    },
    {
      name: "Cultural & Arts Cell",
      code: "CULT",
      description: "Coordinates annual college festivals, theatrical, and musical showcases.",
      headStaffId: adminUser.userId,
    },
    {
      name: "Sports & Athletics Cell",
      code: "SPORTS",
      description:
        "Organizes inter-collegiate tournaments, cricket leagues, and fitness initiatives.",
      headStaffId: adminUser.userId,
    },
    {
      name: "Entrepreneurship & Innovation Cell",
      code: "ECELL",
      description: "Incubates student startup ventures and facilitates angel investor sessions.",
      headStaffId: adminUser.userId,
    },
  ];

  for (const cell of cells) {
    await prisma.cell.upsert({
      where: { code: cell.code },
      update: {},
      create: cell,
    });
  }
  console.log("✅ College Cells seeded (TECH, PLACE, CULT, SPORTS, ECELL)");

  const techCell = await prisma.cell.findUnique({ where: { code: "TECH" } });
  const placeCell = await prisma.cell.findUnique({ where: { code: "PLACE" } });

  // 4. Seed Cell Coordinators
  const meeraCoordinator = await prisma.user.upsert({
    where: { email: "meera.tech@imcc.mespune.in" },
    update: {},
    create: {
      roleId: roleMap.get("CELL_COORDINATOR")!,
      email: "meera.tech@imcc.mespune.in",
      passwordHash: defaultPasswordHash,
      fullName: "Prof. Meera Kulkarni",
      phone: "9823156789",
      status: "ACTIVE",
    },
  });

  if (techCell) {
    await prisma.cellCoordinator.upsert({
      where: { userId: meeraCoordinator.userId },
      update: { cellId: techCell.cellId },
      create: {
        cellId: techCell.cellId,
        userId: meeraCoordinator.userId,
      },
    });
  }

  const rajeshCoordinator = await prisma.user.upsert({
    where: { email: "rajesh.place@imcc.mespune.in" },
    update: {},
    create: {
      roleId: roleMap.get("CELL_COORDINATOR")!,
      email: "rajesh.place@imcc.mespune.in",
      passwordHash: defaultPasswordHash,
      fullName: "Prof. Rajesh Patil",
      phone: "9823298765",
      status: "ACTIVE",
    },
  });

  if (placeCell) {
    await prisma.cellCoordinator.upsert({
      where: { userId: rajeshCoordinator.userId },
      update: { cellId: placeCell.cellId },
      create: {
        cellId: placeCell.cellId,
        userId: rajeshCoordinator.userId,
      },
    });
  }
  console.log("✅ Cell Coordinators assigned to cells");

  // 5. Seed Activity Categories
  const categories = [
    { name: "Guest Lecture & Keynote" },
    { name: "Hackathon & Coding Contest" },
    { name: "Mock Interview & Resume Clinic" },
    { name: "Project Mentoring" },
    { name: "Cultural & Sports Judging" },
    { name: "Panel Discussion" },
  ];

  for (const cat of categories) {
    await prisma.activityCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Activity Categories seeded");

  // 6. Seed Configurable Scoring Policies
  const policies = [
    {
      activityType: "Guest Lecture & Keynote",
      defaultPoints: 20,
      description: "Delivering a technical guest session or keynote address to students.",
      updatedById: adminUser.userId,
    },
    {
      activityType: "Hackathon & Coding Contest",
      defaultPoints: 15,
      description: "Judging or evaluating student hackathon submissions and live demos.",
      updatedById: adminUser.userId,
    },
    {
      activityType: "Mock Interview & Resume Clinic",
      defaultPoints: 15,
      description: "Conducting mock placement interviews and providing portfolio feedback.",
      updatedById: adminUser.userId,
    },
    {
      activityType: "Project Mentoring",
      defaultPoints: 10,
      description: "Guiding final year MCA/MBA capstone projects throughout the semester.",
      updatedById: adminUser.userId,
    },
    {
      activityType: "Cultural & Sports Judging",
      defaultPoints: 10,
      description: "Serving as external alumni judge during annual competitions.",
      updatedById: adminUser.userId,
    },
    {
      activityType: "Panel Discussion",
      defaultPoints: 10,
      description: "Participating as industry expert panelist in academic roundtable forums.",
      updatedById: adminUser.userId,
    },
  ];

  for (const policy of policies) {
    await prisma.scoringPolicy.upsert({
      where: { activityType: policy.activityType },
      update: { defaultPoints: policy.defaultPoints },
      create: policy,
    });
  }
  console.log("✅ Scoring Policies seeded");

  // 7. Seed Authentic Pune Alumni Profiles
  const alumniUsers = [
    {
      email: "aarav.deshmukh@persistent.com",
      fullName: "Aarav Deshmukh",
      phone: "9890112233",
      profile: {
        program: "MCA",
        graduationYear: 2018,
        enrollmentNo: "IMCC-MCA-2015-042",
        organization: "Persistent Systems, Pune",
        designation: "Senior Technical Lead",
        industry: "Information Technology",
        linkedinUrl: "https://www.linkedin.com/in/aarav-deshmukh-pune",
        experienceYears: 6,
        skills: ["React", "Node.js", "System Design", "PostgreSQL", "Docker"],
        expertise: ["Cloud Architecture", "Distributed Systems"],
        preferredActivities: ["Hackathon & Coding Contest", "Guest Lecture & Keynote"],
        preferredFormat: "Hybrid",
        availability: "Saturdays & Sunday Mornings",
        willingToParticipate: true,
        consentGiven: true,
        profileCompleted: true,
        verificationStatus: "VERIFIED",
        verifiedById: adminUser.userId,
        verifiedAt: new Date("2024-01-15T10:00:00Z"),
      },
    },
    {
      email: "neha.kulkarni@barclays.com",
      fullName: "Neha Kulkarni",
      phone: "9890223344",
      profile: {
        program: "MCA",
        graduationYear: 2020,
        enrollmentNo: "IMCC-MCA-2017-089",
        organization: "Barclays Global Service Centre, Pune",
        designation: "Cloud & DevOps Architect",
        industry: "Banking & Financial Technology",
        linkedinUrl: "https://www.linkedin.com/in/neha-kulkarni-fintech",
        experienceYears: 4,
        skills: ["AWS", "Kubernetes", "Terraform", "Python", "CI/CD"],
        expertise: ["DevOps Automation", "Cloud Security"],
        preferredActivities: ["Mock Interview & Resume Clinic", "Project Mentoring"],
        preferredFormat: "Online",
        availability: "Alternate Weekends",
        willingToParticipate: true,
        consentGiven: true,
        profileCompleted: true,
        verificationStatus: "VERIFIED",
        verifiedById: adminUser.userId,
        verifiedAt: new Date("2024-02-10T11:30:00Z"),
      },
    },
    {
      email: "rohan.shinde@infosys.com",
      fullName: "Rohan Shinde",
      phone: "9890334455",
      profile: {
        program: "MCA",
        graduationYear: 2023,
        enrollmentNo: "IMCC-MCA-2020-014",
        organization: "Infosys Hinjewadi, Pune",
        designation: "Software Engineer",
        industry: "IT Services",
        linkedinUrl: "https://www.linkedin.com/in/rohan-shinde-imcc",
        experienceYears: 1,
        skills: ["Java", "Spring Boot", "Angular", "REST APIs"],
        expertise: ["Backend Engineering"],
        preferredActivities: ["Hackathon & Coding Contest"],
        preferredFormat: "In-Person",
        availability: "Weekend Afternoons",
        willingToParticipate: true,
        consentGiven: true,
        profileCompleted: true,
        verificationStatus: "PENDING", // Pending review for verification queue testing
      },
    },
  ];

  for (const item of alumniUsers) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {},
      create: {
        roleId: roleMap.get("ALUMNI")!,
        email: item.email,
        passwordHash: defaultPasswordHash,
        fullName: item.fullName,
        phone: item.phone,
        status: "ACTIVE",
      },
    });

    await prisma.alumniProfile.upsert({
      where: { userId: user.userId },
      update: {},
      create: {
        userId: user.userId,
        ...item.profile,
      },
    });
  }
  console.log("✅ Authentic Alumni Profiles seeded (Aarav Deshmukh, Neha Kulkarni, Rohan Shinde)");

  console.log("\n🎉 Database seed finished successfully!");
  console.log("🔑 Default login credentials for all seeded accounts:");
  console.log("   • Admin: admin@imcc.mespune.in | Password: Imcc@2026");
  console.log("   • Coordinator (Tech): meera.tech@imcc.mespune.in | Password: Imcc@2026");
  console.log("   • Coordinator (Placement): rajesh.place@imcc.mespune.in | Password: Imcc@2026");
  console.log("   • Alumnus: aarav.deshmukh@persistent.com | Password: Imcc@2026");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
