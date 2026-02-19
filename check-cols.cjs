const fs = require('fs');
const path = require('path');
const https = require('https');

// Simple .env parser
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('Missing URL or Key in .env');
    process.exit(1);
}

const table = 'projects';
const apiUrl = `${url}/rest/v1/${table}?select=*&limit=1`;

const options = {
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
    }
};

https.get(apiUrl, options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (Array.isArray(data) && data.length > 0) {
                console.log('COLUMNS:', Object.keys(data[0]));
            } else {
                console.log('No data found in table projects or empty array.');
                console.log('Raw body:', body);
            }
        } catch (e) {
            console.error('Failed to parse body:', e.message);
            console.log('Body:', body);
        }
    });
}).on('error', (e) => {
    console.error('Request error:', e.message);
});
