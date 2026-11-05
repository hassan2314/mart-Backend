import assert from "node:assert/strict";
import test from "node:test";
import {
  rejectDemoCredentialChange,
  rejectDemoIdentityChange,
  rejectReadOnly,
} from "./demoAccess.middleware.js";
import { DEMO_USERS } from "../seeds/demoUsers.js";

function run(middleware, req) {
  return new Promise((resolve) => {
    middleware(req, {}, (err) => resolve(err || null));
  });
}

test("demo fixtures match the published README accounts", () => {
  const customer = DEMO_USERS.find((user) => user.username === "demo.customer");
  const admin = DEMO_USERS.find((user) => user.username === "demo.admin");

  assert.ok(customer);
  assert.equal(customer.role, "user");
  assert.equal(customer.readOnly, false);
  assert.equal(customer.isDemo, true);
  assert.equal(customer.email, "demo.customer@example.com");
  assert.equal(customer.password, "democustomer");

  assert.ok(admin);
  assert.equal(admin.role, "admin");
  assert.equal(admin.readOnly, true);
  assert.equal(admin.isDemo, true);
  assert.equal(admin.email, "demo.admin@example.com");
  assert.equal(admin.password, "demoadmin");
});

test("read-only admin can read and cannot write", async () => {
  const user = { readOnly: true, role: "admin", isDemo: true, username: "demo.admin" };

  const getResult = await run(rejectReadOnly, { method: "GET", user });
  assert.equal(getResult, null);

  const postResult = await run(rejectReadOnly, { method: "POST", user });
  assert.equal(postResult.statusCode, 403);

  const patchResult = await run(rejectReadOnly, { method: "PATCH", user, body: {} });
  assert.equal(patchResult.statusCode, 403);
});

test("customer writes are not blocked by the read-only guard", async () => {
  const user = { readOnly: false, role: "user", isDemo: true, username: "demo.customer" };
  const result = await run(rejectReadOnly, { method: "POST", user });
  assert.equal(result, null);
});

test("demo accounts cannot change their password", async () => {
  const blocked = await run(rejectDemoCredentialChange, {
    method: "PUT",
    user: { isDemo: true },
  });
  assert.equal(blocked.statusCode, 403);

  const allowed = await run(rejectDemoCredentialChange, {
    method: "PUT",
    user: { isDemo: false },
  });
  assert.equal(allowed, null);
});

test("demo accounts cannot change username or email", async () => {
  const user = {
    isDemo: true,
    username: "demo.customer",
    email: "demo.customer@example.com",
  };

  const sameIdentity = await run(rejectDemoIdentityChange, {
    user,
    body: { username: "Demo.Customer", email: "demo.customer@example.com", city: "Demo City" },
  });
  assert.equal(sameIdentity, null);

  const renamed = await run(rejectDemoIdentityChange, {
    user,
    body: { username: "someone-else" },
  });
  assert.equal(renamed.statusCode, 403);
});
