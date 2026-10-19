import { provisionTestIdentities } from "../src/lib/test-auth-provision.server";

const result = await provisionTestIdentities();
console.log(JSON.stringify(result));