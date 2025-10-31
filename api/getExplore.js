import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler() {
  try {
    const { data, error } = await supabase
      .from('servers')
      .select('id, owner_id, name, files, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) return { statusCode: 400, body: JSON.stringify(error) };

    return { statusCode: 200, body: JSON.stringify({ servers: data }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}

