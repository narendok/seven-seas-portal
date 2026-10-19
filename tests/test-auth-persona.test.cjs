const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");

const source = fs.readFileSync("src/lib/test-auth.functions.ts", "utf8");

test("TEST membership only resolves dedicated TEST organizations", () => {
  assert.match(source, /rpc\("resolve_test_membership"\)/);
});

test("TEST membership is server-authenticated and active", () => {
  assert.match(source, /middleware\(\[requireSupabaseAuth\]\)/);
  assert.match(source, /active TEST organization membership/);
});