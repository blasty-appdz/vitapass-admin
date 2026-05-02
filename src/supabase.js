import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qklhzepfbhihtlgqbweo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbGh6ZXBmYmhpaHRsZ3Fid2VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MjY1MzcsImV4cCI6MjA1OTEwMjUzN30.tDUOTsHLMPFsmL3pPxJjKGsEsFUMDdP8wJSBZitGCRw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);