import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';

export default function RumahSakitAdmin() {
  const { session } = useAuth();
  const [rsId, setRsId] = useState<string | null>(null);
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('rumah_sakit')
      .select('*')
      .eq('admin_id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setRsId(data.id);
          setNama(data.nama);
          setAlamat(data.alamat ?? '');
          setFotoUrl(data.foto_url ?? '');
        }
        setLoading(false);
      });
  }, [session]);

  const handleSave = async () => {
    if (!rsId) return;
    setSaving(true);
    const { error } = await supabase
      .from('rumah_sakit')
      .update({ nama, alamat, foto_url: fotoUrl || null })
      .eq('id', rsId);
    setSaving(false);
    if (error) {
      Alert.alert('Gagal', error.message);
    } else {
      Alert.alert('Berhasil', 'Data rumah sakit sudah diperbarui');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
        <Header />
        <Text style={styles.emptyText}>Memuat...</Text>
      </View>
    );
  }

  if (!rsId) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
        <Header />
        <Text style={styles.emptyText}>Akun kamu belum terhubung ke rumah sakit manapun.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Data Rumah Sakit</Text>

        <Text style={styles.label}>Nama Rumah Sakit</Text>
        <TextInput style={styles.input} value={nama} onChangeText={setNama} />

        <Text style={styles.label}>Alamat</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={alamat}
          onChangeText={setAlamat}
          multiline
        />

        <Text style={styles.label}>URL Foto</Text>
        <TextInput
          style={styles.input}
          value={fotoUrl}
          onChangeText={setFotoUrl}
          placeholder="https://..."
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1B29', marginBottom: 20 },
  label: { fontSize: 12.5, color: '#6B6968', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E1DA',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#1C1B29',
  },
  saveBtn: { backgroundColor: '#4A3FC4', borderRadius: 10, paddingVertical: 13, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  emptyText: { padding: 20, fontSize: 13, color: '#6B6968', textAlign: 'center' },
});