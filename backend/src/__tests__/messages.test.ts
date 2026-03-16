import request from "supertest";
import app from "../app";
import { prisma } from "../db/prisma";

const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

const mockMessage = {
  id: VALID_UUID,
  content: "Hello World",
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
};

jest.mock("../db/prisma", () => ({
  prisma: {
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockPrismaMessage = prisma.message as {
  create: jest.Mock;
  findMany: jest.Mock;
  findUnique: jest.Mock;
};

beforeEach(() => {
  mockPrismaMessage.create.mockResolvedValue(mockMessage);
  mockPrismaMessage.findMany.mockResolvedValue([mockMessage]);
  mockPrismaMessage.findUnique.mockResolvedValue(mockMessage);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/messages", () => {
  it("creates a message and returns 201", async () => {
    const res = await request(app).post("/api/messages");
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: VALID_UUID,
      content: "Hello World",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
  });
});

describe("GET /api/messages", () => {
  it("returns all messages", async () => {
    const res = await request(app).get("/api/messages");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body as unknown[]).toContainEqual(
      expect.objectContaining({ content: "Hello World" }),
    );
  });

  it("passes skip and limit to the query", async () => {
    await request(app).get("/api/messages?skip=5&limit=20");
    expect(mockPrismaMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 20 }),
    );
  });

  it("returns 400 for invalid query params", async () => {
    const res = await request(app).get("/api/messages?skip=-1");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/messages/latest", () => {
  it("returns latest messages", async () => {
    const res = await request(app).get("/api/messages/latest");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("respects the limit query param", async () => {
    await request(app).get("/api/messages/latest?limit=5");
    expect(mockPrismaMessage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 }),
    );
  });

  it("returns 400 for invalid limit", async () => {
    const res = await request(app).get("/api/messages/latest?limit=0");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/messages/:id", () => {
  it("returns a message by id", async () => {
    const res = await request(app).get(`/api/messages/${VALID_UUID}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: VALID_UUID, content: "Hello World" });
  });

  it("returns 404 when message not found", async () => {
    mockPrismaMessage.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).get(`/api/messages/${VALID_UUID}`);
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: "Message not found" });
  });

  it("returns 400 for a non-UUID id", async () => {
    const res = await request(app).get("/api/messages/not-a-uuid");
    expect(res.status).toBe(400);
  });
});
