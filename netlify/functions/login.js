import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  try {
    const { email, password } = JSON.parse(event.body);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email or password' }) };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email or password' }) };

    if (user.two_step_enabled) {
      // generate 2FA code
      const code = crypto.randomBytes(3).toString('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await supabase.from('verification_codes').insert([{ user_id: user.id, code, expires_at: expiresAt }]);

      return { statusCode: 200, body: JSON.stringify({ two_step: true, message: '2FA code sent' }) };
    }

    // If no 2FA, login success
    return { statusCode: 200, body: JSON.stringify({ two_step: false, user_id: user.id }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}

