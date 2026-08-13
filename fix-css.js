const fs = require('fs');
const content = fs.readFileSync('client/src/index.css', 'utf8');

// Find the first occurrence of the corrupted text added by my echo command
const marker = "\\ n @ m e d i a";
let cleanedContent = content;

if (content.includes(marker)) {
    cleanedContent = content.substring(0, content.indexOf(marker));
    // Also append the 480px media query cleanly
    cleanedContent += `
@media (max-width: 480px) {
  .products-grid, .brand-product-grid {
    grid-template-columns: 1fr !important;
    gap: 15px !important;
  }
  .product-img {
    height: 200px !important;
  }
  .collections-grid {
    grid-template-columns: 1fr !important;
  }
}
`;
} else {
    // If marker not found, let's find the duplicate max-width: 768px that fuzzy matching added
    // The original end of file had section[style*="padding: 4rem 2rem"] { padding: 2rem 1rem !important; border-radius: 12px !important; } }
    const regex = /(section\[style\*="padding: '4rem 2rem'"\],\s*section\[style\*="padding: 4rem 2rem"\] {\s*padding: 2rem 1rem !important;\s*border-radius: 12px !important;\s*}\s*})([\s\S]*)/;
    const match = content.match(regex);
    if (match) {
        cleanedContent = content.substring(0, match.index + match[1].length);
        cleanedContent += `
@media (max-width: 480px) {
  .products-grid, .brand-product-grid {
    grid-template-columns: 1fr !important;
    gap: 15px !important;
  }
  .product-img {
    height: 200px !important;
  }
  .collections-grid {
    grid-template-columns: 1fr !important;
  }
}
`;
    }
}

fs.writeFileSync('client/src/index.css', cleanedContent);
console.log("Fixed index.css");
