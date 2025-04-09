const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// Define the icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Input SVG file
const inputFile = path.join(__dirname, "public", "icons", "base-icon.svg");

// Generate PNG icons for each size
async function generateIcons() {
  try {
    for (const size of sizes) {
      const outputFile = path.join(
        __dirname,
        "public",
        "icons",
        `icon-${size}x${size}.png`
      );

      await sharp(inputFile).resize(size, size).png().toFile(outputFile);

      console.log(`Created: icon-${size}x${size}.png`);
    }
    console.log("All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

generateIcons();
