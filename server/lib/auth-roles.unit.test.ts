import test from "node:test";
import assert from "node:assert/strict";
import {
  rolesFromAppMetadata,
  hasAppRole,
  withRoleAdded,
  withRoleRemoved,
} from "./auth-roles";

test("rolesFromAppMetadata reads the roles array", () => {
  assert.deepEqual(
    rolesFromAppMetadata({ roles: ["singer", "organization"] }),
    ["singer", "organization"],
  );
});

test("rolesFromAppMetadata accepts the legacy single role", () => {
  assert.deepEqual(rolesFromAppMetadata({ role: "admin" }), ["admin"]);
});

test("rolesFromAppMetadata prefers roles[] when both are present", () => {
  assert.deepEqual(
    rolesFromAppMetadata({ role: "admin", roles: ["singer"] }),
    ["singer"],
  );
});

test("rolesFromAppMetadata is empty for missing or malformed metadata", () => {
  assert.deepEqual(rolesFromAppMetadata(null), []);
  assert.deepEqual(rolesFromAppMetadata(undefined), []);
  assert.deepEqual(rolesFromAppMetadata({}), []);
  assert.deepEqual(rolesFromAppMetadata({ role: "" }), []);
});

test("a singer token does not satisfy the admin role", () => {
  const meta = { roles: ["singer"] };
  assert.equal(hasAppRole(meta, "singer"), true);
  assert.equal(hasAppRole(meta, "admin"), false);
  assert.equal(hasAppRole(meta, "organization"), false);
});

test("empty metadata grants nothing", () => {
  assert.equal(hasAppRole({}, "singer"), false);
  assert.equal(hasAppRole(null, "admin"), false);
});

test("withRoleAdded does not duplicate an existing role", () => {
  assert.deepEqual(withRoleAdded(["singer"], "singer"), ["singer"]);
  assert.deepEqual(withRoleAdded(["singer"], "organization"), [
    "singer",
    "organization",
  ]);
});

test("withRoleRemoved keeps the other roles intact", () => {
  assert.deepEqual(
    withRoleRemoved(["admin", "singer"], "admin"),
    ["singer"],
  );
  assert.deepEqual(withRoleRemoved(["singer"], "admin"), ["singer"]);
});

test("revoking one role never strips admin from a dual-role user", () => {
  const roles = ["admin", "singer"];
  assert.deepEqual(withRoleRemoved(roles, "singer"), ["admin"]);
});
