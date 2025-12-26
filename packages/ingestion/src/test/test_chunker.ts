import { SmartChunker } from '../chunker/SmartChunker';

const text = `
Diritto privato.

Il diritto privato è quella branca del diritto che regola i rapporti tra soggetti privati.
Si distingue dal diritto pubblico che regola i rapporti tra Stato e cittadini.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Questa è una frase lunga per testare se lo split avviene correttamente senza interrompere le parole a metà o perdere il significato del contesto generale della frase stessa che deve essere preservata.
`;

const chunker = new SmartChunker();
const size = 100;
const overlap = 20;

console.log(`Original Length: ${text.length}`);
console.log(`Target Size: ${size}, Overlap: ${overlap}`);

const chunks = chunker.chunk(text, size, overlap);

console.log(`Generated ${chunks.length} chunks:`);
chunks.forEach((c, i) => {
    console.log(`\n--- Chunk ${i} (Len: ${c.length}) ---`);
    console.log(c);
});
