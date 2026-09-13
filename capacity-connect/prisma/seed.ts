import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SAMPLE_VIDEO_URL } from "../src/lib/video/provider";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.lessonProgress.deleteMany();
  await prisma.userCompetency.deleteMany();
  await prisma.courseCompetency.deleteMany();
  await prisma.competency.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.competencyMap.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.forumReply.deleteMany();
  await prisma.forumThread.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Dr. Anil Gupta",
      email: "admin@moes.gov.in",
      username: "anil-gupta",
      passwordHash: hash,
      role: "admin",
      status: "approved",
      department: "Administration",
      designation: "Platform Administrator",
      skills: JSON.stringify(["Management", "Policy", "Training Design"]),
      bio: "Platform administrator for Capacity Connect.",
      avatar: "AG",
    },
  });

  const trainer1 = await prisma.user.create({
    data: {
      name: "Dr. Rajesh Kumar",
      email: "rajesh@moes.gov.in",
      username: "rajesh-kumar",
      passwordHash: hash,
      role: "trainer",
      status: "approved",
      department: "Oceanography",
      designation: "Senior Scientist",
      skills: JSON.stringify(["Marine Biology", "Oceanography", "Python", "Data Analysis"]),
      bio: "Senior scientist specializing in physical oceanography and observational methods.",
      avatar: "RK",
      verified: true,
    },
  });

  const trainer2 = await prisma.user.create({
    data: {
      name: "Dr. Meera Nair",
      email: "meera@moes.gov.in",
      username: "meera-nair",
      passwordHash: hash,
      role: "trainer",
      status: "approved",
      department: "Climate Science",
      designation: "Chief Scientist",
      skills: JSON.stringify(["Climate Modeling", "GIS", "R Programming", "Remote Sensing"]),
      bio: "Climate scientist working on earth system models and remote sensing.",
      avatar: "MN",
      verified: true,
    },
  });

  const trainer3 = await prisma.user.create({
    data: {
      name: "Dr. Vikram Patel",
      email: "vikram@moes.gov.in",
      username: "vikram-patel",
      passwordHash: hash,
      role: "trainer",
      status: "approved",
      department: "Atmospheric Sciences",
      designation: "Research Scientist",
      skills: JSON.stringify(["Meteorology", "Weather Prediction", "Satellite Data"]),
      bio: "Research scientist focused on monsoon dynamics and satellite meteorology.",
      avatar: "VP",
      verified: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Dr. Sunita Rao",
      email: "sunita@moes.gov.in",
      username: "sunita-rao",
      passwordHash: hash,
      role: "trainer",
      status: "pending",
      department: "Seismology",
      designation: "Assistant Scientist",
      skills: JSON.stringify(["Earthquake Analysis", "GIS"]),
      avatar: "SR",
    },
  });

  const trainee1 = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@moes.gov.in",
      username: "priya-sharma",
      passwordHash: hash,
      role: "trainee",
      status: "approved",
      department: "Oceanography",
      designation: "Junior Scientist",
      skills: JSON.stringify(["Python", "Marine Biology"]),
      bio: "Junior scientist building skills in ocean data analysis and observational oceanography.",
      avatar: "PS",
    },
  });

  const trainee2 = await prisma.user.create({
    data: {
      name: "Amit Verma",
      email: "amit@moes.gov.in",
      username: "amit-verma",
      passwordHash: hash,
      role: "trainee",
      status: "approved",
      department: "Climate Science",
      designation: "Research Fellow",
      skills: JSON.stringify(["Data Analysis", "R Programming"]),
      avatar: "AV",
    },
  });

  const trainee3 = await prisma.user.create({
    data: {
      name: "Sneha Patel",
      email: "sneha@moes.gov.in",
      username: "sneha-patel",
      passwordHash: hash,
      role: "trainee",
      status: "approved",
      department: "Atmospheric Sciences",
      designation: "Field Officer",
      skills: JSON.stringify(["Weather Monitoring"]),
      avatar: "SP",
    },
  });

  console.log("  ✓ Users created");

  const competencyDefs = [
    { name: "Oceanography", category: "Earth Science", description: "Physical and biological ocean processes" },
    { name: "Marine Biology", category: "Earth Science", description: "Marine ecosystems and organisms" },
    { name: "Python", category: "Computing", description: "Scientific programming with Python" },
    { name: "Data Analysis", category: "Computing", description: "Statistical and observational data analysis" },
    { name: "Climate Modeling", category: "Climate", description: "Earth system and climate models" },
    { name: "GIS", category: "Geospatial", description: "Geographic information systems" },
    { name: "Remote Sensing", category: "Geospatial", description: "Satellite and airborne remote sensing" },
    { name: "Meteorology", category: "Atmosphere", description: "Weather systems and atmospheric physics" },
    { name: "Weather Prediction", category: "Atmosphere", description: "Forecasting methods and verification" },
    { name: "Satellite Data", category: "Geospatial", description: "Working with satellite observation products" },
    { name: "Seismology", category: "Solid Earth", description: "Earthquake monitoring and hazard" },
    { name: "Deep Sea Exploration", category: "Ocean", description: "Deep ocean observation techniques" },
  ];

  const competencyByName: Record<string, string> = {};
  for (const def of competencyDefs) {
    const row = await prisma.competency.create({ data: def });
    competencyByName[def.name] = row.id;
  }
  console.log("  ✓ Competencies created");

  const course1 = await prisma.course.create({
    data: {
      title: "Introduction to Oceanography",
      slug: "introduction-to-oceanography",
      description:
        "Comprehensive introduction to physical and biological oceanography covering ocean circulation, marine ecosystems, and observational techniques used in modern ocean science.",
      trainerId: trainer1.id,
      department: "Oceanography",
      tags: JSON.stringify(["Oceanography", "Marine Biology", "Python", "Data Analysis"]),
      status: "published",
      duration: "8 weeks",
      estimatedMinutes: 240,
      level: "Beginner",
      thumbnail: "🌊",
      totalLessons: 4,
      objectives: JSON.stringify([
        "Explain thermohaline circulation",
        "Identify major ocean zones",
        "Use basic oceanographic instruments conceptually",
      ]),
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "Climate Change & Earth Systems",
      slug: "climate-change-earth-systems",
      description:
        "Advanced study of climate dynamics, greenhouse effect, paleoclimatology, and climate modeling approaches used by IPCC and MoES research divisions.",
      trainerId: trainer2.id,
      department: "Climate Science",
      tags: JSON.stringify(["Climate Science", "GIS", "Remote Sensing", "Climate Modeling"]),
      status: "published",
      duration: "10 weeks",
      estimatedMinutes: 360,
      level: "Intermediate",
      thumbnail: "🌍",
      totalLessons: 3,
      objectives: JSON.stringify(["Describe the climate system", "Interpret IPCC summary findings"]),
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: "Atmospheric Sciences Fundamentals",
      slug: "atmospheric-sciences-fundamentals",
      description:
        "Core concepts in atmospheric physics, weather systems, monsoon dynamics, and satellite-based atmospheric monitoring relevant to Indian subcontinent.",
      trainerId: trainer3.id,
      department: "Atmospheric Sciences",
      tags: JSON.stringify(["Meteorology", "Weather Prediction", "Satellite Data"]),
      status: "published",
      duration: "6 weeks",
      estimatedMinutes: 180,
      level: "Beginner",
      thumbnail: "🌤️",
      totalLessons: 2,
      objectives: JSON.stringify(["Describe atmospheric structure", "Explain monsoon drivers"]),
    },
  });

  const course4 = await prisma.course.create({
    data: {
      title: "Deep Sea Exploration Techniques",
      slug: "deep-sea-exploration-techniques",
      description:
        "Advanced techniques in deep sea exploration including ROV operations, deep sea sampling, and geophysical survey methods used in India's deep ocean mission.",
      trainerId: trainer1.id,
      department: "Deep Sea",
      tags: JSON.stringify(["Deep Sea", "ROV", "Geophysics", "Sampling"]),
      status: "published",
      duration: "12 weeks",
      estimatedMinutes: 420,
      level: "Advanced",
      thumbnail: "🐙",
      totalLessons: 2,
      objectives: JSON.stringify(["Outline ROV operational constraints"]),
    },
  });

  const course5 = await prisma.course.create({
    data: {
      title: "GIS & Remote Sensing for Earth Sciences",
      slug: "gis-remote-sensing-earth-sciences",
      description:
        "Hands-on training in GIS tools, satellite image processing, and spatial analysis techniques critical for earth science research.",
      trainerId: trainer2.id,
      department: "Space Applications",
      tags: JSON.stringify(["GIS", "Remote Sensing", "Spatial Analysis", "QGIS"]),
      status: "published",
      duration: "8 weeks",
      estimatedMinutes: 300,
      level: "Intermediate",
      thumbnail: "🛰️",
      totalLessons: 2,
      objectives: JSON.stringify(["Perform basic spatial analysis"]),
    },
  });

  const course6 = await prisma.course.create({
    data: {
      title: "Seismology & Earthquake Monitoring",
      slug: "seismology-earthquake-monitoring",
      description:
        "Introduction to seismological methods, earthquake hazard assessment, and India's seismic monitoring network operations.",
      trainerId: trainer3.id,
      department: "Seismology",
      tags: JSON.stringify(["Seismology", "Earthquake", "Hazard Assessment"]),
      status: "draft",
      duration: "6 weeks",
      estimatedMinutes: 160,
      level: "Intermediate",
      thumbnail: "🏔️",
      totalLessons: 1,
      objectives: JSON.stringify(["Interpret basic seismograms"]),
    },
  });

  console.log("  ✓ Courses created");

  const courseCompetencies: Array<[string, string[]]> = [
    [course1.id, ["Oceanography", "Marine Biology", "Python", "Data Analysis"]],
    [course2.id, ["Climate Modeling", "GIS", "Remote Sensing"]],
    [course3.id, ["Meteorology", "Weather Prediction", "Satellite Data"]],
    [course4.id, ["Deep Sea Exploration", "Oceanography"]],
    [course5.id, ["GIS", "Remote Sensing", "Data Analysis"]],
    [course6.id, ["Seismology"]],
  ];
  for (const [courseId, names] of courseCompetencies) {
    await prisma.courseCompetency.createMany({
      data: names.map((name) => ({ courseId, competencyId: competencyByName[name] })),
    });
  }

  const lessonSpecs = [
    { courseId: course1.id, type: "video", title: "Introduction & Course Overview", order: 0, duration: 596 },
    { courseId: course1.id, type: "pdf", title: "Ocean Layers & Zones Handbook", order: 1, resourceUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", size: "2.4 MB" },
    { courseId: course1.id, type: "video", title: "Ocean Circulation Patterns", order: 2, duration: 596 },
    { courseId: course1.id, type: "video", title: "Lab: Salinity Measurement", order: 3, duration: 596 },
    { courseId: course2.id, type: "video", title: "Climate System Overview", order: 0, duration: 596 },
    { courseId: course2.id, type: "pdf", title: "IPCC AR6 Summary Guide", order: 1, resourceUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", size: "8.7 MB" },
    { courseId: course2.id, type: "video", title: "Greenhouse Effect Deep Dive", order: 2, duration: 596 },
    { courseId: course3.id, type: "video", title: "Atmospheric Structure", order: 0, duration: 596 },
    { courseId: course3.id, type: "pdf", title: "Indian Monsoon Study Guide", order: 1, resourceUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", size: "4.2 MB" },
    { courseId: course4.id, type: "video", title: "Deep Ocean Mission Overview", order: 0, duration: 596 },
    { courseId: course4.id, type: "video", title: "ROV Operations Primer", order: 1, duration: 596 },
    { courseId: course5.id, type: "video", title: "GIS Foundations", order: 0, duration: 596 },
    { courseId: course5.id, type: "pdf", title: "Remote Sensing Cheatsheet", order: 1, resourceUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", size: "1.1 MB" },
    { courseId: course6.id, type: "video", title: "Seismic Networks in India", order: 0, duration: 596 },
  ];

  const createdLessons: Record<string, string[]> = {};
  for (const spec of lessonSpecs) {
    const lesson = await prisma.lesson.create({
      data: {
        courseId: spec.courseId,
        title: spec.title,
        description: spec.title,
        type: spec.type,
        order: spec.order,
        videoUrl: spec.type === "video" ? SAMPLE_VIDEO_URL : "",
        videoDurationSeconds: spec.duration || 0,
        resourceUrl: spec.resourceUrl || "",
        size: spec.size || "",
        isRequired: true,
      },
    });
    createdLessons[spec.courseId] = createdLessons[spec.courseId] || [];
    createdLessons[spec.courseId].push(lesson.id);
  }

  await prisma.resource.createMany({
    data: [
      { courseId: course1.id, type: "pdf", title: "Ocean Layers & Zones Handbook", size: "2.4 MB", uploadedBy: trainer1.id, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
      { courseId: course2.id, type: "pdf", title: "IPCC AR6 Summary Guide", size: "8.7 MB", uploadedBy: trainer2.id, url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
    ],
  });
  console.log("  ✓ Lessons & resources created");

  await prisma.enrollment.create({ data: { userId: trainee1.id, courseId: course1.id, progress: 50, status: "in_progress" } });
  await prisma.enrollment.create({
    data: { userId: trainee1.id, courseId: course2.id, progress: 100, status: "completed", completedAt: new Date("2024-08-20") },
  });
  await prisma.enrollment.create({ data: { userId: trainee1.id, courseId: course3.id, progress: 30, status: "in_progress" } });
  await prisma.enrollment.create({ data: { userId: trainee2.id, courseId: course1.id, progress: 45, status: "in_progress" } });
  await prisma.enrollment.create({ data: { userId: trainee2.id, courseId: course5.id, progress: 80, status: "in_progress" } });
  await prisma.enrollment.create({
    data: { userId: trainee3.id, courseId: course3.id, progress: 100, status: "completed", completedAt: new Date("2024-09-01") },
  });
  await prisma.enrollment.create({ data: { userId: trainee3.id, courseId: course4.id, progress: 20, status: "in_progress" } });
  console.log("  ✓ Enrollments created");

  const c1Lessons = createdLessons[course1.id];
  await prisma.lessonProgress.create({
    data: {
      userId: trainee1.id,
      courseId: course1.id,
      lessonId: c1Lessons[0],
      watchedSeconds: 400,
      duration: 596,
      percentage: 67,
      completed: false,
    },
  });
  const c2Lessons = createdLessons[course2.id];
  for (const lessonId of c2Lessons) {
    await prisma.lessonProgress.create({
      data: {
        userId: trainee1.id,
        courseId: course2.id,
        lessonId,
        watchedSeconds: 596,
        duration: 596,
        percentage: 100,
        completed: true,
      },
    });
  }

  const assessment1 = await prisma.assessment.create({
    data: {
      courseId: course1.id,
      title: "Oceanography Mid-Term Quiz",
      deadline: new Date("2026-12-01"),
      timeLimit: 30,
      passingScore: 60,
      published: true,
    },
  });

  async function addQuestion(assessmentId: string, text: string, options: string[], correct: number, order: number) {
    const q = await prisma.question.create({ data: { assessmentId, text, marks: 1, order } });
    const opts = await Promise.all(options.map((t) => prisma.option.create({ data: { questionId: q.id, text: t } })));
    await prisma.question.update({ where: { id: q.id }, data: { correctOptionId: opts[correct].id } });
  }

  await addQuestion(assessment1.id, "What is the primary driver of thermohaline circulation?", ["Wind patterns", "Temperature and salinity differences", "Tidal forces", "Volcanic activity"], 1, 0);
  await addQuestion(assessment1.id, "Which ocean zone receives the most sunlight?", ["Euphotic zone", "Bathyal zone", "Abyssal zone", "Hadal zone"], 0, 1);
  await addQuestion(assessment1.id, "What percentage of Earth's surface is covered by oceans?", ["51%", "61%", "71%", "81%"], 2, 2);
  await addQuestion(assessment1.id, "The Indian Ocean Dipole (IOD) affects which weather system?", ["Arctic Oscillation", "Indian Monsoon", "El Niño", "Jet Stream"], 1, 3);
  await addQuestion(assessment1.id, "Which instrument measures ocean salinity?", ["Barometer", "CTD Profiler", "Seismograph", "Anemometer"], 1, 4);

  const assessment2 = await prisma.assessment.create({
    data: { courseId: course2.id, title: "Climate Systems Quiz", timeLimit: 20, passingScore: 60, published: true },
  });
  await addQuestion(assessment2.id, "Which gas is the dominant long-lived greenhouse gas from human activity?", ["Ozone", "Carbon dioxide", "Argon", "Nitrogen"], 1, 0);
  await addQuestion(assessment2.id, "IPCC reports are primarily used to...", ["Replace national weather forecasts", "Assess climate science for policymakers", "Certify marine vessels", "Manage seismic networks"], 1, 1);

  await prisma.attempt.create({
    data: {
      assessmentId: assessment2.id,
      userId: trainee1.id,
      score: 2,
      total: 2,
      percentage: 100,
      passed: true,
      answers: "{}",
    },
  });

  console.log("  ✓ Assessments created");

  await prisma.certificate.create({
    data: {
      userId: trainee1.id,
      courseId: course2.id,
      hash: "CC2024-A7F2-3B9E",
      validatedByAdmin: true,
      issuedAt: new Date("2024-08-20"),
    },
  });
  await prisma.certificate.create({
    data: {
      userId: trainee3.id,
      courseId: course3.id,
      hash: "CC2024-D4E1-9C3D",
      validatedByAdmin: false,
      issuedAt: new Date("2024-09-01"),
    },
  });

  const thread1 = await prisma.forumThread.create({
    data: {
      courseId: course1.id,
      authorId: trainee1.id,
      title: "How does thermohaline circulation affect Indian Ocean currents?",
      body: "I'm trying to understand the connection between thermohaline circulation and the seasonal reversal of currents in the Indian Ocean.",
      isQuestion: true,
      upvotes: 12,
    },
  });
  const reply1 = await prisma.forumReply.create({
    data: {
      threadId: thread1.id,
      authorId: trainer1.id,
      body: "The thermohaline circulation in the Indian Ocean is unique because it is heavily influenced by the monsoon system.",
      upvotes: 8,
    },
  });
  await prisma.forumThread.update({ where: { id: thread1.id }, data: { acceptedReplyId: reply1.id } });

  await prisma.feedback.create({ data: { userId: trainee1.id, courseId: course1.id, rating: 5, comment: "Excellent course!" } });
  await prisma.feedback.create({ data: { userId: trainee1.id, courseId: course2.id, rating: 5, comment: "Outstanding content" } });
  await prisma.feedback.create({ data: { userId: trainee3.id, courseId: course3.id, rating: 4, comment: "Good practical examples" } });

  await prisma.notification.createMany({
    data: [
      { userId: trainee1.id, type: "quiz", message: "Quiz available: Oceanography Mid-Term", link: `/trainee/courses/${course1.id}/quiz` },
      { userId: trainee1.id, type: "certificate", message: "Your certificate for Climate Change & Earth Systems is ready.", link: "/trainee/certificates", read: true },
      { userId: admin.id, type: "announcement", message: "New trainer registration: Dr. Sunita Rao is awaiting approval.", link: "/admin/users" },
    ],
  });

  await prisma.announcement.create({
    data: {
      title: "New Course: Deep Sea Exploration Techniques",
      body: "Our new advanced course on deep sea exploration is now available for enrollment.",
      type: "announcement",
      icon: "🌊",
      publishedBy: admin.id,
    },
  });

  for (const [trainerId, skills] of [
    [trainer1.id, ["Marine Biology", "Oceanography", "Python", "CTD Operations"]],
    [trainer2.id, ["Climate Modeling", "GIS", "Remote Sensing", "R Programming"]],
    [trainer3.id, ["Meteorology", "Weather Prediction", "Satellite Data", "Atmospheric Physics"]],
  ] as Array<[string, string[]]>) {
    for (const skill of skills) {
      await prisma.competencyMap.create({ data: { trainerId, skillTag: skill, verifiedByAdmin: true } });
    }
  }

  await prisma.userCompetency.createMany({
    data: [
      { userId: trainee1.id, competencyId: competencyByName.Python, currentLevel: 2, targetLevel: 4, evidence: "Self-reported plus course work" },
      { userId: trainee1.id, competencyId: competencyByName.Oceanography, currentLevel: 2, targetLevel: 4, evidence: "In-progress oceanography course" },
      { userId: trainee1.id, competencyId: competencyByName["Data Analysis"], currentLevel: 1, targetLevel: 3 },
      { userId: trainee1.id, competencyId: competencyByName["Climate Modeling"], currentLevel: 4, targetLevel: 4, evidence: "Completed climate course", lastAssessedAt: new Date("2024-08-20") },
      { userId: trainee2.id, competencyId: competencyByName.GIS, currentLevel: 2, targetLevel: 4 },
      { userId: trainee2.id, competencyId: competencyByName["Remote Sensing"], currentLevel: 1, targetLevel: 3 },
      { userId: trainee3.id, competencyId: competencyByName.Meteorology, currentLevel: 3, targetLevel: 4 },
    ],
  });

  await prisma.report.create({
    data: {
      contentType: "forum_reply",
      contentId: reply1.id,
      reportedBy: trainee3.id,
      reportedUser: trainer1.name,
      reason: "Needs review",
      status: "pending",
      courseContext: course1.title,
    },
  });

  console.log("  ✓ Competency, certificates, forum, reports created");
  console.log("\n✅ Seed complete!\n");
  console.log("Demo accounts (password: password123):");
  console.log("  Admin:   admin@moes.gov.in");
  console.log("  Trainer: rajesh@moes.gov.in");
  console.log("  Trainee: priya@moes.gov.in");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
