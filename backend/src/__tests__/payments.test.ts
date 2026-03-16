import request from "supertest";
import app from "../app";
import { prisma } from "../db/prisma";

const ACTOR_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const RECIPIENT_ID = "b1ffcc00-1234-5678-abcd-1234567890ab";

const mockActor = {
  id: ACTOR_ID,
  name: "Me",
  handle: "@me",
  avatarUrl: null,
  isActive: true,
  balanceCents: 100_00,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockRecipient = {
  id: RECIPIENT_ID,
  name: "Alice",
  handle: "@alice",
  avatarUrl: null,
  isActive: true,
  balanceCents: 50_00,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockTransaction = {
  id: "c2aabb11-0000-0000-0000-000000000001",
  senderId: ACTOR_ID,
  recipientId: RECIPIENT_ID,
  amountCents: 10_00,
  memo: "Lunch",
  createdAt: new Date("2024-06-01"),
  sender: { name: "Me", handle: "@me" },
  recipient: { name: "Alice", handle: "@alice" },
};

jest.mock("../db/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
    updateMany: jest.Mock;
    update: jest.Mock;
  };
  transaction: {
    create: jest.Mock;
    findMany: jest.Mock;
  };
  $transaction: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.user.findUnique.mockResolvedValue(mockActor);
  mockPrisma.user.findMany.mockResolvedValue([mockRecipient]);
  mockPrisma.transaction.findMany.mockResolvedValue([mockTransaction]);
});

// ---------- GET /api/me ----------

describe("GET /api/me", () => {
  it("returns the actor user", async () => {
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: ACTOR_ID,
      name: "Me",
      handle: "@me",
      balanceCents: 100_00,
    });
  });

  it("returns 500 when actor not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).get("/api/me");
    expect(res.status).toBe(500);
  });
});

// ---------- GET /api/contacts ----------

describe("GET /api/contacts", () => {
  it("returns contacts excluding actor", async () => {
    const res = await request(app).get("/api/contacts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ name: "Alice", handle: "@alice" });
  });

  it("passes skip and limit to the query", async () => {
    await request(app).get("/api/contacts?skip=2&limit=10");
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 2, take: 10 }),
    );
  });

  it("returns 400 for invalid query params", async () => {
    const res = await request(app).get("/api/contacts?skip=-1");
    expect(res.status).toBe(400);
  });
});

// ---------- POST /api/transactions ----------

describe("POST /api/transactions", () => {
  beforeEach(() => {
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      return fn(mockPrisma);
    });
    mockPrisma.user.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.user.update.mockResolvedValue(mockRecipient);
    mockPrisma.transaction.create.mockResolvedValue(mockTransaction);
  });

  it("creates a transaction and returns 201", async () => {
    const res = await request(app).post("/api/transactions").send({
      recipientId: RECIPIENT_ID,
      amountCents: 10_00,
      memo: "Lunch",
    });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      senderId: ACTOR_ID,
      recipientId: RECIPIENT_ID,
      amountCents: 10_00,
      memo: "Lunch",
    });
  });

  it("returns 409 for insufficient funds", async () => {
    mockPrisma.user.updateMany.mockResolvedValueOnce({ count: 0 });
    mockPrisma.$transaction.mockImplementation(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      return fn(mockPrisma);
    });

    const res = await request(app).post("/api/transactions").send({
      recipientId: RECIPIENT_ID,
      amountCents: 999_99,
    });
    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ error: "Insufficient funds" });
  });

  it("returns 400 when sending to self", async () => {
    const res = await request(app).post("/api/transactions").send({
      recipientId: ACTOR_ID,
      amountCents: 10_00,
    });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ error: "Cannot send money to yourself" });
  });

  it("returns 400 for invalid body", async () => {
    const res = await request(app).post("/api/transactions").send({
      recipientId: "not-a-uuid",
      amountCents: -5,
    });
    expect(res.status).toBe(400);
  });

  it("returns 400 when amountCents is missing", async () => {
    const res = await request(app).post("/api/transactions").send({
      recipientId: RECIPIENT_ID,
    });
    expect(res.status).toBe(400);
  });
});

// ---------- GET /api/transactions ----------

describe("GET /api/transactions", () => {
  it("returns transaction history", async () => {
    const res = await request(app).get("/api/transactions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({
      senderId: ACTOR_ID,
      recipientId: RECIPIENT_ID,
      amountCents: 10_00,
    });
  });

  it("passes skip and limit to the query", async () => {
    await request(app).get("/api/transactions?skip=5&limit=10");
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 10 }),
    );
  });

  it("filters by direction=sent", async () => {
    await request(app).get("/api/transactions?direction=sent");
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { senderId: ACTOR_ID },
      }),
    );
  });

  it("filters by direction=received", async () => {
    await request(app).get("/api/transactions?direction=received");
    expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { recipientId: ACTOR_ID },
      }),
    );
  });

  it("returns 400 for invalid query params", async () => {
    const res = await request(app).get("/api/transactions?limit=0");
    expect(res.status).toBe(400);
  });
});
