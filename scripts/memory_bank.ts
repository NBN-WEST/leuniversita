import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { execSync } from 'child_process';

// --- Configuration ---
const DOCS_DIR = path.join(process.cwd(), 'docs', 'memory_bank');
const AGENTS_DIR = path.join(process.cwd(), 'agents', 'memory');
const CHANGELOG_PATH = path.join(DOCS_DIR, 'CHANGELOG.md');
const TASK_LOG_PATH = path.join(DOCS_DIR, 'TASK_LOG.md');
const INDEX_PATH = path.join(DOCS_DIR, 'INDEX.md');
const RELEASE_NOTES_PATH = path.join(DOCS_DIR, 'RELEASE_NOTES.md');
const AGENTS_CONTEXT_PATH = path.join(AGENTS_DIR, 'agents_context.md');
const LAST_TASK_PATH = path.join(AGENTS_DIR, 'last_task_summary.md');

const DANGEROUS_PATTERNS = [
    /SUPABASE_SERVICE_ROLE_KEY=/,
    /OPENAI_API_KEY=/,
    /sk-[a-zA-Z0-9]{20,}/,
    /eyJhbGci/, // JWT start
];

// --- Helpers ---
const run = (cmd: string) => execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' }).trim();
const log = (msg: string) => console.log(`[MEMORY_BANK] ${msg}`);
const error = (msg: string) => { console.error(`[ERROR] ${msg}`); process.exit(1); };

function ask(question: string): Promise<string> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

// --- Steps ---

// 1. Secret Scanning
function scanForSecrets() {
    log("Scanning for secrets...");
    const stagedFiles = run('git diff --name-only --cached').split('\n').filter(Boolean);

    let found = false;
    for (const file of stagedFiles) {
        if (!fs.existsSync(file)) continue;
        const content = fs.readFileSync(file, 'utf-8');
        for (const pattern of DANGEROUS_PATTERNS) {
            if (pattern.test(content)) {
                console.error(`[SECURITY] Potential secret found in ${file} matching ${pattern}`);
                found = true;
            }
        }
    }

    if (found) {
        error("Secrets detected in staged files. Aborting commit. Please unstage/remove them.");
    }
    log("Secret scan passed.");
}

// 2. Determine Version
function getNextVersion(type: 'patch' | 'minor' | 'major'): string {
    let lastTag = 'v0.0.0';
    try {
        lastTag = run('git describe --tags --abbrev=0');
    } catch (e) {
        log("No tags found, starting from v0.0.0");
    }

    // eslint-disable-next-line prefer-const
    let [major, minor, patch] = lastTag.replace('v', '').split('.').map(Number);

    if (type === 'major') { major++; minor = 0; patch = 0; }
    else if (type === 'minor') { minor++; patch = 0; }
    else { patch++; }

    return `v${major}.${minor}.${patch}`;
}

