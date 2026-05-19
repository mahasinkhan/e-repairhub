import bcrypt from "bcryptjs";
import mongoose, { type FilterQuery } from "mongoose";
import { User, type UserRole } from "./user.model.js";

export async function findByEmailOrUsernameWithPassword(
  emailOrUsername: string
): Promise<{
  _id: unknown;
  name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  isActive: boolean;
} | null> {
  const key = emailOrUsername.trim().toLowerCase();
  return User.findOne({
    $or: [{ email: key }, { username: key }],
  })
    .select("+password")
    .lean()
    .exec() as Promise<{
    _id: unknown;
    name: string;
    email: string;
    username: string;
    password: string;
    role: UserRole;
    isActive: boolean;
  } | null>;
}

export async function findByIdSafe(id: string) {
  return User.findById(id).lean().exec();
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class UserMgmtError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "UserMgmtError";
  }
}

export async function listUsers(params: {
  page: number;
  limit: number;
  role?: UserRole;
  search?: string;
  status: "all" | "active" | "inactive";
  sortBy: "createdAt" | "name" | "email" | "role";
  sortOrder: "asc" | "desc";
}) {
  const filter: FilterQuery<unknown> = {};

  if (params.role) filter.role = params.role;
  if (params.status === "active") filter.isActive = true;
  if (params.status === "inactive") filter.isActive = false;

  if (params.search?.trim()) {
    const q = escapeRegex(params.search.trim());
    filter.$or = [
      { name: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
      { username: new RegExp(q, "i") },
      { phone: new RegExp(q, "i") },
      { city: new RegExp(q, "i") },
    ];
  }

  const sort: Record<string, 1 | -1> = {
    [params.sortBy]: params.sortOrder === "asc" ? 1 : -1,
  };

  const skip = (params.page - 1) * params.limit;

  const [rawUsers, total] = await Promise.all([
    User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(params.limit)
      .populate("createdBy", "name email username")
      .lean()
      .exec(),
    User.countDocuments(filter),
  ]);

  const users = rawUsers.map((u) => {
    const o = { ...u } as Record<string, unknown>;
    if (o._id) {
      o.id = String(o._id);
      delete o._id;
    }
    delete o.__v;
    delete o.password;
    return o;
  });

  return {
    users,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit) || 1,
  };
}

export async function getUserByIdPublic(id: string) {
  const u = await User.findById(id).populate("createdBy", "name email username").lean().exec();
  if (!u) throw new UserMgmtError("User not found", 404);
  const o = { ...u } as Record<string, unknown>;
  if (o._id) {
    o.id = String(o._id);
    delete o._id;
  }
  delete o.__v;
  delete o.password;
  return o;
}

export async function createUser(
  body: {
    name: string;
    email: string;
    username: string;
    password: string;
    role: UserRole;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    profileImage?: string;
  },
  createdById: string
) {
  const email = body.email.toLowerCase().trim();
  const username = body.username.toLowerCase().trim();

  const [emailTaken, userTaken] = await Promise.all([
    User.exists({ email }),
    User.exists({ username }),
  ]);
  if (emailTaken) throw new UserMgmtError("Email already in use", 409);
  if (userTaken) throw new UserMgmtError("Username already in use", 409);

  const hashed = await bcrypt.hash(body.password, 12);
  const doc = await User.create({
    name: body.name.trim(),
    email,
    username,
    password: hashed,
    role: body.role,
    phone: body.phone ?? "",
    address: body.address ?? "",
    city: body.city ?? "",
    state: body.state ?? "",
    pincode: body.pincode ?? "",
    profileImage: body.profileImage ?? "",
    isActive: true,
    createdBy: new mongoose.Types.ObjectId(createdById),
  });

  return getUserByIdPublic(String(doc._id));
}

