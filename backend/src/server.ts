import { app } from "./app.js";
import { cloudinaryStartupLine } from "./config/cloudinary.js";
import { env } from "./config/env.js";
import { connectDB } from "./database/connection.js";
import { ensureDefaultUsers } from "./modules/users/user.service.js";

async function main() {
  await connectDB();
  await ensureDefaultUsers();
  app.listen(env.port, () => {
    console.log(
      `[server] http://localhost:${env.port} | auth /auth/* | users /users/* | media /media/* | ${cloudinaryStartupLine()}`
    );
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
