import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  try {
    const { user_id } = event.queryStringParameters;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', user_id)
      .single();

    if (error) throw error;

    return { 
      statusCode: 200, 
      body: JSON.stringify({ user }) // wrap in `user` key
    };
  } catch (err) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: err.message }) 
    };
  }
}
