import path from "node:path";
import { pathToFileURL } from "node:url";
import { User } from "../models/user.model.js";

/**
 * Public demo credentials for the M&M's mart.
 * These are not production secrets. Keep them in sync with README.md.
 * The seed never reads API keys, tokens, or passwords from the environment.
 */
export const DEMO_USERS = [
  {
    username: "demo.customer",
    email: "demo.customer@example.com",
    password: "democustomer",
    fullname: "Demo Customer",
    role: "user",
    readOnly: false,
    isDemo: true,
    phoneNumber: "5550100",
    address: "1 Demo Street",
    city: "Demo City",
    postalCode: "00000",
  },
  {
    username: "demo.admin",
    email: "demo.admin@example.com",
    password: "demoadmin",
    fullname: "Demo Admin",
    role: "admin",
    readOnly: true,
    isDemo: true,
    phoneNumber: "5550101",
    address: "1 Demo Admin Way",
    city: "Demo City",
    postalCode: "00000",
  },
];

const PROFILE_FIELDS = [
  "username",
  "email",
  "fullname",
  "role",
  "phoneNumber",
  "address",
  "city",
  "postalCode",
];

async function upsertDemoUser(spec) {
  const byEmail = await User.findOne({ email: spec.email });
  const byUsername = await User.findOne({ username: spec.username });

  if (byEmail && byUsername && !byEmail._id.equals(byUsername._id)) {
    console.warn(
      `Demo seed skipped for ${spec.username}: email and username belong to different accounts`
    );
    return;
  }

  const existing = byEmail || byUsername;
  if (existing && !existing.isDemo) {
    console.warn(
      `Demo seed skipped for ${spec.username}: a non-demo account already uses that email or username`
    );
    return;
  }

  if (!existing) {
    await User.create(spec);
    console.log(
      `Demo account created: ${spec.username} (${spec.role}${spec.readOnly ? ", read-only" : ""})`
    );
    return;
  }

  const passwordOk = await existing.isPasswordCorrect(spec.password);
  if (!passwordOk) {
    existing.password = spec.password;
  }

  for (const field of PROFILE_FIELDS) {
    existing[field] = spec[field];
  }
  existing.readOnly = spec.readOnly;
  existing.isDemo = true;

  await existing.save();
  console.log(
    `Demo account ready: ${spec.username} (${spec.role}${spec.readOnly ? ", read-only" : ""})`
  );
}

export async function seedDemoUsers() {
  if (process.env.SEED_DEMO_ACCOUNTS === "false") {
    console.log("Demo account seed skipped (SEED_DEMO_ACCOUNTS=false)");
    return;
  }

  for (const spec of DEMO_USERS) {
    await upsertDemoUser(spec);
  }
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

async function runCli() {
  const { default: dotenv } = await import("dotenv");
  const { default: mongoose } = await import("mongoose");
  const { default: connectDB } = await import("../db/index.js");

  dotenv.config({ path: "./.env" });

  try {
    await connectDB();
    await seedDemoUsers();
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (isDirectRun()) {
  runCli();
}