export async function updateUser(
  id: string,
  body: Partial<{
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    profileImage: string;
    role: UserRole;
    isActive: boolean;
  }>,
  actorId: string
) {
  if (id === actorId && body.isActive === false) {
    throw new UserMgmtError("You cannot deactivate your own account", 400);
  }
  if (id === actorId && body.role && body.role !== "admin") {
    throw new UserMgmtError("You cannot change your own role away from admin", 400);
  }

  const user = await User.findById(id);
  if (!user) throw new UserMgmtError("User not found", 404);

  if (body.name !== undefined) user.name = body.name.trim();
  if (body.phone !== undefined) user.phone = body.phone.trim();
  if (body.address !== undefined) user.address = body.address.trim();
  if (body.city !== undefined) user.city = body.city.trim();
  if (body.state !== undefined) user.state = body.state.trim();
  if (body.pincode !== undefined) user.pincode = body.pincode.trim();
  if (body.profileImage !== undefined) user.profileImage = body.profileImage.trim();
  if (body.role !== undefined) user.role = body.role;
  if (body.isActive !== undefined) user.isActive = body.isActive;

  await user.save();
  return getUserByIdPublic(id);
}

export async function softDeleteUser(id: string, actorId: string) {
  if (id === actorId) {
    throw new UserMgmtError("You cannot delete your own account", 400);
  }
  const user = await User.findById(id);
  if (!user) throw new UserMgmtError("User not found", 404);
  user.isActive = false;
  await user.save();
  return { id, isActive: false };
}

export async function patchUserStatus(id: string, isActive: boolean, actorId: string) {
  if (id === actorId && !isActive) {
    throw new UserMgmtError("You cannot deactivate your own account", 400);
  }
  const user = await User.findById(id);
  if (!user) throw new UserMgmtError("User not found", 404);
  user.isActive = isActive;
  await user.save();
  return getUserByIdPublic(id);
}

/** Demo accounts for local/dev login (email or username + password + role on form). */
export const DEMO_USERS: Array<{
  name: string;
  email: string;
  username: string;
  password: string;
  role: UserRole;
  phone: string;
}> = [
  {
    name: "System Admin",
    email: "admin@erepairhub.com",
    username: "admin",
    password: "admin123",
    role: "admin",
    phone: "",
  },
  {
    name: "Franchise Owner",
    email: "franchise@erepairhub.com",
    username: "franchise",
    password: "franchise123",
    role: "franchise",
    phone: "",
  },
  {
    name: "Delivery Partner",
    email: "delivery@erepairhub.com",
    username: "delivery",
    password: "delivery123",
    role: "delivery",
    phone: "",
  },
];

/** On server start: create any missing demo user (does not reset existing passwords). */
export async function ensureDefaultUsers(): Promise<void> {
  let created = 0;
  for (const u of DEMO_USERS) {
    const exists = await User.exists({
      $or: [
        { email: u.email.toLowerCase() },
        { username: u.username.toLowerCase() },
      ],
    });
    if (exists) continue;

    const hashed = await bcrypt.hash(u.password, 12);
    await User.create({
      name: u.name,
      email: u.email,
      username: u.username,
      password: hashed,
      role: u.role,
      phone: u.phone,
      address: "",
      city: "",
      state: "",
      pincode: "",
      profileImage: "",
      isActive: true,
    });
    created += 1;
    console.log(`[seed] Created demo user: role=${u.role}  email=${u.email}  username=${u.username}`);
  }

  if (created === 0) {
    console.log("[seed] All demo users already exist. To reset passwords run: npm run seed:users");
  } else {
    console.log(
      `[seed] Added ${created} user(s). Passwords are not printed here; run: npm run seed:users (backend) to see the login table.`
    );
  }
}

/**
 * Upserts all three demo users (creates or overwrites password/role/active).
 * Dev only — run: npm run seed:users
 */
export async function upsertDemoUsers(): Promise<void> {
  for (const u of DEMO_USERS) {
    const hashed = await bcrypt.hash(u.password, 12);
    await User.findOneAndUpdate(
      {
        $or: [
          { email: u.email.toLowerCase() },
          { username: u.username.toLowerCase() },
        ],
      },
      {
        $set: {
          name: u.name,
          email: u.email.toLowerCase(),
          username: u.username.toLowerCase(),
          password: hashed,
          role: u.role,
          phone: u.phone,
          address: "",
          city: "",
          state: "",
          pincode: "",
          profileImage: "",
          isActive: true,
        },
      },
      { upsert: true }
    );
  }
}
