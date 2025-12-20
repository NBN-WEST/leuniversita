import * as fs from 'fs';
import * as path from 'path';

const MEMORY_BANK_DIR = path.join(process.cwd(), 'docs', 'memory_bank');
const REQUIRED_FIELDS = ['id', 'title', 'owner', 'status', 'mermaid'];

// Simple Front Matter parser without dependencies
function parseFrontMatter(content: string): { data: any, content: string } {
    const lines = content.split('\n');
    if (lines[0].trim() !== '---') {
        return { data: {}, content };
    }

    let end = -1;
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
            end = i;
            break;
        }
    }

    if (end === -1) {
        return { data: {}, content };
    }

    const yamlLines = lines.slice(1, end);
    const bodyLines = lines.slice(end + 1);
    const data: any = {};

    for (const line of yamlLines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(':').trim();
            // Remove quotes if present
            data[key] = value.replace(/^['"](.*)['"]$/, '$1');
        }
    }

    return { data, content: bodyLines.join('\n') };
}

function validateFile(filePath: string): string[] {
    const errors: string[] = [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data: frontMatter, content: body } = parseFrontMatter(content);

    // 1. Check Front Matter
    if (Object.keys(frontMatter).length === 0) {
        errors.push("Missing YAML front-matter (must start and end with ---)");
    } else {
        for (const field of REQUIRED_FIELDS) {
            if (!frontMatter[field]) {
                errors.push(`Missing required field: '${field}'`);
            }
        }
    }

    // 2. Check Mermaid
    if (frontMatter.mermaid === 'required') {
        if (!body.includes('```mermaid')) {
            errors.push("Missing Mermaid diagram (mermaid: required). Add a ```mermaid block.");
        }
    } else if (frontMatter.mermaid && frontMatter.mermaid !== 'not_applicable' && frontMatter.mermaid !== 'required') {
        errors.push(`Invalid mermaid value: '${frontMatter.mermaid}'. Must be 'required' or 'not_applicable'`);
    }

    return errors;
}

function walkDir(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const stat = fs.statSync(path.join(dir, file));
        if (stat.isDirectory()) {
            walkDir(path.join(dir, file), fileList);
        } else {
            if (file.endsWith('.md') && file !== 'TASK_LOG.md') { // Exclude TASK_LOG
                fileList.push(path.join(dir, file));
            }
        }
    }
    return fileList;
}

function main() {
    console.log("🔍 Validating Memory Bank...");
    if (!fs.existsSync(MEMORY_BANK_DIR)) {
        console.error(`Directory not found: ${MEMORY_BANK_DIR}`);
        process.exit(1);
    }

    const files = walkDir(MEMORY_BANK_DIR);
    let hasErrors = false;

    for (const file of files) {
        const relative = path.relative(process.cwd(), file);
        // Skip templates
        if (relative.includes('_TEMPLATES')) continue;

        const errors = validateFile(file);
        if (errors.length > 0) {
            console.error(`❌ ${relative}:`);
            errors.forEach(e => console.error(`   - ${e}`));
            hasErrors = true;
        } else {
            console.log(`✅ ${relative}`);
        }
    }

    if (hasErrors) {
        console.error("\n💥 Validation Failed. Please fix the errors above.");
        process.exit(1);
    } else {
        console.log("\n✨ All Memory Bank files are valid!");
    }
}

main();
