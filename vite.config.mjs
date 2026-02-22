import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "vite";

function dataFullGalleryAssetsPlugin() {
  const dataFullAttributePattern =
    /\bdata-full-(?:avif|webp|jpg)=(["'])([^"']+)\1/g;
  const remoteUrlPattern = /^(?:[a-z]+:)?\/\//i;
  let rootDir = process.cwd();
  let base = "/";
  const assetRefs = new Map();

  function normalizeAssetPath(url) {
    return url.replace(/^\.\//, "").replace(/^\/+/, "");
  }

  function parseSrcsetCandidates(srcset) {
    return srcset
      .split(",")
      .map((candidate) => candidate.trim())
      .filter(Boolean)
      .map((candidate) => {
        const parts = candidate.split(/\s+/);
        return {
          url: parts[0] ?? "",
          descriptor: parts.slice(1).join(" "),
        };
      });
  }

  function formatSrcsetCandidates(candidates) {
    return candidates
      .map(({ url, descriptor }) => (descriptor ? `${url} ${descriptor}` : url))
      .join(", ");
  }

  function toBuiltAssetUrl(fileName) {
    if (base === "./" || base === "") return `./${fileName}`;
    return `${base.replace(/\/?$/, "/")}${fileName}`;
  }

  async function collectDataFullAssets(pluginContext) {
    const htmlPath = path.resolve(rootDir, "index.html");
    const html = await readFile(htmlPath, "utf8");

    for (const match of html.matchAll(dataFullAttributePattern)) {
      const srcset = match[2];
      for (const { url } of parseSrcsetCandidates(srcset)) {
        if (!url || url.startsWith("data:") || remoteUrlPattern.test(url))
          continue;
        const normalizedPath = normalizeAssetPath(url);
        if (assetRefs.has(normalizedPath)) continue;

        const filePath = path.resolve(rootDir, normalizedPath);
        const source = await readFile(filePath);
        const refId = pluginContext.emitFile({
          type: "asset",
          name: path.basename(filePath),
          source,
        });

        assetRefs.set(normalizedPath, refId);
      }
    }
  }

  return {
    name: "vite:data-full-gallery-assets",
    apply: "build",
    configResolved(config) {
      rootDir = config.root;
      base = config.base ?? "/";
    },
    async buildStart() {
      assetRefs.clear();
      await collectDataFullAssets(this);
    },
    async writeBundle(outputOptions) {
      const outDir = outputOptions.dir
        ? path.resolve(rootDir, outputOptions.dir)
        : path.resolve(rootDir, "dist");
      const indexHtmlPath = path.join(outDir, "index.html");
      let originalHtml = "";

      try {
        originalHtml = await readFile(indexHtmlPath, "utf8");
      } catch {
        return;
      }

      const rewrittenHtml = originalHtml.replace(
        dataFullAttributePattern,
        (fullMatch, quote, srcset) => {
          const rewrittenSrcset = formatSrcsetCandidates(
            parseSrcsetCandidates(srcset).map(({ url, descriptor }) => {
              if (
                !url ||
                url.startsWith("data:") ||
                remoteUrlPattern.test(url)
              ) {
                return { url, descriptor };
              }

              const normalizedPath = normalizeAssetPath(url);
              const refId = assetRefs.get(normalizedPath);
              if (!refId) return { url, descriptor };

              return {
                url: toBuiltAssetUrl(this.getFileName(refId)),
                descriptor,
              };
            }),
          );

          return fullMatch.replace(srcset, rewrittenSrcset);
        },
      );

      if (rewrittenHtml !== originalHtml) {
        await writeFile(indexHtmlPath, rewrittenHtml, "utf8");
      }
    },
  };
}

export default defineConfig({
  plugins: [dataFullGalleryAssetsPlugin()],
  build: {
    target: "es2018",
    sourcemap: false,
    reportCompressedSize: true,
  },
});
