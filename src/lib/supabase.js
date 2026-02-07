import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zolkdolzmwltqvsfsfcr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbGtkb2x6bXdsdHF2c2ZzZmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNDQxMjUsImV4cCI6MjA4NTgyMDEyNX0.BP7Rt2j3gbnkKs-jzRZVS8rUM74Pn0oTP_sDMzg2S0s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;

// TBA API configuration
export const TBA_API_KEY = 'ifwf54WXFahVdJI8bNFaf0KXKECsenoanNoiWzfmNLyXUrUKPGajaUmKv074Wneb';
export const TBA_BASE_URL = 'https://www.thebluealliance.com/api/v3';

// Statbotics API configuration  
export const STATBOTICS_BASE_URL = 'https://api.statbotics.io/v3';

// Team number
export const TEAM_NUMBER = 4308;
export const TEAM_KEY = 'frc4308';
