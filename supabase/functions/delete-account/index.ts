// Lets a signed-in user permanently delete their own AgroChain account.
// Required for Apple App Store Guideline 5.1.1(v): apps that support in-app
// account creation must also support in-app account deletion.
//
// Personal identity (the auth user + profiles row) is deleted outright.
// wheat_batches / batch_transfers / quality_reports / consumer_issues rows
// the user created are kept as anonymized supply-chain history (created_by /
// reported_by set to null) per PRIVACY.md §4/§8 — other parties in the chain
// still need that audit trail after one participant's account is gone.
//
// Deploy: supabase functions deploy delete-account
// Uses SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, which Supabase injects
// automatically into every Edge Function — the service role key never ships
// in the app.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const ANONYMIZE_TARGETS = [
  { table: "wheat_batches", column: "created_by" },
  { table: "batch_transfers", column: "created_by" },
  { table: "quality_reports", column: "created_by" },
  { table: "consumer_issues", column: "reported_by" },
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Missing auth token" }, 401);

  // Scoped only to verifying who the caller is — never used to write.
  const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data: { user }, error: userError } = await callerClient.auth.getUser(token);
  if (userError || !user) return json({ error: "Invalid session" }, 401);

  // Admin client for the actual deletion.
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Profile photo lives at "<user id>/avatar.jpg" in the "avatars" bucket —
  // remove it so it doesn't outlive the account it belonged to.
  await admin.storage.from("avatars").remove([`${user.id}/avatar.jpg`]);

  for (const { table, column } of ANONYMIZE_TARGETS) {
    const { error } = await admin.from(table).update({ [column]: null }).eq(column, user.id);
    if (error) return json({ error: `Failed to anonymize ${table}: ${error.message}` }, 500);
  }

  // Deletes the auth.users row; public.profiles cascades via its FK.
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return json({ error: deleteError.message }, 500);

  return json({ success: true });
});
