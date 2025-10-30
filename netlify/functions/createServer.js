import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  try {
    const { owner_id, name, files, is_public } = JSON.parse(event.body);

    const api_key = crypto.randomUUID();

    const { data, error } = await supabase
      .from('servers')
      .insert([{ owner_id, name, files, is_public, api_key }])
      .select()
      .single();

    if (error) return { statusCode: 400, body: JSON.stringify(error) };

    return { statusCode: 200, body: JSON.stringify({ server: data }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
