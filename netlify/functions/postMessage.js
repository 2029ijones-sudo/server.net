import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  try {
    const { user_id, server_id, role, content } = JSON.parse(event.body);

    // Insert the message
    const { data: message, error: msgError } = await supabase
      .from('messages')
      .insert([{ user_id, server_id, role, content }])
      .select()
      .single();

    if (msgError) return { statusCode: 400, body: JSON.stringify(msgError) };

    // Get the server info to find the owner
    const { data: server } = await supabase
      .from('servers')
      .select('owner_id, name')
      .eq('id', server_id)
      .single();

    if (server && server.owner_id !== user_id) {
      // Create an alert for the owner
      await supabase.from('alerts').insert([{
        user_id: server.owner_id,
        type: 'message',
        content: `New message on your server "${server.name}": ${content}`,
      }]);
    }

    return { statusCode: 200, body: JSON.stringify({ message }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
