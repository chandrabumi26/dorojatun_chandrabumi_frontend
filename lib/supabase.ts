import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wmlzyhrjjtvrnmcenrqg.supabase.co";
const supabaseAnonKey = "sb_publishable_ubetz1bUSAJKNHhcx1D8gg_My5_AP0z";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
