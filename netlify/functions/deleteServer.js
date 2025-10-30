import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  try {
    const { server_id } = JSON.parse(event.body);

    const { error } = await supabase
      .from('servers')
      .delete()
      .eq('id', server_id);

    if (error) throw error;

    return { statusCode: 200, body: JSON.stringify({ message: 'Server deleted successfully' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
