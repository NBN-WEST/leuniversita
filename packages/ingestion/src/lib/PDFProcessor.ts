import fs from 'fs';
import path from 'path';
// @ts-ignore
import pdf from 'pdf-parse';

export interface PDFResult {
    text: string;
    metadata: any;
    pageCount: number;
}

export class PDFProcessor {
    async convert(filePath: string): Promise<PDFResult> {
        if (!fs.existsSync(filePath)) {
            throw new Error(`PDF file not found: ${filePath}`);
        }

        const dataBuffer = fs.readFileSync(filePath);

        try {
            const data = await pdf(dataBuffer);
            return {
                text: data.text,
                metadata: data.info,
                pageCount: data.numpages
            };
        } catch (error: any) {
            throw new Error(`Failed to parse PDF: ${error.message}`);
        }
    }

    /**
     * Converts a raw PDF file into a structured Markdown file (with JSON frontmatter/structure if needed)
     * and saves it to the destination path.
     */
    async processToMarkdown(sourcePath: string, destPath: string, extraMetadata: Record<string, any> = {}): Promise<void> {
        const result = await this.convert(sourcePath);

        // Sanitize text (remove excessive newlines, weird null chars)
        const cleanText = result.text.replace(/\x00/g, '').trim();

        const frontmatter = {
            title: path.basename(sourcePath, '.pdf'),
            original_file: path.basename(sourcePath),
            page_count: result.pageCount,
            created_at: new Date().toISOString(),
            ...extraMetadata
        };

        const mdContent = `---
${Object.entries(frontmatter).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}
---

${cleanText}
`;

        fs.writeFileSync(destPath, mdContent);
    }
}
