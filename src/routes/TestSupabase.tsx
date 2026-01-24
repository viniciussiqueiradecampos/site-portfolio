import { supabase } from '../lib/supabase';

export default function TestSupabase() {
    const testConnection = async () => {
        console.log('🔍 Testing Supabase connection...');
        console.log('📍 URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('🔑 Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present ✅' : 'Missing ❌');

        // Test 1: Check if supabase client is initialized
        console.log('✅ Supabase client:', supabase ? 'Initialized' : 'NOT initialized');

        // Test 2: Try to fetch from content table
        try {
            const { data, error } = await supabase
                .from('content')
                .select('*')
                .limit(1);

            if (error) {
                console.error('❌ Error fetching content:', error);
            } else {
                console.log('✅ Content table accessible:', data);
            }
        } catch (e) {
            console.error('❌ Exception:', e);
        }

        // Test 3: Try login
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: 'vinicius@transmitadigital.com.br',
                password: '123'
            });

            if (error) {
                console.error('❌ Login error:', error.message);
                console.error('Full error:', error);
            } else {
                console.log('✅ Login successful!', data);
            }
        } catch (e) {
            console.error('❌ Login exception:', e);
        }
    };

    return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
            <h1 style={{ color: '#f2a73d' }}>Supabase Connection Test</h1>

            <div style={{ marginBottom: '20px', padding: '20px', background: '#1a1a1a', borderRadius: '8px' }}>
                <h3>Environment Variables:</h3>
                <p>URL: {import.meta.env.VITE_SUPABASE_URL || '❌ NOT SET'}</p>
                <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Present' : '❌ NOT SET'}</p>
            </div>

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
                    color: '#000'
                }}
            >
                Run Tests
            </button>
            <p>Open browser console (F12) to see detailed results</p>

            <div style={{ marginTop: '30px', padding: '20px', background: '#1a1a1a', borderRadius: '8px' }}>
                <h3>⚠️ If variables are NOT SET:</h3>
                <ol>
                    <li>Stop the dev server (Ctrl+C in terminal)</li>
                    <li>Verify .env file exists in project root</li>
                    <li>Run: <code style={{ background: '#000', padding: '2px 6px' }}>npm run dev</code></li>
                </ol>
            </div>
        </div>
    );
}
