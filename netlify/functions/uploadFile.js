import { createClient } from '@supabase/supabase-js';

// Fetch secrets from Netlify environment variables
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  try {
    // Expect fileName and fileContent from the frontend
    const { fileName, fileContent } = JSON.parse(event.body);

    if (!fileName || !fileContent) {
      return { statusCode: 400, body: JSON.stringify({ error: 'fileName and fileContent are required' }) };
    }

    // Convert string content to a Blob (Supabase SDK supports this)
    const file = new Blob([fileContent]);

    // Upload to the 'all-storage' bucket, inside 'public/' folder
    const { data, error } = await supabase.storage
      .from('all-storage')
      .upload(`public/${fileName}`, file, { upsert: true });

    if (error) throw error;

    return { statusCode: 200, body: JSON.stringify({ message: 'File uploaded successfully', data }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
