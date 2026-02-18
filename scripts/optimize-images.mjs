import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const galleryImages = [
  { name: "service-1", input: "assets/kipos-service-1.png" },
  { name: "service-2", input: "assets/kipos-service-2.png" },
  { name: "service-3", input: "assets/kipos-service-3.jpg" },
  { name: "service-4", input: "assets/kipos-service-4.jpeg" },
  { name: "service-5", input: "assets/kipos-service-5.jpg" },
  { name: "service-6", input: "assets/kipos-service-6.jpeg" },
];

const logoInput = "assets/logo.png";
const heroInput = "assets/hero-garden.jpeg";

const galleryThumbWidths = [360, 720];
const galleryFullWidths = [1280, 1920];
const logoWidths = [44, 64, 88, 128];
const heroWidths = [960, 1440, 1920];

const quality = {
  avif: { quality: 48, effort: 4 },
  webp: { quality: 74, effort: 5 },
  jpeg: { quality: 78, mozjpeg: true },
  png: { compressionLevel: 9, palette: true },
};

const dirs = {
  galleryThumb: "assets/optimized/gallery/thumb",
  galleryFull: "assets/optimized/gallery/full",
  logo: "assets/optimized/logo",
  hero: "assets/optimized/hero",
};

function fileName(outDir, name, width, ext) {
  return path.join(outDir, `${name}-w${width}.${ext}`);
}

async function writeGalleryVariant(image, outDir, widths) {
  for (const width of widths) {
    const base = sharp(image.input)
      .rotate()
      .resize({ width, withoutEnlargement: true });

    await Promise.all([
      base
        .clone()
        .avif(quality.avif)
        .toFile(fileName(outDir, image.name, width, "avif")),
      base
        .clone()
        .webp(quality.webp)
        .toFile(fileName(outDir, image.name, width, "webp")),
      base
        .clone()
        .jpeg(quality.jpeg)
        .toFile(fileName(outDir, image.name, width, "jpg")),
    ]);
  }
}

async function writeLogoVariants() {
  for (const width of logoWidths) {
    const base = sharp(logoInput)
      .rotate()
      .resize({ width, withoutEnlargement: true });

    await Promise.all([
      base
        .clone()
        .avif(quality.avif)
        .toFile(fileName(dirs.logo, "logo", width, "avif")),
      base
        .clone()
        .webp(quality.webp)
        .toFile(fileName(dirs.logo, "logo", width, "webp")),
      base
        .clone()
        .png(quality.png)
        .toFile(fileName(dirs.logo, "logo", width, "png")),
    ]);
  }
}

async function writeHeroVariants() {
  for (const width of heroWidths) {
    const base = sharp(heroInput)
      .rotate()
      .resize({ width, withoutEnlargement: true });

    await Promise.all([
      base
        .clone()
        .avif({ quality: 52, effort: 4 })
        .toFile(fileName(dirs.hero, "hero-garden", width, "avif")),
      base
        .clone()
        .webp({ quality: 76, effort: 5 })
        .toFile(fileName(dirs.hero, "hero-garden", width, "webp")),
      base
        .clone()
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(fileName(dirs.hero, "hero-garden", width, "jpg")),
    ]);
  }
}

async function main() {
  await Promise.all([
    mkdir(dirs.galleryThumb, { recursive: true }),
    mkdir(dirs.galleryFull, { recursive: true }),
    mkdir(dirs.logo, { recursive: true }),
    mkdir(dirs.hero, { recursive: true }),
  ]);

  for (const image of galleryImages) {
    await writeGalleryVariant(image, dirs.galleryThumb, galleryThumbWidths);
    await writeGalleryVariant(image, dirs.galleryFull, galleryFullWidths);
  }

  await writeLogoVariants();
  await writeHeroVariants();

  console.log("Image optimization complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
