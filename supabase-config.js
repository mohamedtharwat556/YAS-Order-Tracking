// Supabase Configuration
const SUPABASE_URL = 'https://racrhrusajpwvxhiebtf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhY3JocnVzYWpwd3Z4aGllYnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2Mjc3OTUsImV4cCI6MjEwNzIwMzc5NX0.VF_pXjT7PtDN1kicB-Cq4_58NETVaC25al4SWEUDrVs';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
