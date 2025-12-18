const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2];

if (!inputPath) {
    console.error("Please provide a file path");
    process.exit(1);
}

try {
    const absolutePath = path.resolve(inputPath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`File not found: ${absolutePath}`);
        process.exit(1);
    }

    const dirName = path.dirname(absolutePath);
    const fileName = path.basename(absolutePath, path.extname(absolutePath));
    const outputPath = path.join(dirName, fileName + '.md');

    console.log(`Reading JSON from: ${absolutePath}`);
    const fileContent = fs.readFileSync(absolutePath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!data.text) {
        console.error("JSON does not contain 'text' property");
        process.exit(1);
    }

    let markdownContent = '---\n';
    if (data.metadata) {
        for (const [key, value] of Object.entries(data.metadata)) {
            // Basic escaping for YAML values if needed, simplified here
            const safeValue = typeof value === 'string' ? value.replace(/"/g, '\\"') : value;
            markdownContent += `${key}: "${safeValue}"\n`;
        }
    }
    if (data.pageCount) {
        markdownContent += `pageCount: ${data.pageCount}\n`;
    }
    markdownContent += '---\n\n';
    markdownContent += data.text;

    fs.writeFileSync(outputPath, markdownContent);
    console.log(`Successfully converted JSON to Markdown at: ${outputPath}`);

} catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
}
