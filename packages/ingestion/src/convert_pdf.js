const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');


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
    const outputPath = path.join(dirName, fileName + '.json');

    console.log(`Reading PDF from: ${absolutePath}`);
    const dataBuffer = fs.readFileSync(absolutePath);

    pdf(dataBuffer).then(function (data) {
        // PDF data
        // data.numpages - number of pages
        // data.numrender - number of page renders
        // data.info - PDF metadata
        // data.metadata - PDF metadata
        // data.version - PDF version
        // data.text - text content

        const result = {
            metadata: data.info,
            pageCount: data.numpages,
            text: data.text,
            rawMetadata: data.metadata,
            version: data.version
        };

        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        console.log(`Successfully converted PDF to JSON at: ${outputPath}`);
    }).catch(function (error) {
        console.error("Error parsing PDF:", error);
        process.exit(1);
    });

} catch (err) {
    console.error("Unexpected error:", err);
    process.exit(1);
}
