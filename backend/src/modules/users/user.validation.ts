import { z } from "zod";

const roleEnum = z.enum(["admin", "franchise", "delivery"]);

export const createUserBodySchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email"),
  username: z.string().min(2, "Username must be at least 2 characters").max(64),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
  role: roleEnum,
  phone: z.string().max(32).optional().default(""),
  address: z.string().max(500).optional().default(""),
  city: z.string().max(120).optional().default(""),
  state: z.string().max(120).optional().default(""),
  pincode: z.string().max(20).optional().default(""),
  profileImage: z.string().max(2000).optional().default(""),
});

export const updateUserBodySchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    phone: z.string().max(32).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(120).optional(),
    state: z.string().max(120).optional(),
    pincode: z.string().max(20).optional(),
    profileImage: z.string().max(2000).optional(),
    role: roleEnum.optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  role: z
    .union([z.literal(""), roleEnum])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  search: z.string().max(200).optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
  sortBy: z.enum(["createdAt", "name", "email", "role"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const mongoIdParamSchema = z.object({
  id: z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid user id"),
});

export const patchStatusBodySchema = z.object({
  isActive: z.boolean(),
});
