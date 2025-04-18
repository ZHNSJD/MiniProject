// src/app/api/check_user/route.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // You must set this in .env
);

export async function POST(req) {
  const { email } = await req.json();

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    return new Response(JSON.stringify({ message: "Failed to fetch users", error }), {
      status: 500,
    });
  }

  const userExists = data.users.some(user => user.email === email);

  if (userExists) {
    return new Response(JSON.stringify({ message: "User already exists" }), {
      status: 400,
    });
  }

  return new Response(JSON.stringify({ message: "User does not exist" }), {
    status: 200,
  });
}