// 3. Update Docs
function updateDocs(version: string, comment: string, task: string, type: string) {
    const date = new Date().toISOString().split('T')[0];

    // TASK_LOG
    if (fs.existsSync(TASK_LOG_PATH)) {
        const entry = `| ${new Date().toISOString()} | ${task} | ${comment} | Auto-detected | PASS | Check Next |`;
        fs.appendFileSync(TASK_LOG_PATH, `\n${entry}`);
        log("Updated TASK_LOG.md");
    }

    // CHANGELOG
    if (fs.existsSync(CHANGELOG_PATH)) {
        const content = fs.readFileSync(CHANGELOG_PATH, 'utf-8');
        const newEntry = `\n## [${version}] - ${date}\n- ${comment} (Task: ${task})\n`;
        // Insert after header
        const updated = content.replace(/(## \[Unreleased\])/, `$1\n${newEntry}`);
        fs.writeFileSync(CHANGELOG_PATH, updated);
        log("Updated CHANGELOG.md");
    }

    // RELEASE_NOTES
    if (fs.existsSync(RELEASE_NOTES_PATH)) {
        const notes = `# Release Notes\n\n## Latest Release\n**Version**: ${version}\n**Date**: ${date}\n\n### Summary\n${comment}\n`;
        fs.writeFileSync(RELEASE_NOTES_PATH, notes);
        log("Updated RELEASE_NOTES.md");
    }

    // INDEX
    if (fs.existsSync(INDEX_PATH)) {
        let content = fs.readFileSync(INDEX_PATH, 'utf-8');
        content = content.replace(/\*\*v[0-9]+\.[0-9]+\.[0-9]+\*\*/, `**${version}**`);
        fs.writeFileSync(INDEX_PATH, content);
        log("Updated INDEX.md");
    }

    // AGENTS MEMORY
    if (fs.existsSync(LAST_TASK_PATH)) {
        const summary = `# Last Task Summary\n\n**Task**: ${task}\n**Status**: CLOSED (v${version})\n**Date**: ${date}\n**Comment**: ${comment}\n`;
        fs.writeFileSync(LAST_TASK_PATH, summary);
        log("Updated agents/last_task_summary.md");
    }
}

// 4. Generate Mermaid (Major only)
function generateMermaid(version: string) {
    const diagramPath = path.join(DOCS_DIR, 'ARCHITECTURE', 'diagrams', `release_${version.replace(/\./g, '_')}.mmd`);
    const content = `graph TD
    User -->|Chat| EdgeFunctions
    EdgeFunctions -->|Query| VectorDB
    VectorDB -->|Context| OpenAI
    OpenAI -->|Response| User
    subgraph Ingestion
        PDF -->|Parse| Chunks
        Chunks -->|Embed| VectorDB
    end
    %% Generated for ${version}`;

    fs.writeFileSync(diagramPath, content);
    log(`Generated Mermaid diagram: ${diagramPath}`);

    // Update current pointer
    const currentArchPath = path.join(DOCS_DIR, 'ARCHITECTURE', 'current.md');
    if (fs.existsSync(currentArchPath)) {
        let arch = fs.readFileSync(currentArchPath, 'utf-8');
        arch += `\n\nLast Release Diagram: [${version}](./diagrams/release_${version.replace(/\./g, '_')}.mmd)`;
        fs.writeFileSync(currentArchPath, arch);
    }
}

// --- Main ---
async function main() {
    // Parse Args
    const args = process.argv.slice(2);
    let type = args.find(a => a === 'major' || a === 'minor' || a === 'patch') as 'major' | 'minor' | 'patch' | undefined;
    let comment = args.find(a => a.startsWith('--comment='))?.split('=')[1];
    let task = args.find(a => a.startsWith('--task='))?.split('=')[1];

    if (!type) {
        const ans = await ask("Release Type (patch/minor/major): ");
        if (['patch', 'minor', 'major'].includes(ans)) type = ans as any;
        else type = 'patch';
    }
    if (!comment) {
        comment = await ask("Release Comment: ");
    }
    if (!task) {
        task = await ask("Task ID/Name: ");
    }

    // 1. Scan Secrets
    scanForSecrets();

    // 2. Bump
    const version = getNextVersion(type!);
    log(`Bumping to ${version} (${type})`);

    // 3. Update Files
    updateDocs(version, comment!, task!, type!);

    // 4. Mermaid if Major
    if (type === 'major') {
        generateMermaid(version);
        run(`git add docs/memory_bank/ARCHITECTURE/`);
    }

    // 5. Git Commit & Tag
    log("Committing and Tagging...");
    try {
        run('git add docs agents'); // Add updated docs
        run(`git commit -m "chore(release): ${version} - ${comment}"`);
        run(`git tag ${version}`);
        log(`Successfully created ${version}`);

        console.log(`\n✅ MEMORY_BANK completed: ${version}`);
        console.log(`Run 'git push && git push --tags' to publish.`);
    } catch (e) {
        error(`Git operation failed: ${e}`);
    }
}

main().catch(err => error(`Unexpected error: ${err}`));
