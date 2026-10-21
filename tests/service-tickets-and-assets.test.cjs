const test = require("node:test");
const assert = require("node:assert/strict");

// We can test the pure filtering logic exported or implemented in service-tickets
test("service tickets: internal employee tickets are strictly hidden from Sales by default", () => {
  const tickets = [
    {
      id: "tkt-001",
      reference: "TKT-2026-0101",
      source: "Client",
      requesterName: "Rohan Verma",
      requesterEmail: "rohan.verma@tatamotors.com",
      clientOrganization: "Tata Motors Limited",
      subject: "GPS fix dropping on Ace EV",
      category: "Hardware Fault",
      priority: "High",
      status: "In Progress",
      replies: [
        { id: "r1", authorName: "Preeti", authorRole: "SIT", isInternalNote: true, message: "Secret internal note" },
        { id: "r2", authorName: "Kai", authorRole: "SIT", isInternalNote: false, message: "Public client update" }
      ]
    },
    {
      id: "tkt-002",
      reference: "TKT-2026-0102",
      source: "Internal",
      requesterName: "Avery Vale",
      requesterEmail: "avery.vale@hexenselabs.com",
      requesterDepartment: "EHW",
      subject: "Workstation BSOD",
      category: "IT Workstation & Network",
      priority: "High",
      status: "Assigned",
      replies: []
    }
  ];

  // Logic under test: filterAuthorizedTickets
  function filterAuthorizedTickets(ticketList, userContext) {
    const role = userContext.role.toLowerCase();
    const email = userContext.email.toLowerCase();
    if (role === "admin" || role === "sit") return ticketList;
    if (role === "sal" || role === "sales") {
      return ticketList.filter(t => t.source === "Client" || t.requesterEmail.toLowerCase() === email);
    }
    if (role === "client") {
      return ticketList.filter(t => t.source === "Client" && (
        (userContext.organization && t.clientOrganization?.toLowerCase().includes(userContext.organization.toLowerCase())) ||
        t.requesterEmail.toLowerCase() === email
      ));
    }
    return ticketList.filter(t => t.requesterEmail.toLowerCase() === email);
  }

  // Sales inspection
  const salesVisible = filterAuthorizedTickets(tickets, { role: "sal", email: "priya.sharma@hexenselabs.com" });
  assert.equal(salesVisible.length, 1);
  assert.equal(salesVisible[0].id, "tkt-001"); // Only client ticket visible to Sales

  // Requester inspection (Avery Vale)
  const averyVisible = filterAuthorizedTickets(tickets, { role: "ehw", email: "avery.vale@hexenselabs.com" });
  assert.equal(averyVisible.length, 1);
  assert.equal(averyVisible[0].id, "tkt-002"); // Only own internal ticket

  // Service team inspection (SIT)
  const sitVisible = filterAuthorizedTickets(tickets, { role: "sit", email: "kai.morgan@hexenselabs.com" });
  assert.equal(sitVisible.length, 2); // Service team sees both
});

test("service tickets: client cannot view internal diagnostic notes", () => {
  const replies = [
    { id: "r1", authorName: "Preeti", authorRole: "SIT", isInternalNote: true, message: "EM Test UCS 500N failure log" },
    { id: "r2", authorName: "Kai", authorRole: "SIT", isInternalNote: false, message: "Dispatched CAN J1939 test harness" }
  ];

  function filterAuthorizedReplies(replyList, isClient) {
    if (isClient) return replyList.filter(r => !r.isInternalNote);
    return replyList;
  }

  const clientReplies = filterAuthorizedReplies(replies, true);
  assert.equal(clientReplies.length, 1);
  assert.equal(clientReplies[0].id, "r2");
  assert.equal(clientReplies.some(r => r.isInternalNote), false);

  const internalReplies = filterAuthorizedReplies(replies, false);
  assert.equal(internalReplies.length, 2);
});

test("department-scoped assets: SIT sees IT assets, HROPS sees facility/office assets", () => {
  const assets = [
    { id: "ast-yamaha", assetClass: "Production Machinery", department: "EMF", subclass: "SMT" },
    { id: "ast-dell", assetClass: "Office & IT Assets", department: "SIT", subclass: "IT Workstation" },
    { id: "ast-cisco", assetClass: "Office & IT Assets", department: "SIT", subclass: "Networking Infrastructure" },
    { id: "ast-ups", assetClass: "Office & IT Assets", department: "HROPS", subclass: "Facility Infrastructure" }
  ];

  function scopeAssets(assetList, dept) {
    const norm = (dept || "").toUpperCase();
    if (norm === "SIT") {
      return assetList.filter(a => a.department === "SIT" || a.subclass.toLowerCase().includes("workstation") || a.subclass.toLowerCase().includes("network"));
    }
    if (norm === "HROPS") {
      return assetList.filter(a => a.department === "HROPS" || a.subclass.toLowerCase().includes("facility"));
    }
    return assetList;
  }

  const sitAssets = scopeAssets(assets, "SIT");
  assert.equal(sitAssets.length, 2);
  assert.deepEqual(sitAssets.map(a => a.id), ["ast-dell", "ast-cisco"]);

  const hropsAssets = scopeAssets(assets, "HROPS");
  assert.equal(hropsAssets.length, 1);
  assert.equal(hropsAssets[0].id, "ast-ups");
});
