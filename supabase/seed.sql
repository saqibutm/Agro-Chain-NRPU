-- AgroChain — demo user seed
-- Run AFTER schema.sql.
-- Creates one user per role for local testing.
-- Passwords are all: AgroChain2024!

-- Run in Supabase SQL editor:
select auth.uid(); -- confirm you are logged in as service role

-- Create users via Supabase Auth API (use Dashboard → Authentication → Users → Invite,
-- or run this in a Node script with the service-role key):
--
--  Role     | Email                          | Username    | Password
-- ----------|-------------------------------|-------------|------------------
--  farmer   | farmer@agrochain.local        | farmer      | AgroChain2024!
--  mill     | mill@agrochain.local          | mill        | AgroChain2024!
--  lab      | lab@agrochain.local           | lab         | AgroChain2024!
--  regulator| regulator@agrochain.local     | regulator   | AgroChain2024!
--  consumer | consumer@agrochain.local      | consumer    | AgroChain2024!
 --  admin    | admin@agrochain.local         | admin       | AgroChain2024!
--
-- After creating each user in the Auth UI, the trigger handle_new_user()
-- auto-populates the profiles table with the correct username and role.
--
-- To set the role metadata when creating a user via the API:
--   { "data": { "username": "farmer", "role": "farmer" } }
