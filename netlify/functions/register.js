import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  try {
    const { username, email, password } = JSON.parse(event.body);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ username, email, password: hashedPassword }])
      .select()
      .single();

    if (error) return { statusCode: 400, body: JSON.stringify(error) };

    // Generate verification code
    const code = crypto.randomBytes(3).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    await supabase.from('verification_codes').insert([{ user_id: user.id, code, expires_at: expiresAt }]);

    // Send verification email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Site Name" <no-reply@yoursite.com>',
      to: email,
      subject: 'Verify Your Email',
      text: `Your verification code is: ${code}`,
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'User registered. Verification email sent.' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}

