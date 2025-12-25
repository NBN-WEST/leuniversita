import * as fs from 'fs';
import * as path from 'path';

const rootDir = process.cwd(); // Run from root
const outputFile = path.join(rootDir, 'project_tree.json');

const ignorePatterns = [
    'node_modules',
    '.git',
    '.next',
    '.DS_Store',
    'dist',
    'build',
    '.turbo',
    'coverage',
    '.gemini',
    '.system_generated'
];

interface FileNode {
    name: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    path: string; // Relative path for clarity
}

function scanDirectory(dir: string, relativeRoot: string = ''): FileNode[] {
    const items = fs.readdirSync(dir);
    const infoData: FileNode[] = [];

    for (const item of items) {
        if (ignorePatterns.includes(item)) continue;

        const fullPath = path.join(dir, item);
        const relativePath = path.join(relativeRoot, item);

        try {
            const stats = fs.statSync(fullPath);

            if (stats.isDirectory()) {
                infoData.push({
                    name: item,
                    type: 'directory',
                    path: relativePath,
                    children: scanDirectory(fullPath, relativePath)
                });
            } else {
                infoData.push({
                    name: item,
                    type: 'file',
                    path: relativePath
                });
            }
        } catch (e) {
            console.error(`Error scanning ${fullPath}:`, e);
        }
    }

    // Sort: directories first, then files
    return infoData.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
    });
}

console.log(`Scanning directory: ${rootDir}`);
const tree = {
    root: rootDir,
    timestamp: new Date().toISOString(),
    structure: scanDirectory(rootDir)
};

fs.writeFileSync(outputFile, JSON.stringify(tree, null, 2));
console.log(`Project tree saved to: ${outputFile}`);
