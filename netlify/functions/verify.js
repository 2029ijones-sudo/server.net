import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function handler(event) {
  try {
    const { user_id } = JSON.parse(event.body);

    // Fetch the user email
    const { data: user } = await supabase
      .from('users')
      .select('email, username')
      .eq('id', user_id)
      .single();

    if (!user) return { statusCode: 400, body: JSON.stringify({ error: 'User not found' }) };

    // Generate a strong 38-character verification code
    const code = crypto.randomBytes(19).toString('hex'); // 19 bytes * 2 hex chars = 38 chars
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert code into verification_codes table
    await supabase.from('verification_codes').insert([{ user_id, code, expires_at: expiresAt }]);

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // adjust if needed
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the professional email
    await transporter.sendMail({
      from: `"Server Platform" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your Verification Code',
      html: `
        <p>Hey ${user.username},</p>
        <p>We noticed you are signing up or verifying your account on our platform.</p>
        <p>If you encounter any issues, bugs, or registration/sign-in glitches, feel free to email us at 
        <strong>babyyodacutefry@hugg.store</strong>. We are always ready to help and improve our service for you!</p>
        <p><strong>Your verification code:</strong> <code style="font-size:16px;">${code}</code></p>
        <p>This code will expire in 10 minutes. Please do not share it with anyone.</p>
        <p>Thank you for using our platform – we go above and beyond to make you happy!</p>
        <p>— The Team</p>
      `,
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'Verification email sent successfully', code }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
