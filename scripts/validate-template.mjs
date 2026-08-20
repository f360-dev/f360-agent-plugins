#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const errors = [];
const warnings = [];

const pluginNamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const marketplaceNamePattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

const targets = [
  {
    id: "cursor",
    label: "Cursor",
    manifestDir: ".cursor-plugin",
    marketplacePath: path.join(".cursor-plugin", "marketplace.json"),
    requiresMarketplace: true,
  },
  {
    id: "claude",
    label: "Claude",
    manifestDir: ".claude-plugin",
    marketplacePath: path.join(".claude-plugin", "marketplace.json"),
    requiresMarketplace: true,
  },
  {
    id: "codex",
    label: "Codex",
    manifestDir: ".codex-plugin",
    marketplacePath: path.join(".codex-plugin", "marketplace.json"),
    requiresMarketplace: false,
  },
];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectory(targetPath, context) {
  try {
    const stat = await fs.stat(targetPath);
    if (!stat.isDirectory()) {
      addError(`${context} exists but is not a directory: ${targetPath}`);
      return false;
    }
    return true;
  } catch {
    addError(`${context} directory is missing: ${targetPath}`);
    return false;
  }
}

async function readJsonFile(filePath, context) {
  let raw;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch {
    addError(`${context} is missing: ${filePath}`);
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    addError(`${context} contains invalid JSON (${filePath}): ${error.message}`);
    return null;
  }
}

function normalizeNewlines(content) {
  return content.replace(/\r\n/g, "\n");
}

function parseFrontmatter(content) {
  const normalized = normalizeNewlines(content);
  if (!normalized.startsWith("---\n")) {
    return null;
  }

  const closingIndex = normalized.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return null;
  }

  const frontmatterBlock = normalized.slice(4, closingIndex);
  const fields = {};

  for (const line of frontmatterBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const separator = line.indexOf(":");
    if (separator === -1) {
      continue;
    }
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    fields[key] = value;
  }

  return fields;
}

async function walkFiles(dirPath) {
  const files = [];
  const stack = [dirPath];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile()) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

async function listPluginDirectories() {
  const pluginsDir = path.join(repoRoot, "plugins");
  const exists = await ensureDirectory(pluginsDir, "Plugins root");
  if (!exists) {
    return [];
  }

  const entries = await fs.readdir(pluginsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      path: path.join(pluginsDir, entry.name),
      relativePath: path.join("plugins", entry.name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return true;
  }
  if (path.isAbsolute(value)) {
    return false;
  }
  const normalized = path.posix.normalize(value.replace(/\\/g, "/"));
  return !normalized.startsWith("../") && normalized !== "..";
}

function normalizeRelativePath(value) {
  return path.posix.normalize(value.replace(/\\/g, "/").replace(/^\.\//, ""));
}

function extractPathValues(value) {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => extractPathValues(entry));
  }

  if (isObject(value)) {
    const candidates = [];
    if (typeof value.path === "string") {
      candidates.push(value.path);
    }
    if (typeof value.file === "string") {
      candidates.push(value.file);
    }
    return candidates;
  }

  return [];
}

async function validateReferencedPath(pluginDir, context, pathValue) {
  if (pathValue.startsWith("http://") || pathValue.startsWith("https://")) {
    return;
  }

  if (!isSafeRelativePath(pathValue)) {
    addError(
      `${context} has invalid path "${pathValue}". Use a relative path without ".." or absolute prefixes.`
    );
    return;
  }

  const resolved = path.resolve(pluginDir, pathValue);
  const exists = await pathExists(resolved);
  if (!exists) {
    addError(`${context} references missing path "${pathValue}".`);
  }
}

async function validatePathFields(pluginDir, pluginName, target, manifest, fields) {
  for (const field of fields) {
    const values = extractPathValues(manifest[field]);
    for (const value of values) {
      await validateReferencedPath(
        pluginDir,
        `${pluginName}: ${target.label} field "${field}"`,
        value
      );
    }
  }
}

async function validateFrontmatterFile(filePath, componentName, requiredKeys, pluginName) {
  const content = await fs.readFile(filePath, "utf8");
  const parsed = parseFrontmatter(content);
  const relativeFile = path.relative(repoRoot, filePath);

  if (!parsed) {
    addError(`${pluginName}: ${componentName} file missing YAML frontmatter: ${relativeFile}`);
    return;
  }

  for (const key of requiredKeys) {
    if (!parsed[key] || parsed[key].length === 0) {
      addError(`${pluginName}: ${componentName} file missing "${key}" in frontmatter: ${relativeFile}`);
    }
  }
}

async function validateComponentFrontmatter(pluginDir, pluginName) {
  const rulesDir = path.join(pluginDir, "rules");
  if (await pathExists(rulesDir)) {
    const files = await walkFiles(rulesDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".md" || ext === ".mdc" || ext === ".markdown") {
        await validateFrontmatterFile(file, "rule", ["description"], pluginName);
      }
    }
  }

  const skillsDir = path.join(pluginDir, "skills");
  if (await pathExists(skillsDir)) {
    const files = await walkFiles(skillsDir);
    for (const file of files) {
      if (path.basename(file) === "SKILL.md") {
        await validateFrontmatterFile(file, "skill", ["name", "description"], pluginName);
      }
    }
  }

  const agentsDir = path.join(pluginDir, "agents");
  if (await pathExists(agentsDir)) {
    const files = await walkFiles(agentsDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".md" || ext === ".mdc" || ext === ".markdown") {
        await validateFrontmatterFile(file, "agent", ["name", "description"], pluginName);
      }
    }
  }

  const commandsDir = path.join(pluginDir, "commands");
  if (await pathExists(commandsDir)) {
    const files = await walkFiles(commandsDir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === ".md" || ext === ".mdc" || ext === ".markdown" || ext === ".txt") {
        await validateFrontmatterFile(file, "command", ["name", "description"], pluginName);
      }
    }
  }
}

