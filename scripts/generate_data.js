const fs = require('fs');
const path = require('path');

const DATA_DIR = '/Users/yangsong/src/opensrc/leetcode-company-wise-problems';
const OUTPUT_FILE = path.join(__dirname, '../data.json');

// Helper to parse CSV line respecting quotes
function parseCSVLine(line) {
    const result = [];
    let cell = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(cell.trim());
            cell = '';
        } else {
            cell += char;
        }
    }
    result.push(cell.trim());
    return result;
}

function generateData() {
    console.log('Starting data generation...');
    const companies = fs.readdirSync(DATA_DIR).filter(file => {
        return fs.statSync(path.join(DATA_DIR, file)).isDirectory() && !file.startsWith('.');
    });

    const problemMap = new Map();

    const fileMapping = {
        '1. Thirty Days.csv': '30d',
        '2. Three Months.csv': '3m',
        '3. Six Months.csv': '6m',
        '4. More Than Six Months.csv': '>6m',
        '5. All.csv': 'all'
    };

    companies.forEach(company => {
        const companyDir = path.join(DATA_DIR, company);
        
        Object.entries(fileMapping).forEach(([filename, periodKey]) => {
            const csvPath = path.join(companyDir, filename);
            if (!fs.existsSync(csvPath)) return;

            const content = fs.readFileSync(csvPath, 'utf-8');
            const lines = content.split('\n');
            
            // Skip header: Difficulty,Title,Frequency,Acceptance Rate,Link,Topics
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const cols = parseCSVLine(line);
                if (cols.length < 5) continue;

                const [difficulty, title, freqStr, accRateStr, link, topicsStr] = cols;
                const id = link; 

                if (!problemMap.has(id)) {
                    problemMap.set(id, {
                        id: id,
                        title: title,
                        difficulty: difficulty,
                        acceptanceRate: parseFloat(accRateStr),
                        link: link,
                        topics: topicsStr ? topicsStr.split(',').map(t => t.trim()) : [],
                        companies: {} // Map company name to freq obj
                    });
                }

                const problem = problemMap.get(id);
                
                if (!problem.companies[company]) {
                    problem.companies[company] = {
                        name: company,
                        freqs: {}
                    };
                }
                
                problem.companies[company].freqs[periodKey] = parseFloat(freqStr) || 0;
            }
        });
    });

    // Convert map to array and format
    const problems = Array.from(problemMap.values()).map(p => {
        // Convert companies obj to array
        const companyArray = Object.values(p.companies).map(c => {
            // Ensure 'all' exists, default to 0 if missing (though it might be missing in '5. All.csv' but present elsewhere)
            // If missing in 'all', we might want to infer it or just leave it.
            // Let's set the main 'frequency' to 'all' if exists, else '30d' > '3m' ... 
            // Or just keep the 'freqs' object and let UI decide.
            // For backward compatibility with my UI code, I need a 'frequency' field.
            
            let mainFreq = c.freqs['all'] || 0;
            if (mainFreq === 0) {
                 // Fallback if 'All' is missing (which happened for 103 problems)
                 mainFreq = Math.max(
                    c.freqs['30d'] || 0,
                    c.freqs['3m'] || 0,
                    c.freqs['6m'] || 0,
                    c.freqs['>6m'] || 0
                 );
            }
            
            return {
                name: c.name,
                frequency: mainFreq,
                period_freqs: c.freqs
            };
        });
        
        // Sort companies by frequency desc
        companyArray.sort((a, b) => b.frequency - a.frequency);
        
        p.companies = companyArray;
        return p;
    });

    console.log(`Processed ${problems.length} unique problems from ${companies.length} companies.`);
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(problems, null, 2));
    console.log(`Data written to ${OUTPUT_FILE}`);
}

generateData();