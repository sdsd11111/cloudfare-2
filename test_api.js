const fs = require('fs');

async function testApi() {
  const payload = {
    title: "Test Error 500",
    client: {
      name: "CONSUMIDOR FINAL",
    },
    type: "OTHER",
    subtype: "Test",
    status: "LEAD",
    startDate: new Date().toISOString(),
    address: "",
    city: "",
    categoryList: ["OTRO"],
    contractTypeList: ["OTHER"],
    technicalSpecs: { description: "test" },
    budgetItems: []
  };

  try {
    const res = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We'd need a valid session to bypass auth!
      },
      body: JSON.stringify(payload)
    });

    console.log("Status:", res.status);
    console.log("Response:", await res.text());
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testApi();
