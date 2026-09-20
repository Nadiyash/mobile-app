import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    
    if (loginError) {
      setLoading(false);
      setError(loginError.message);
      return;
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    setLoading(false);

    if (profile?.role === 'dokter') {
      router.replace('/dokter');
    } else {
      router.replace('/');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Masuk ke VitaCare</Text>
        <TextInput placeholder="Email" placeholderTextColor="#9C9A94" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <TextInput placeholder="Password" placeholderTextColor="#9C9A94" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Memproses...' : 'Masuk'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/register')}>
          <Text style={styles.link}>Belum punya akun? Daftar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#1C1B29', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E1DA', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1C1B29', marginBottom: 12 },
  error: { color: '#D14343', fontSize: 12, marginBottom: 12 },
  btn: { backgroundColor: '#4A3FC4', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginBottom: 16 },
  btnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  link: { color: '#4A3FC4', fontSize: 13, textAlign: 'center' },
});