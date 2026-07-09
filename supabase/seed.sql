-- AgroChain — demo user seed
-- Run AFTER schema.sql.
-- Creates one user per role for local testing.
-- Passwords are all: AgroChain2024!

-- Run in Supabase SQL editor:
select auth.uid(); -- confirm you are logged in as service role

-- There is no email sign-up in the app — users type an 11-digit mobile number
-- (starting with 0) and the app builds <number>@agrochain.local under the
-- hood for Supabase Auth. Create users via Supabase Auth API (use Dashboard →
-- Authentication → Users → Invite, or run this in a Node script with the
-- service-role key):
--
--  Role     | Mobile Number | Email                          | Password
-- ----------|----------------|-------------------------------|------------------
--  farmer   | 03000000001    | 03000000001@agrochain.local    | AgroChain2024!
--  mill     | 03000000002    | 03000000002@agrochain.local    | AgroChain2024!
--  lab      | 03000000003    | 03000000003@agrochain.local    | AgroChain2024!
--  regulator| 03000000004    | 03000000004@agrochain.local    | AgroChain2024!
--  consumer | 03000000005    | 03000000005@agrochain.local    | AgroChain2024!
--
-- After creating each user in the Auth UI, the trigger handle_new_user()
-- auto-populates the profiles table with the correct username (mobile
-- number) and role.
--
-- To set the role metadata when creating a user via the API:
--   { "data": { "username": "03000000001", "role": "farmer" } }
