const path = require("path");
const upload = require("../../src/middleware/storeIMG");

describe("Multer storage configuration", () => {
  const mockFile = {
    originalname: "sample image.jpg",
  };

  it("should resolve the correct destination path", (done) => {
    upload.storage.getDestination({}, mockFile, (err, destination) => {
      expect(err).toBeNull();
      expect(destination).toBe(path.join(__dirname, "../../assets/docIMGs"));
      done();
    });
  });

  it("should generate a unique and sanitized filename", (done) => {
    const startTime = Date.now();

    upload.storage.getFilename({}, mockFile, (err, filename) => {
      expect(err).toBeNull();

      const [timestampStr, name] = filename.split("-");
      const timestamp = parseInt(timestampStr, 10);

      expect(name).toBe("sample_image.jpg");
      expect(timestamp).toBeGreaterThanOrEqual(startTime);
      expect(filename).toMatch(/^\d+-sample_image\.jpg$/);
      done();
    });
  });
});