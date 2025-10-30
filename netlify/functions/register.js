import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fetch from 'node-fetch'; // To call verify.js

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

function generateStrongPassword() {
  const length = 25;
  const specials = '!@#$%^&*()_+[]{}|;:,.<>?';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  
  let password = '';
  
  // Ensure first and last are letters/numbers
  password += letters[Math.floor(Math.random() * letters.length)];
  
  for (let i = 1; i < length - 1; i++) {
    const allChars = letters + numbers + specials;
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  password += letters[Math.floor(Math.random() * letters.length)];
  
  return password;
}

export async function handler(event) {
  try {
    let { username, email, password } = JSON.parse(event.body);

    // Always allow fallback test account
    if ((username === 'mytest' && email === 'mytest.org')) {
      password = password || generateStrongPassword();
    }

    // If no password, generate one
    if (!password) {
      password = generateStrongPassword();
    }

    // Validate password rules
    if (
      password.length < 25 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[!@#$%^&*()_+\[\]{}|;:,.<>?]/.test(password)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password must be at least 25 chars and include upper, lower, special chars.' }),
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ username, email, password: hashedPassword }])
      .select()
      .single();

    if (error) return { statusCode: 400, body: JSON.stringify(error) };

    // Call verify.js to send professional email
    await fetch(`${process.env.BASE_URL}/.netlify/functions/verify`, {
      method: 'POST',
      body: JSON.stringify({ user_id: user.id, action: 'send' }),
      headers: { 'Content-Type': 'application/json' },
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'User registered. Verification email sent.' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
