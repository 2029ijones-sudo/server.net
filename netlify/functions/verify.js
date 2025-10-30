import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  try {
    const { user_id, code } = JSON.parse(event.body);

    const { data: record } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('user_id', user_id)
      .eq('code', code)
      .single();

    if (!record) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid code' }) };

    if (new Date(record.expires_at) < new Date()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Code expired' }) };
    }

    // Optionally, delete code after verification
    await supabase.from('verification_codes').delete().eq('id', record.id);

    return { statusCode: 200, body: JSON.stringify({ message: 'Verified successfully' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}

