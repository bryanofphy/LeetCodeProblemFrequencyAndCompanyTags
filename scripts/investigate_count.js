const fs = require('fs');
const path = require('path');

const DATA_DIR = '/Users/yangsong/src/opensrc/leetcode-company-wise-problems';

function parseCSVLine(line) {
    const result = [];
    let cell = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            result.push(cell.trim());
            cell = '';
        } else cell += char;
    }
    result.push(cell.trim());
    return result;
}

function investigate() {
    const companies = fs.readdirSync(DATA_DIR).filter(file => {
        return fs.statSync(path.join(DATA_DIR, file)).isDirectory() && !file.startsWith('.');
    });

    const uniqueLinksAll = new Set();
    const uniqueLinksAny = new Set();
    
    // We will check 5. All.csv vs ANY csv
    
    companies.forEach(company => {
        const dir = path.join(DATA_DIR, company);
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));
        
        files.forEach(f => {
            const content = fs.readFileSync(path.join(dir, f), 'utf-8');
            const lines = content.split('\n');
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                const cols = parseCSVLine(line);
                if (cols.length < 5) continue;
                const link = cols[4]; // Link column
                
                uniqueLinksAny.add(link);
                if (f.includes('5. All.csv')) {
                    uniqueLinksAll.add(link);
                }
            }
        });
    });

    console.log(`Total unique problems in '5. All.csv': ${uniqueLinksAll.size}`);
    console.log(`Total unique problems across ALL files: ${uniqueLinksAny.size}`);
    
    // Check if there are differences
    let missingInAll = 0;
    uniqueLinksAny.forEach(link => {
        if (!uniqueLinksAll.has(link)) {
            missingInAll++;
        }
    });
    console.log(`Problems present in other timeframes but MISSING in '5. All.csv': ${missingInAll}`);
}

investigate();
