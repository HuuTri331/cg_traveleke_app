import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHUNKS_DIR = path.resolve(__dirname, '../.next/static/chunks');
const OUTPUT_DIR = path.resolve(__dirname, '../dist/critical');
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, 'critical-home.css');
const SRC_STYLES_OUTPUT = path.resolve(__dirname, '../src/styles/critical-home.css');

/**
 * Above-The-Fold (ATF) Element Selectors for Traveleke Landing / Home Viewport.
 * Includes Header, Navbar, Hero Banner, Search Form, Brand Logo, and Micro-typography tokens.
 */
const ATF_KEYWORDS = [
  // Layout & Container
  'min-h-screen', 'max-w-screen-xl', 'max-w-6xl', 'mx-auto', 'px-4', 'py-3', 'sticky', 'top-0', 'z-50',
  // Header & Navigation Menu
  'shadow-md', 'bg-white', 'border-gray', 'rounded-lg', 'rounded-xl', 'rounded-2xl',
  'flex', 'items-center', 'justify-between', 'gap-1', 'gap-2', 'gap-3', 'gap-4',
  'text-gray-900', 'text-gray-700', 'text-gray-500', 'text-sm', 'text-xs', 'font-bold', 'font-semibold',
  'hover\\:bg-gray-100', 'hover\\:text-blue-500', 'hover\\:text-traveloka-blue',
  // Hero Banner & Search Callouts
  'bg-cover', 'bg-center', 'text-white', 'text-3xl', 'h-\\[400px\\]', 'flex-grow',
  'bg-traveloka-blue', 'text-traveloka-blue', 'bg-traveloka-orange', 'text-traveloka-orange',
  'bg-traveloka-navy', 'text-traveloka-navy', 'traveloka',
  // Micro-typography and Base tokens
  'text-3xs', 'text-2xs', 'text-xs-plus'
];

function isAtfSelector(selector) {
  if (!selector) return false;
  return ATF_KEYWORDS.some((kw) => selector.includes(kw));
}

/**
 * Enterprise Critical CSS Extraction Engine for Tailwind CSS v4 & Next.js 16
 * Preserves Tailwind Cascade Layer Semantics (properties, theme, base) and filters utilities.
 */
