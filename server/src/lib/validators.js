import { z } from "zod";

// ------------------------------------------------------------
// AUTH VALIDATORS
// ------------------------------------------------------------

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be 20 characters or less")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be 100 characters or less"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ------------------------------------------------------------
// POST VALIDATORS
// ------------------------------------------------------------

const createPostSchema = z.object({
  content: z
    .string()
    .min(1, "Post content cannot be empty")
    .max(280, "Post cannot exceed 280 characters"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
});

// ------------------------------------------------------------
// REPLY VALIDATORS
// ------------------------------------------------------------

const createReplySchema = z.object({
  content: z
    .string()
    .min(1, "Reply content cannot be empty")
    .max(280, "Reply cannot exceed 280 characters"),
  imageUrl: z.string().url("Invalid image URL").optional(),
  parentId: z.string().optional(), // null = direct reply to post, set = nested reply
});

// ------------------------------------------------------------
// PROFILE VALIDATORS
// ------------------------------------------------------------

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .optional(),
  bio: z.string().max(160, "Bio must be 160 characters or less").optional(),
  location: z
    .string()
    .max(30, "Location must be 30 characters or less")
    .optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")), // allow empty string to clear website
  avatarUrl: z.string().url("Invalid avatar URL").optional(),
  coverUrl: z.string().url("Invalid cover URL").optional(),
});

export {
  registerSchema,
  loginSchema,
  createPostSchema,
  createReplySchema,
  updateProfileSchema,
};
