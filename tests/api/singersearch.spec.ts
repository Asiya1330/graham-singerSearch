import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5000/api/search";

test.describe("SingerSearch API Search Tests", () => {

  test("Voice filter works", async ({ request }) => {
    const response = await request.get(`${BASE}?voiceType=Soprano`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test("Performance type filter works", async ({ request }) => {
    const response = await request.get(`${BASE}?performanceTypes=Opera`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test("Role or work search works", async ({ request }) => {
    const response = await request.get(`${BASE}?roleOrWork=Rodolfo`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test("Emergency filter works", async ({ request }) => {
    const response = await request.get(`${BASE}?emergencyMode=true`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test("Voice filters change results", async ({ request }) => {
    const sopranoResponse = await request.get(`${BASE}?voiceType=Soprano`);
    const tenorResponse = await request.get(`${BASE}?voiceType=Tenor`);

    const sopranos = await sopranoResponse.json();
    const tenors = await tenorResponse.json();

    expect(sopranos.length).not.toEqual(tenors.length);
  });

  test("Combined filters work together", async ({ request }) => {
    const response = await request.get(`${BASE}?voiceType=Soprano&performanceTypes=Opera`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test("Emergency ready singers return results", async ({ request }) => {
    const response = await request.get(`${BASE}?emergencyMode=true&voiceType=Soprano`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.length).toBeGreaterThan(0);
  });

  test("Impossible search returns empty array", async ({ request }) => {
  const response = await request.get(`${BASE}?voiceType=Bass&roleOrWork=QueenOfTheNight`);
  expect(response.ok()).toBeTruthy();

  const data = await response.json();
  expect(data.length).toBe(0);
});

const voiceTypes = [
  "Soprano",
  "Mezzo-Soprano",
  "Tenor",
  "Baritone",
  "Bass"
];

for (const voice of voiceTypes) {
  test(`Voice type search works for ${voice}`, async ({ request }) => {
    const response = await request.get(`${BASE}?voiceType=${voice}`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });
}

const performanceTypes = [
  "Opera",
  "Orchestra",
  "Chorus",
  "Other"
];

for (const type of performanceTypes) {
  test(`Performance type search works for ${type}`, async ({ request }) => {
    const response = await request.get(`${BASE}?performanceTypes=${type}`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    });
}

});