function resolveMarketplaceSource(source, pluginRoot) {
  if (typeof source !== "string" || source.length === 0) {
    return null;
  }
  if (!pluginRoot) {
    return source;
  }
  const normalizedRoot = pluginRoot.replace(/\\/g, "/").replace(/\/+$/, "");
  const normalizedSource = source.replace(/\\/g, "/").replace(/^\.\//, "");
  if (normalizedSource === normalizedRoot || normalizedSource.startsWith(`${normalizedRoot}/`)) {
    return normalizedSource;
  }
  return `${normalizedRoot}/${normalizedSource}`;
}

function requireString(value, context) {
  if (typeof value !== "string" || value.trim().length === 0) {
    addError(`${context} is required and must be a non-empty string.`);
    return false;
  }
  return true;
}

function validateMarketplaceEntryFields(entry, target, label) {
  requireString(entry.description, `${target.label} marketplace ${label}.description`);

  if (target.id === "claude") {
    requireString(entry.version, `${target.label} marketplace ${label}.version`);
    requireString(entry.category, `${target.label} marketplace ${label}.category`);
    if (!isObject(entry.author)) {
      addError(`${target.label} marketplace ${label}.author must contain a name.`);
    } else {
      requireString(entry.author.name, `${target.label} marketplace ${label}.author.name`);
    }
  }
}

async function validateMarketplace(target) {
  const marketplacePath = path.join(repoRoot, target.marketplacePath);

  if (!(await pathExists(marketplacePath))) {
    if (target.requiresMarketplace) {
      addError(`${target.label} marketplace manifest is missing: ${marketplacePath}`);
    }
    return new Map();
  }

  const marketplace = await readJsonFile(marketplacePath, `${target.label} marketplace manifest`);
  if (!marketplace) {
    return new Map();
  }

  if (typeof marketplace.name !== "string" || !marketplaceNamePattern.test(marketplace.name)) {
    addError(
      `${target.label} marketplace "name" must be lowercase kebab-case and start/end with an alphanumeric character.`
    );
  }

  if (!isObject(marketplace.owner) || !requireString(marketplace.owner.name, `${target.label} marketplace owner.name`)) {
    addError(`${target.label} marketplace "owner" must contain a name.`);
  }

  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length === 0) {
    addError(`${target.label} marketplace "plugins" must be a non-empty array.`);
    return new Map();
  }

  const pluginRoot = marketplace.metadata?.pluginRoot;
  if (pluginRoot !== undefined) {
    if (typeof pluginRoot !== "string" || !isSafeRelativePath(pluginRoot)) {
      addError(`${target.label} marketplace "metadata.pluginRoot" must be a safe relative path.`);
    } else {
      const pluginRootAbs = path.join(repoRoot, pluginRoot);
      await ensureDirectory(pluginRootAbs, `${target.label} marketplace "metadata.pluginRoot"`);
    }
  }

  const seenNames = new Set();
  const entriesByName = new Map();

  for (const [index, entry] of marketplace.plugins.entries()) {
    const label = `plugins[${index}]`;

    if (!isObject(entry)) {
      addError(`${target.label} marketplace ${label} must be an object.`);
      continue;
    }

    if (typeof entry.name !== "string" || !pluginNamePattern.test(entry.name)) {
      addError(
        `${target.label} marketplace ${label}.name must be lowercase and use only alphanumerics, hyphens, and periods.`
      );
      continue;
    }

    if (seenNames.has(entry.name)) {
      addError(`Duplicate plugin name in ${target.label} marketplace manifest: "${entry.name}"`);
    }
    seenNames.add(entry.name);
    validateMarketplaceEntryFields(entry, target, label);

    const sourcePath = resolveMarketplaceSource(entry.source, pluginRoot ?? "");
    if (!sourcePath) {
      addError(`${target.label} marketplace ${label}.source must be a string path.`);
      continue;
    }
    if (!isSafeRelativePath(sourcePath)) {
      addError(`${target.label} marketplace ${label}.source is not a safe relative path: "${sourcePath}"`);
      continue;
    }

    const pluginDir = path.join(repoRoot, sourcePath);
    const pluginDirExists = await ensureDirectory(pluginDir, `${target.label} marketplace ${label}.source`);
    if (!pluginDirExists) {
      continue;
    }

    entriesByName.set(entry.name, {
      sourcePath: normalizeRelativePath(sourcePath),
      entry,
    });
  }

  return entriesByName;
}

