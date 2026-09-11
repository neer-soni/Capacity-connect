import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  password: z.string().min(6).max(100),
  role: z.enum(["trainee", "trainer"]).optional(),
  department: z.string().trim().max(120).optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  department: z.string().trim().max(120).optional(),
  designation: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
  skills: z.array(z.string().trim().min(1).max(80)).max(40).optional(),
  avatar: z.string().trim().max(20).optional(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  publicPortfolio: z.boolean().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(100).optional(),
  competencyTargets: z
    .array(
      z.object({
        competencyId: z.string().min(1),
        targetLevel: z.number().int().min(1).max(5),
      })
    )
    .optional(),
});

export const courseSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(8000),
  department: z.string().trim().max(120).optional(),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  duration: z.string().trim().max(60).optional(),
  estimatedMinutes: z.number().int().min(0).max(20000).optional(),
  tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  thumbnail: z.string().trim().max(8).optional(),
  objectives: z.array(z.string().trim().min(1).max(300)).max(20).optional(),
  competencyIds: z.array(z.string().min(1)).max(20).optional(),
});

export const lessonSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(4000).optional(),
  type: z.enum(["video", "pdf", "slide", "text"]),
  order: z.number().int().min(0).max(500).optional(),
  videoUrl: z.string().trim().max(2000).optional(),
  videoDurationSeconds: z.number().int().min(0).max(86400).optional(),
  resourceUrl: z.string().trim().max(2000).optional(),
  size: z.string().trim().max(40).optional(),
  isRequired: z.boolean().optional(),
});

export const quizQuestionSchema = z.object({
  text: z.string().trim().min(4).max(1000),
  marks: z.number().int().min(1).max(100).optional(),
  options: z.array(z.string().trim().min(1).max(400)).min(2).max(8),
  correctIndex: z.number().int().min(0),
});

export const quizSchema = z.object({
  title: z.string().trim().min(3).max(160),
  timeLimit: z.number().int().min(1).max(240).optional(),
  passingScore: z.number().int().min(1).max(100).optional(),
  deadline: z.string().nullable().optional(),
  published: z.boolean().optional(),
  questions: z.array(quizQuestionSchema).min(1).max(50),
});

export const quizSubmitSchema = z.object({
  answers: z.record(z.string(), z.string()),
});

export const progressSchema = z.object({
  lessonId: z.string().min(1),
  watchedSeconds: z.number().min(0).max(86400),
  duration: z.number().min(0).max(86400).optional(),
  markComplete: z.boolean().optional(),
});

export const adminCourseActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(1000).optional(),
});
