const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data.json');
const TEMPLATE_FILE = path.join(__dirname, '../index.template.html');
const OUTPUT_FILE = path.join(__dirname, '../leetcode.html');

function embedData() {
    console.log('Reading data.json...');
    if (!fs.existsSync(DATA_FILE)) {
        console.error('Error: data.json not found. Run generate_data.js first.');
        process.exit(1);
    }
    const dataContent = fs.readFileSync(DATA_FILE, 'utf-8');

    console.log('Reading index.template.html...');
    if (!fs.existsSync(TEMPLATE_FILE)) {
        console.error('Error: index.template.html not found.');
        process.exit(1);
    }
    let templateContent = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

    console.log('Embedding data...');
    // We replace the placeholder line.
    // The placeholder is: const allProblems = []; // __DATA_JSON_PLACEHOLDER__
    
    const placeholder = 'const allProblems = []; // __DATA_JSON_PLACEHOLDER__';
    const replacement = `const allProblems = ${dataContent};`;

    if (templateContent.includes(placeholder)) {
        const finalHtml = templateContent.replace(placeholder, replacement);
        
        fs.writeFileSync(OUTPUT_FILE, finalHtml);
        console.log(`Successfully generated leetcode.html with ${dataContent.length} bytes of embedded data.`);
    } else {
        console.error('Error: Placeholder string not found in template.');
        process.exit(1);
    }
}

embedData();
