import { z } from "zod";

export const loginBodySchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["admin", "franchise", "delivery"], {
    errorMap: () => ({ message: "Invalid role" }),
  }),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
