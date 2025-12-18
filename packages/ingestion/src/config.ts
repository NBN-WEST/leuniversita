
import path from 'path';

export const CONFIG = {
    CHUNK_SIZE: 1100,
    CHUNK_OVERLAP: 180,
    DB_TABLE_DOCUMENTS: 'documents',
    DB_TABLE_CHUNKS: 'chunks',
    SOURCES_PATH: 'docs/sources/diritto-privato/sources.json',
    REPO_ROOT: path.resolve(__dirname, '../../..'), // Assuming src/config.ts -> packages/ingestion -> root
};
