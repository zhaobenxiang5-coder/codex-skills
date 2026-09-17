#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME_ROOT = path.join(os.homedir(), 'Library', 'Application Support', 'Google', 'Chrome');

async function checkChromeFileAccess(options = {}) {
  const root = path.resolve(options.chromeRoot || CHROME_ROOT);
  const profiles = await listProfiles(root);
  const matches = [];

  for (const profile of profiles) {
    for (const fileName of ['Preferences', 'Secure Preferences']) {
      const filePath = path.join(profile.path, fileName);
      if (!existsSync(filePath)) continue;
      const parsed = await readJsonSafe(filePath);
      const settings = parsed?.extensions?.settings || {};
      for (const [id, setting] of Object.entries(settings)) {
        const name = setting?.manifest?.name || setting?.manifest?.short_name || '';
        const description = setting?.manifest?.description || '';
        const extensionPath = setting?.path || '';
        const haystack = `${id} ${name} ${description} ${extensionPath}`;
        const isCodex = id === options.extensionId || /(^|\s)Codex(\s|$)|Control Chrome with Codex/i.test(haystack);
        if (!isCodex) continue;
        const allowFileAccess = setting?.allow_file_access === true || setting?.newAllowFileAccess === true;
        matches.push({
          profile: profile.name,
          fileName,
          extensionId: id,
          name,
          state: setting?.state ?? null,
          path: extensionPath,
          allowFileAccess,
          rawAllowFileAccess: setting?.allow_file_access ?? null,
          rawNewAllowFileAccess: setting?.newAllowFileAccess ?? null
        });
      }
    }
  }

  const enabled = matches.find((match) => match.allowFileAccess);
  return {
    ok: Boolean(enabled),
    chromeRoot: root,
    checkedProfiles: profiles.map((profile) => profile.name),
    matches,
    recommendation: enabled
      ? 'Codex Chrome extension file URL access is enabled. Retry background file upload; restart Chrome if upload still returns Not allowed.'
      : 'Enable Chrome extension detail switch: 允许访问文件网址 for Codex, then restart Chrome if file upload still fails.'
  };
}

async function listProfiles(root) {
  if (!existsSync(root)) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const profiles = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const profilePath = path.join(root, entry.name);
    const hasPrefs = existsSync(path.join(profilePath, 'Preferences')) || existsSync(path.join(profilePath, 'Secure Preferences'));
    if (!hasPrefs) continue;
    const info = await stat(profilePath).catch(() => null);
    if (!info?.isDirectory()) continue;
    profiles.push({ name: entry.name, path: profilePath });
  }
  return profiles.sort((a, b) => a.name.localeCompare(b.name));
}

async function readJsonSafe(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function parseArgs(argv = process.argv.slice(2)) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--pretty') options.pretty = true;
    else if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
      options[key] = argv[index + 1];
      index += 1;
    }
  }
  return options;
}

async function main() {
  const options = parseArgs();
  const result = await checkChromeFileAccess(options);
  console.log(JSON.stringify(result, null, options.pretty ? 2 : 0));
  if (!result.ok) process.exitCode = 2;
}

const isCli = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isCli) {
  main().catch((error) => {
    console.error(error?.stack || error?.message || String(error));
    process.exit(1);
  });
}

export { checkChromeFileAccess };
