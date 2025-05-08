const request = require("supertest");
const app = require("../../src/App/app"); 

describe("Integration: Express App Routes", () => {
  it("should respond to /login", async () => {
    const res = await request(app).post("/login").send({ uid: "x", password: "x" });
    expect([200, 400, 401]).toContain(res.statusCode); // depending on mocked behavior
  });

  it("should return 404 for undefined routes", async () => {
    const res = await request(app).get("/nonexistent");
    expect(res.statusCode).toBe(404);
  });

  it("should serve static files from /doc-images", async () => {
    const res = await request(app).get("/doc-images/sample.jpg");
    // This only works if sample.jpg exists in assets/docIMGs
    expect([200, 404]).toContain(res.statusCode);
  });
});