function validateCommonPluginManifest(manifest, pluginName, target) {
  if (typeof manifest.name !== "string" || !pluginNamePattern.test(manifest.name)) {
    addError(
      `${pluginName}: ${target.label} plugin.json "name" must be lowercase and use only alphanumerics, hyphens, and periods.`
    );
  } else if (manifest.name !== pluginName) {
    addError(`${pluginName}: ${target.label} plugin.json name does not match plugin folder name ("${manifest.name}").`);
  }

  requireString(manifest.version, `${pluginName}: ${target.label} plugin.json version`);
  requireString(manifest.description, `${pluginName}: ${target.label} plugin.json description`);

  if (!isObject(manifest.author)) {
    addError(`${pluginName}: ${target.label} plugin.json author must contain a name.`);
  } else {
    requireString(manifest.author.name, `${pluginName}: ${target.label} plugin.json author.name`);
  }
}

async function validateCursorManifest(pluginDir, pluginName, target, manifest) {
  requireString(manifest.displayName, `${pluginName}: Cursor plugin.json displayName`);
  await validatePathFields(pluginDir, pluginName, target, manifest, [
    "logo",
    "rules",
    "skills",
    "agents",
    "commands",
    "hooks",
    "mcpServers",
  ]);
}

async function validateClaudeManifest(pluginDir, pluginName, target, manifest) {
  requireString(manifest.displayName, `${pluginName}: Claude plugin.json displayName`);
  await validatePathFields(pluginDir, pluginName, target, manifest, [
    "logo",
    "rules",
    "skills",
    "agents",
    "commands",
    "hooks",
    "mcpServers",
  ]);
}

