/**
 * Upserts the three role demo users and prints login IDs + passwords in the terminal.
 * Run: npm run seed:users   (from repo root or backend folder)
 * Needs backend/.env with MONGO_URI (+ JWT_SECRET required by env module — set any value for this script).
 */
import { connectDB } from "../database/connection.js";
import { DEMO_USERS, upsertDemoUsers } from "../modules/users/user.service.js";

async function main() {
  await connectDB();
  await upsertDemoUsers();

  console.log("\n========== Demo login (database) ==========");
  console.log("Use Email OR Username in the login form + Password + matching Role.\n");
  for (const u of DEMO_USERS) {
    console.log(`— ${u.role.toUpperCase()}`);
    console.log(`    Email:    ${u.email}`);
    console.log(`    Username: ${u.username}`);
    console.log(`    Password: ${u.password}`);
    console.log(`    Role:     ${u.role}\n`);
  }
  console.log("Panels: /admin/login  |  /franchise/login  |  /delivery/login");
  console.log("==========================================\n");

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
