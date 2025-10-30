import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function handler(event) {
  try {
    // Get the auth token from cookies or headers
    const token = event.headers.cookie?.split('supabase-token=')[1];

    if (!token) {
      return {
        statusCode: 200,
        body: JSON.stringify({ user: null })
      };
    }

    // Verify user session
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        statusCode: 200,
        body: JSON.stringify({ user: null })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
