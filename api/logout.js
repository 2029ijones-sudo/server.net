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
        body: JSON.stringify({ message: 'Already logged out' })
      };
    }

    // Revoke the session in Supabase
    const { error } = await supabase.auth.signOut({ refreshToken: token });

    if (error) throw error;

    // Remove the cookie
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': `supabase-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
      },
      body: JSON.stringify({ message: 'Logged out successfully' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}
