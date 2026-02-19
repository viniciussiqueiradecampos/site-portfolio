const fs = require('fs');
const path = require('path');
const https = require('https');

const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

const apiUrl = `${url}/rest/v1/projects?select=*&limit=1`;

const options = {
    headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=representation'
    }
};

https.get(apiUrl, options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            console.log('--- TABLE INFO ---');
            if (Array.isArray(data) && data.length > 0) {
                console.log('Sample Row Keys:', Object.keys(data[0]));
                console.log('Gallery Videos Value:', data[0].gallery_videos);
                console.log('Gallery Videos Type:', typeof data[0].gallery_videos);
            } else {
                console.log('No rows found in projects table.');
            }
        } catch (e) {
            console.error('Error:', e.message);
            console.log('Raw body:', body);
        }
    });
});
