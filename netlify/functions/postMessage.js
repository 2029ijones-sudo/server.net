import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  try {
    const { user_id, server_id, role, content } = JSON.parse(event.body);

    const { data, error } = await supabase
      .from('messages')
      .insert([{ user_id, server_id, role, content }])
      .select()
      .single();

    if (error) return { statusCode: 400, body: JSON.stringify(error) };

    return { statusCode: 200, body: JSON.stringify({ message: data }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}

