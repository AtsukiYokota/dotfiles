// Use the official ESM core, whose dependencies remain external until this
// build. Upstream's prebuilt IIFE still embeds an older DOMPurify release.
import mermaid from 'mermaid/dist/mermaid.core.mjs';

window.mermaid = mermaid;
