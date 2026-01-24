import { useState } from 'react';
import { supabase } from '../lib/supabase';

const [logs, setLogs] = useState<string[]>([]);

const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

const testConnection = async () => {
    setLogs([]);
    addLog('🔍 Testing Supabase connection...');
    addLog(`📍 URL: ${import.meta.env.VITE_SUPABASE_URL}`);
    addLog(`🔑 Key: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present ✅' : 'Missing ❌'}`);

    // Test Client
    addLog(`✅ Supabase client: ${supabase ? 'Initialized' : 'NOT initialized'}`);

    // Table Checks
    const tables = ['content', 'projects', 'cv_sections', 'career_profiles', 'job_listings', 'api_configurations'];

    for (const table of tables) {
        try {
            const { error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                addLog(`❌ Table '${table}': Error - ${error.message} (Code: ${error.code})`);
            } else {
                addLog(`✅ Table '${table}': Accessible (Rows: ${count})`);
            }
        } catch (e: any) {
            addLog(`❌ Table '${table}': Exception - ${e.message}`);
        }
    }
};

return (
    <div style={{ padding: '40px', fontFamily: 'monospace', background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
        <h1 style={{ color: '#f2a73d' }}>Supabase Connection Test</h1>

        <button
            onClick={testConnection}
            style={{
                padding: '12px 24px',
                background: '#f2a73d',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#000',
                marginBottom: '20px'
            }}
        >
            Run Diagnostics
        </button>

        <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
            {logs.length === 0 ? 'Click button to start...' : logs.map((log, i) => <div key={i} style={{ marginBottom: '5px' }}>{log}</div>)}
        </div>

        <div style={{ marginTop: '30px', padding: '20px', background: '#333', borderRadius: '8px' }}>
            <h3>How to fix "Relation does not exist":</h3>
            <p>1. Copy the content of <b>supabase-setup.sql</b></p>
            <p>2. Go to Supabase Dashboard > SQL Editor</p>
            <p>3. Paste and Run the script</p>
        </div>
    </div>
);
}
