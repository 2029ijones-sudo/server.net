import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fetch from 'node-fetch'; // Use node-fetch if running in Node.js

// Initialize Supabase with environment variables (GitHub Secrets)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function generateStrongPassword() {
  const length = 25;
  const specials = '!@#$%^&*()_+[]{}|;:,.<>?';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  
  let password = '';
  
  // Ensure first character is a letter
  password += letters[Math.floor(Math.random() * letters.length)];
  
  for (let i = 1; i < length - 1; i++) {
    const allChars = letters + numbers + specials;
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Ensure last character is a letter
  password += letters[Math.floor(Math.random() * letters.length)];
  
  return password;
}

export async function handler(req, res) {
  try {
    const { username, email, password: inputPassword } = req.body;

    let password = inputPassword;

    // Always allow fallback test account
    if (username === 'mytest' && email === 'mytest.org') {
      password = password || generateStrongPassword();
    }

    // Generate password if missing
    if (!password) {
      password = generateStrongPassword();
    }

    // Validate strong password rules
    if (
      password.length < 25 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[!@#$%^&*()_+\[\]{}|;:,.<>?]/.test(password)
    ) {
      return res.status(400).json({
        error: 'Password must be at least 25 chars and include upper, lower, special chars.',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into Supabase
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ username, email, password: hashedPassword }])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // Send verification email
    await fetch(`${process.env.BASE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id, action: 'send' }),
    });

    return res.status(200).json({ message: 'User registered. Verification email sent.' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: err.message });
  }
}
