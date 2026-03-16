import type { User } from "@prisma/client";
import { prisma } from "../db/prisma";
import { env } from "../lib/env";
import type { UserResponse } from "../types/user";

function toResponse(user: User): UserResponse {
  return {
    id: user.id,
    name: user.name,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    balanceCents: user.balanceCents,
    createdAt: user.createdAt.toISOString(),
  };
}

export const userService = {
  async getActorUser(): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { handle: env.ACTOR_HANDLE },
    });
    if (!user) {
      throw Object.assign(new Error("Actor user not found — run prisma seed"), { status: 500 });
    }
    return toResponse(user);
  },

  async getActorId(): Promise<string> {
    const actor = await this.getActorUser();
    return actor.id;
  },

  async getContacts(skip: number, limit: number): Promise<UserResponse[]> {
    const actorId = await this.getActorId();
    const users = await prisma.user.findMany({
      where: { id: { not: actorId }, isActive: true },
      skip,
      take: limit,
      orderBy: { name: "asc" },
    });
    return users.map(toResponse);
  },
};
