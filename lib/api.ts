import { Prisma } from "@prisma/client";
import prisma from "./prisma";
import {
  Loop,
  Question,
  Response,
  User,
  LoopQuestion,
  LoopMember,
} from "./types";
import logger from "./logger";

const contextLogger = logger.createContextLogger("API");

/**
 * Fetch all loops for a user
 * @param userId - User ID to fetch loops for
 * @returns Array of loops
 */
export async function getLoops(
  userId: string
): Promise<Prisma.LoopGetPayload<{}>[]> {
  try {
    const loops = await prisma.loop.findMany({
      where: {
        OR: [
          { coordinatorId: userId },
          {
            members: {
              some: {
                userId,
                status: "active",
              },
            },
          },
        ],
      },
    });

    return loops;
  } catch (error) {
    contextLogger.error("Failed to fetch loops", { error, userId });
    throw error;
  }
}

/**
 * Fetch a single loop by ID
 * @param loopId - Loop ID to fetch
 * @returns Loop object or null if not found
 */
export async function getLoop(
  loopId: string
): Promise<Prisma.LoopGetPayload<{}> | null> {
  try {
    const loop = await prisma.loop.findUnique({
      where: { id: loopId },
    });

    return loop;
  } catch (error) {
    contextLogger.error("Failed to fetch loop", { error, loopId });
    return null;
  }
}

/**
 * Create a new loop
 * @param loop - Loop data to create
 * @returns Created loop or null on error
 */
export async function createLoop(
  loop: Prisma.LoopCreateInput
): Promise<Prisma.LoopGetPayload<{}> | null> {
  try {
    const newLoop = await prisma.loop.create({
      data: loop,
    });

    return newLoop;
  } catch (error) {
    contextLogger.error("Failed to create loop", { error, loop });
    return null;
  }
}

/**
 * Update an existing loop
 * @param loopId - ID of loop to update
 * @param updates - Loop data to update
 * @returns Updated loop or null on error
 */
export async function updateLoop(
  loopId: string,
  updates: Partial<Omit<Loop, "id" | "created_at" | "updated_at">>
): Promise<Prisma.LoopGetPayload<{}> | null> {
  try {
    const updatedLoop = await prisma.loop.update({
      where: { id: loopId },
      data: updates,
    });

    return updatedLoop;
  } catch (error) {
    contextLogger.error("Failed to update loop", { error, loopId, updates });
    return null;
  }
}

/**
 * Delete a loop
 * @param loopId - ID of loop to delete
 * @returns Success status
 */
export async function deleteLoop(loopId: string): Promise<boolean> {
  try {
    await prisma.loop.delete({
      where: { id: loopId },
    });

    return true;
  } catch (error) {
    contextLogger.error("Failed to delete loop", { error, loopId });
    return false;
  }
}

/**
 * Fetch questions for a loop
 * @param loopId - Loop ID to fetch questions for
 * @returns Array of questions with their details
 */
export async function getLoopQuestions(
  loopId: string
): Promise<Prisma.LoopQuestionGetPayload<{ include: { question: true } }>[]> {
  try {
    const questions = await prisma.loopQuestion.findMany({
      where: { loopId },
      include: {
        question: true,
      },
    });

    return questions;
  } catch (error) {
    contextLogger.error("Failed to fetch loop questions", { error, loopId });
    return [];
  }
}

/**
 * Add a question to a loop
 * @param loopQuestion - Loop question data
 * @returns Created loop question or null on error
 */
export async function addQuestionToLoop(
  loopQuestion: Prisma.LoopQuestionCreateInput
): Promise<Prisma.LoopQuestionGetPayload<{}> | null> {
  try {
    const newLoopQuestion = await prisma.loopQuestion.create({
      data: loopQuestion,
    });

    return newLoopQuestion;
  } catch (error) {
    contextLogger.error("Failed to add question to loop", {
      error,
      loopQuestion,
    });
    return null;
  }
}

/**
 * Fetch members of a loop
 * @param loopId - Loop ID to fetch members for
 * @returns Array of loop members with user details
 */
export async function getLoopMembers(
  loopId: string
): Promise<Prisma.LoopMemberGetPayload<{ include: { user: true } }>[]> {
  try {
    const members = await prisma.loopMember.findMany({
      where: { loopId },
      include: {
        user: true,
      },
    });

    return members;
  } catch (error) {
    contextLogger.error("Failed to fetch loop members", { error, loopId });
    return [];
  }
}

// Add this new function near the top with other user-related functions
export async function createUser(
  userData: {
    id: string;
    email: string;
    name: string;
    role?: 'member' | 'coordinator';
  }
): Promise<Prisma.UserGetPayload<{}> | null> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userData.id }
    });

    if (existingUser) {
      return existingUser;
    }

    // Create new user if doesn't exist
    const user = await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role || 'member'
      }
    });

    return user;
  } catch (error) {
    contextLogger.error("Failed to create user", { error, userData });
    return null;
  }
}
