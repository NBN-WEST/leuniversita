const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const outputFile = path.join(rootDir, 'project_structure.json');

const ignoreList = [
    '.git',
    '.next',
    'node_modules',
    '.DS_Store',
    'dist',
    'build',
    '.vercel',
    '.gemini'
];

function getFileTree(dir) {
    const stats = fs.statSync(dir);
    const name = path.basename(dir);

    if (!stats.isDirectory()) {
        return {
            name: name,
            type: 'file',
            path: path.relative(rootDir, dir)
        };
    }

    const children = fs.readdirSync(dir)
        .filter(child => !ignoreList.includes(child))
        .map(child => getFileTree(path.join(dir, child)));

    return {
        name: name,
        type: 'directory',
        path: path.relative(rootDir, dir) || '.',
        children: children
    };
}

const tree = getFileTree(rootDir);

fs.writeFileSync(outputFile, JSON.stringify(tree, null, 2));

console.log(`Project structure saved to ${outputFile}`);