async function extractCriticalCSS() {
  console.log('=================================================================');
  console.log('🚀 ENTERPRISE CRITICAL CSS EXTRACTION PIPELINE (Tailwind CSS v4)');
  console.log('=================================================================');

  if (!fs.existsSync(CHUNKS_DIR)) {
    console.error('❌ Build directory .next/static/chunks not found. Please run `npm run build` first.');
    process.exit(1);
  }

  // 1. Locate the primary production CSS chunk
  const files = fs.readdirSync(CHUNKS_DIR).filter((f) => f.endsWith('.css'));
  if (files.length === 0) {
    console.error('❌ No compiled CSS files found in', CHUNKS_DIR);
    process.exit(1);
  }

  let primaryCssFile = files[0];
  let maxBytes = 0;
  for (const f of files) {
    const stats = fs.statSync(path.join(CHUNKS_DIR, f));
    if (stats.size > maxBytes) {
      maxBytes = stats.size;
      primaryCssFile = f;
    }
  }

  const cssPath = path.join(CHUNKS_DIR, primaryCssFile);
  const rawCSS = fs.readFileSync(cssPath, 'utf-8');
  const originalSizeKb = (Buffer.byteLength(rawCSS, 'utf-8') / 1024).toFixed(2);

  console.log(`📦 Loaded Production CSS: ${primaryCssFile} (${originalSizeKb} KB)`);

  // 2. Parse CSS AST
  const root = postcss.parse(rawCSS);
  const criticalRoot = postcss.root();

  let preservedRulesCount = 0;
  let discardedRulesCount = 0;

  // 3. Process AST by Cascade Layers:
  // - layer properties, theme, base: 100% PRESERVED to maintain Tailwind v4 dependency integrity.
  // - layer utilities: FILTERED to keep only Above-The-Fold classes.
  // - root level rules (:root, body, dark, scrollbar): PRESERVED.
  root.each((node) => {
    // A. Cascade Layers
    if (node.type === 'atrule' && node.name === 'layer') {
      const layerName = node.params.trim();

      // Theme, properties, and base are foundation dependencies
      if (layerName === 'properties' || layerName === 'theme' || layerName === 'base') {
        criticalRoot.append(node.clone());
        preservedRulesCount += node.nodes?.length || 1;
        return;
      }

      // Utilities layer: filter rules to ATF selectors
      if (layerName === 'utilities') {
        const criticalUtilitiesLayer = postcss.atRule({
          name: 'layer',
          params: 'utilities',
        });

        node.each((child) => {
          if (child.type === 'rule') {
            if (isAtfSelector(child.selector)) {
              criticalUtilitiesLayer.append(child.clone());
              preservedRulesCount++;
            } else {
              discardedRulesCount++;
            }
          } else if (child.type === 'atrule' && child.name === 'media') {
            const matchingMedia = child.clone();
            matchingMedia.removeAll();
            child.walkRules((subRule) => {
              if (isAtfSelector(subRule.selector)) {
                matchingMedia.append(subRule.clone());
                preservedRulesCount++;
              } else {
                discardedRulesCount++;
              }
            });
            if (matchingMedia.nodes?.length > 0) {
              criticalUtilitiesLayer.append(matchingMedia);
            }
          }
        });

        criticalRoot.append(criticalUtilitiesLayer);
        return;
      }
    }

    // B. Keyframes
    if (node.type === 'atrule' && node.name === 'keyframes') {
      if (node.params.includes('spin')) {
        criticalRoot.append(node.clone());
        preservedRulesCount++;
      }
      return;
    }

    // C. Top-level Root/Global CSS
    if (node.type === 'rule') {
      // Keep root tokens, body, dark mode, and global fonts
      criticalRoot.append(node.clone());
      preservedRulesCount++;
    }
  });

  const criticalCSS = criticalRoot.toResult().css;
  const criticalSizeBytes = Buffer.byteLength(criticalCSS, 'utf-8');
  const criticalSizeKb = (criticalSizeBytes / 1024).toFixed(2);
  const reductionPercent = (((maxBytes - criticalSizeBytes) / maxBytes) * 100).toFixed(1);

  // 4. Output artifacts
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const banner = `/**\n * AUTO-GENERATED CRITICAL CSS FOR ABOVE-THE-FOLD LANDING VIEWPORT\n * Extracted: ${new Date().toISOString()}\n * Original Stylesheet: ${originalSizeKb} KB -> Critical: ${criticalSizeKb} KB (${reductionPercent}% Reduction)\n */\n`;
  fs.writeFileSync(OUTPUT_FILE, banner + criticalCSS, 'utf-8');
  fs.writeFileSync(SRC_STYLES_OUTPUT, banner + criticalCSS, 'utf-8');

  console.log(`✅ Critical CSS Generated: ${OUTPUT_FILE}`);
  console.log(`✅ Development Mirror: ${SRC_STYLES_OUTPUT}`);
  console.log('-----------------------------------------------------------------');
  console.log(`📊 PERFORMANCE AUDIT METRICS:`);
  console.log(`   • Original Production Stylesheet: ${originalSizeKb} KB`);
  console.log(`   • Inlined Critical CSS Payload:   ${criticalSizeKb} KB`);
  console.log(`   • Critical Rendering Path Saved:  ${reductionPercent}% reduction of render-blocking CSS!`);
  console.log(`   • Preserved Rules:                ${preservedRulesCount} AST nodes`);
  console.log(`   • Discarded Non-Critical Rules:   ${discardedRulesCount} AST nodes`);
  console.log('=================================================================\n');
}

extractCriticalCSS().catch((err) => {
  console.error('❌ Critical CSS extraction failed:', err);
  process.exit(1);
});