async function validateCodexManifest(pluginDir, pluginName, target, manifest) {
  if (!isObject(manifest.interface)) {
    addError(`${pluginName}: Codex plugin.json interface object is required.`);
  } else {
    requireString(manifest.interface.displayName, `${pluginName}: Codex plugin.json interface.displayName`);
    requireString(manifest.interface.shortDescription, `${pluginName}: Codex plugin.json interface.shortDescription`);
    requireString(manifest.interface.developerName, `${pluginName}: Codex plugin.json interface.developerName`);
    requireString(manifest.interface.category, `${pluginName}: Codex plugin.json interface.category`);

    if (!Array.isArray(manifest.interface.capabilities) || manifest.interface.capabilities.length === 0) {
      addError(`${pluginName}: Codex plugin.json interface.capabilities must be a non-empty array.`);
    } else {
      for (const [index, capability] of manifest.interface.capabilities.entries()) {
        requireString(capability, `${pluginName}: Codex plugin.json interface.capabilities[${index}]`);
      }
    }

    for (const field of ["logo", "composerIcon"]) {
      const value = manifest.interface[field];
      if (!requireString(value, `${pluginName}: Codex plugin.json interface.${field}`)) {
        continue;
      }
      await validateReferencedPath(pluginDir, `${pluginName}: Codex field "interface.${field}"`, value);
    }
  }

  await validatePathFields(pluginDir, pluginName, target, manifest, [
    "logo",
    "rules",
    "skills",
    "agents",
    "commands",
    "hooks",
    "mcpServers",
  ]);
}

async function validatePluginManifest(pluginDir, pluginName, target) {
  const manifestPath = path.join(pluginDir, target.manifestDir, "plugin.json");
  const manifest = await readJsonFile(manifestPath, `${pluginName} ${target.label} plugin manifest`);
  if (!manifest) {
    return;
  }

  validateCommonPluginManifest(manifest, pluginName, target);

  if (target.id === "cursor") {
    await validateCursorManifest(pluginDir, pluginName, target, manifest);
  } else if (target.id === "claude") {
    await validateClaudeManifest(pluginDir, pluginName, target, manifest);
  } else if (target.id === "codex") {
    await validateCodexManifest(pluginDir, pluginName, target, manifest);
  }
}

function validateMarketplaceCoverage(pluginDirs, marketplaceEntriesByTarget) {
  for (const target of targets.filter((entry) => entry.requiresMarketplace)) {
    const entries = marketplaceEntriesByTarget.get(target.id) ?? new Map();

    for (const pluginDir of pluginDirs) {
      const marketplaceEntry = entries.get(pluginDir.name);
      if (!marketplaceEntry) {
        addError(`${target.label} marketplace is missing plugin "${pluginDir.name}".`);
        continue;
      }

      const expectedSource = normalizeRelativePath(pluginDir.relativePath);
      if (marketplaceEntry.sourcePath !== expectedSource) {
        addError(
          `${target.label} marketplace plugin "${pluginDir.name}" source should resolve to "${expectedSource}", got "${marketplaceEntry.sourcePath}".`
        );
      }
    }
  }
}

async function validateOptionalResourceWarnings(pluginDir, pluginName) {
  const hooksPath = path.join(pluginDir, "hooks", "hooks.json");
  if (!(await pathExists(hooksPath))) {
    addWarning(`${pluginName}: no hooks/hooks.json file found (only needed when using hooks).`);
  }

  const mcpPath = path.join(pluginDir, "mcp.json");
  const dotMcpPath = path.join(pluginDir, ".mcp.json");
  if (!(await pathExists(mcpPath)) && !(await pathExists(dotMcpPath))) {
    addWarning(`${pluginName}: no mcp.json or .mcp.json file found (only needed when using MCP servers).`);
  }
}

async function main() {
  const pluginDirs = await listPluginDirectories();
  if (pluginDirs.length === 0) {
    addError("No plugin directories found under plugins/.");
    summarizeAndExit();
    return;
  }

  const marketplaceEntriesByTarget = new Map();
  for (const target of targets) {
    marketplaceEntriesByTarget.set(target.id, await validateMarketplace(target));
  }

  validateMarketplaceCoverage(pluginDirs, marketplaceEntriesByTarget);

  for (const pluginDir of pluginDirs) {
    if (!pluginNamePattern.test(pluginDir.name)) {
      addError(`${pluginDir.name}: plugin folder name must be lowercase and use only alphanumerics, hyphens, and periods.`);
      continue;
    }

    for (const target of targets) {
      await validatePluginManifest(pluginDir.path, pluginDir.name, target);
    }

    await validateComponentFrontmatter(pluginDir.path, pluginDir.name);
    await validateOptionalResourceWarnings(pluginDir.path, pluginDir.name);
  }

  summarizeAndExit();
}

function summarizeAndExit() {
  if (warnings.length > 0) {
    console.log("Warnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
    console.log("");
  }

  if (errors.length > 0) {
    console.error("Validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Validation passed.");
}

await main();
