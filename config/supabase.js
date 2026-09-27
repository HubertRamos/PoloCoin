import { createClient } from '@supabase/supabase-js';

function resolveSupabaseConfig() {
    let url = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.trim() : '';
    let key = (
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.SUPABASE_KEY ||
        ''
    ).trim();

    // Se a chave não foi definida mas o SUPABASE_URL parece ser uma chave (ex: sb_publishable_...)
    if (!key && url.startsWith('sb_')) {
        key = url;
        url = '';
    }

    // Se a URL não for um link HTTP(S) válido
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        // 1. Tenta derivar a URL a partir do payload JWT da chave (anon ou service_role)
        if (key && key.includes('.')) {
            try {
                const parts = key.split('.');
                if (parts.length >= 2) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
                    if (payload && payload.ref) {
                        url = `https://${payload.ref}.supabase.co`;
                    }
                }
            } catch (err) {
                // Silencioso se não for JWT válido
            }
        }

        // 2. Se a URL fornecida for apenas o project-ref (ex: mihlwguvjfobgkfrojub)
        if (!url && process.env.SUPABASE_URL && /^[a-z0-9]{15,30}$/i.test(process.env.SUPABASE_URL.trim())) {
            url = `https://${process.env.SUPABASE_URL.trim()}.supabase.co`;
        }

        // 3. Se ainda assim não tiver URL válida, define fallback com formato HTTP válido
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://mihlwguvjfobgkfrojub.supabase.co';
        }
    }

    if (!key) {
        key = 'public-anon-key';
    }

    return { url, key };
}

const { url: supabaseUrl, key: supabaseKey } = resolveSupabaseConfig();

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

export default supabase;
