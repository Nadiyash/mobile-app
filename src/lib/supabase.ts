import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = 'https://ijdnhrslyastucclcrac.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqZG5ocnNseWFzdHVjY2xjcmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NTE3NjEsImV4cCI6MjEwNTIyNzc2MX0.oB18Go_HIYeIQBMl4AySKShYhVwQ_udYmr39-Y-d-ss';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});