import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Registers a new user with email and password.
 * Hashes the password before storing.
 * Throws if email or username is already taken.
 *
 * @param {object} data - { name, username, email, password }
 * @returns {object} - The created user (without password)
 */
const register = async ({ name, username, email, password }) => {
  // Check if email is already registered
  const existingEmail = await prisma.user.findUnique({
    where: { email },
  });

  if (existingEmail) {
    throw new AppError("An account with this email already exists", 409);
  }

  // Check if username is already taken
  const existingUsername = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUsername) {
    throw new AppError("This username is already taken", 409);
  }

  // Hash the password with bcrypt
  // Salt rounds of 12 is a good balance of security and performance
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create the user in the database
  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      hashedPassword,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Logs in a user with email and password.
 * Throws if credentials are invalid.
 * Uses a generic error message to prevent email enumeration attacks.
 *
 * @param {object} data - { email, password }
 * @returns {object} - The authenticated user (without password)
 */
const login = async ({ email, password }) => {
  // Find the user including their hashed password
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      hashedPassword: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
    },
  });

  // Use a generic error message — never tell the client whether
  // the email exists or not, as that enables email enumeration
  if (!user || !user.hashedPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  // Remove hashedPassword before returning the user object
  const { hashedPassword, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

/**
 * Fetches the currently authenticated user by ID.
 * Used by the /me endpoint to hydrate the frontend auth state.
 *
 * @param {string} userId
 * @returns {object} - The user object
 */
const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      avatarUrl: true,
      coverUrl: true,
      bio: true,
      location: true,
      website: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export default { register, login, getMe };