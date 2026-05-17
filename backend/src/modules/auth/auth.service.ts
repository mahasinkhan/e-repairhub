import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { ZodError } from "zod";
import { env } from "../../config/env.js";
import { findByEmailOrUsernameWithPassword } from "../users/user.service.js";
import { loginBodySchema } from "./auth.validation.js";

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export async function loginUser(body: unknown) {
  let parsed;
  try {
    parsed = loginBodySchema.parse(body);
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.errors[0]?.message || "Invalid request";
      throw new AuthError(msg, 400);
    }
    throw e;
  }

  const user = await findByEmailOrUsernameWithPassword(parsed.emailOrUsername);
  if (!user) {
    throw new AuthError("User not found", 404);
  }

  if (!user.isActive) {
    throw new AuthError("Account is inactive", 403);
  }

  if (user.role !== parsed.role) {
    throw new AuthError("Selected role does not match this account", 400);
  }

  const ok = await bcrypt.compare(parsed.password, user.password);
  if (!ok) {
    throw new AuthError("Invalid password", 401);
  }

  const signOptions: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"],
  };
  const token = jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, signOptions);

  return {
    token,
    user: {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export function verifyJwt(token: string): { sub: string; role: string } {
  return jwt.verify(token, env.jwtSecret) as { sub: string; role: string };
}
