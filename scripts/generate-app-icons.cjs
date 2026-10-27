// Rasterize the existing BenchScout mark with padding for rounded home-screen masks.
const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

async function main() {
    const root = path.resolve(__dirname, "..");
    const source = await fs.readFile(path.join(root, "app/icon.svg"), "utf8");
    const mark = source.replace(/<defs>[\s\S]*?<\/defs>/, "")
        .replace(/viewBox="[^"]+"/, 'viewBox="10 5 34 47"');
    await fs.mkdir(path.join(root, "public/icons"), { recursive: true });
    for (const [size, destination] of [
        [192, "public/icons/benchscout-192.png"],
        [512, "public/icons/benchscout-512.png"],
        [512, "public/icons/benchscout-maskable-512.png"],
        [180, "app/apple-icon.png"],
    ]) {
        const height = Math.round(size * 0.66);
        const logo = await sharp(Buffer.from(mark)).resize({ height }).png().toBuffer();
        await sharp({ create: { width: size, height: size, channels: 4, background: "#edf5fd" } })
            .composite([{ input: logo, gravity: "centre" }])
            .png().toFile(path.join(root, destination));
    }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
