export interface Chunker {
    chunk(text: string, size: number, overlap: number): string[];
}

export class SmartChunker implements Chunker {
    private separators: string[];

    constructor(separators: string[] = ["\n\n", "\n", ". ", "? ", "! ", " ", ""]) {
        this.separators = separators;
    }

    chunk(text: string, size: number, overlap: number): string[] {
        return this.recursiveSplit(text, size, overlap, this.separators).filter(c => c.trim().length > 0);
    }

    private recursiveSplit(text: string, size: number, overlap: number, separators: string[]): string[] {
        const finalChunks: string[] = [];
        let goodChunks: string[] = [];

        // If text is already small enough, return it
        if (text.length <= size) {
            return [text];
        }

        // If no separators left, we must split by char (naive)
        if (separators.length === 0) {
            return this.naiveSplit(text, size, overlap);
        }

        const separator = separators[0];
        const nextSeparators = separators.slice(1);
        let splits: string[] = [];

        // Special handling for empty separator (char split)
        if (separator === "") {
            splits = this.naiveSplit(text, size, overlap);
        } else {
            // Split by current separator
            // We use a regex to keep the separator attached to the previous chunk if possible, 
            // but simple split is safer for reconstruction. 
            // For simplicity in this Custom impl, we split and re-assemble.
            splits = text.split(separator);
        }

        // Now re-assemble into chunks of max `size`
        let currentChunk = "";

        for (const split of splits) {
            const potentialChunk = currentChunk.length > 0
                ? currentChunk + separator + split
                : split;

            if (potentialChunk.length <= size) {
                currentChunk = potentialChunk;
            } else {
                // Current chunk is full, push it
                if (currentChunk.length > 0) {
                    goodChunks.push(currentChunk);
                }

                // The new split itself might be too big!
                if (split.length > size) {
                    // Recurse on this specific split with next separators
                    const subChunks = this.recursiveSplit(split, size, overlap, nextSeparators);
                    goodChunks.push(...subChunks);
                    currentChunk = ""; // We consumed the split
                } else {
                    currentChunk = split;
                }
            }
        }

        // Push leftover
        if (currentChunk.length > 0) {
            goodChunks.push(currentChunk);
        }

        // Apply overlap logic if needed? 
        // Logic above stitches greedily. 
        // To support overlap properly with recursive splitting is complex. 
        // Standard LangChain Simplification: 
        // 1. Recursive split produces "good small semantically atomic blocks".
        // 2. Then merge these blocks until size limit, with overlap.

        // Refined Approach:
        // 1. Split strictly by separator.
        // 2. Merge logic.

        return this.mergeSplits(splits, separator, size, overlap, nextSeparators);
    }

    private mergeSplits(splits: string[], separator: string, size: number, overlap: number, nextSeparators: string[]): string[] {
        const docs: string[] = [];
        let currentDoc: string[] = [];
        let totalLength = 0;

        for (const split of splits) {
            const splitLen = split.length;

            if (splitLen > size) {
                // If the single split is too big, we must recurse on it
                // First commit current doc if any
                if (currentDoc.length > 0) {
                    docs.push(currentDoc.join(separator));
                    // Overlap logic reset? For simplicity: yes.
                    // (Ideally we keep tail for overlap, but mixing recursion is hard)
                    currentDoc = [];
                    totalLength = 0;
                }

                const subChunks = this.recursiveSplit(split, size, overlap, nextSeparators);
                docs.push(...subChunks);
                continue;
            }

            // Potential length with separator
            const separatorLen = currentDoc.length > 0 ? separator.length : 0;
            if (totalLength + separatorLen + splitLen > size) {
                // Chunk full. Push and reset.
                // TODO: Implement Overlap here by keeping last items of currentDoc?
                // For now, strict chunks to ensure safety.
                docs.push(currentDoc.join(separator));

                // Overlap: existing items that fit within overlap size?
                // Minimal overlap impl:
                // keep last N splits that fit within `overlap` size
                const overlapDocs: string[] = [];
                let overlapLen = 0;
                for (let i = currentDoc.length - 1; i >= 0; i--) {
                    const s = currentDoc[i];
                    const sLen = s.length + (overlapDocs.length > 0 ? separator.length : 0);
                    if (overlapLen + sLen <= overlap) {
                        overlapDocs.unshift(s);
                        overlapLen += sLen;
                    } else {
                        break;
                    }
                }

                currentDoc = [...overlapDocs, split];
                totalLength = overlapLen + (overlapDocs.length > 0 ? separator.length : 0) + splitLen;

            } else {
                currentDoc.push(split);
                totalLength += separatorLen + splitLen;
            }
        }

        if (currentDoc.length > 0) {
            docs.push(currentDoc.join(separator));
        }

        return docs;
    }

    private naiveSplit(text: string, size: number, overlap: number): string[] {
        const chunks: string[] = [];
        let start = 0;
        while (start < text.length) {
            let end = start + size;
            chunks.push(text.slice(start, end));
            start += size - overlap;
        }
        return chunks;
    }
}
