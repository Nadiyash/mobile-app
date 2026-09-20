import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';

type Poli = { id: string; nama: string };
type Dokter = { id: string; nama: string; poli_id: string; poli: { nama: string } };

export default function KelolaDokter() {
  const { session } = useAuth();
  const [rsId, setRsId] = useState<string | null>(null);
  const [poliList, setPoliList] = useState<Poli[]>([]);
  const [dokterList, setDokterList] = useState<Dokter[]>([]);

  const [namaBaru, setNamaBaru] = useState('');
  const [poliBaru, setPoliBaru] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async (rumahSakitId: string) => {
    const { data } = await supabase
      .from('dokter')
      .select('id, nama, poli_id, poli(nama)')
      .eq('rumah_sakit_id', rumahSakitId);
    if (data) setDokterList(data as any);
  };

  useEffect(() => {
    if (!session) return;

    supabase.from('poli').select('*').then(({ data }) => {
      if (data) setPoliList(data);
    });

    supabase
      .from('rumah_sakit')
      .select('id')
      .eq('admin_id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setRsId(data.id);
          loadData(data.id);
        }
      });
  }, [session]);

  const handleTambah = async () => {
    if (!rsId || !namaBaru || !poliBaru) {
      Alert.alert('Lengkapi dulu', 'Nama dan poli wajib diisi');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('dokter').insert({
      rumah_sakit_id: rsId,
      poli_id: poliBaru,
      nama: namaBaru,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Gagal', error.message);
      return;
    }
    setNamaBaru('');
    setPoliBaru(null);
    loadData(rsId);
  };

  const handleHapus = async (dokterId: string) => {
    Alert.alert('Hapus dokter?', 'Jadwal dokter ini juga akan terhapus.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive', onPress: async () => {
          await supabase.from('jadwal_dokter').delete().eq('dokter_id', dokterId);
          await supabase.from('dokter').delete().eq('id', dokterId);
          if (rsId) loadData(rsId);
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Kelola Dokter</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Nama Dokter</Text>
          <TextInput style={styles.input} value={namaBaru} onChangeText={setNamaBaru} placeholder="dr. Nama Dokter" />

          <Text style={styles.label}>Poli</Text>
          <View style={styles.poliRow}>
            {poliList.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.poliChip, poliBaru === p.id && styles.poliChipActive]}
                onPress={() => setPoliBaru(p.id)}
              >
                <Text style={[styles.poliChipText, poliBaru === p.id && styles.poliChipTextActive]}>
                  {p.nama}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={handleTambah} disabled={saving}>
            <Text style={styles.addBtnText}>{saving ? 'Menyimpan...' : '+ Tambah Dokter'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Daftar Dokter</Text>
        {dokterList.map((d) => (
          <View key={d.id} style={styles.dokterRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dokterName}>{d.nama}</Text>
              <Text style={styles.dokterPoli}>{d.poli?.nama}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/admin/dokter/${d.id}/jadwal` as any)}>
              <Text style={styles.linkText}>Atur Jadwal</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleHapus(d.id)}>
              <Text style={styles.deleteText}>Hapus</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1B29', marginBottom: 16 },
  formCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E4E1DA', marginBottom: 24 },
  label: { fontSize: 12.5, color: '#6B6968', marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#F7F5F2', borderWidth: 1, borderColor: '#E4E1DA',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#1C1B29',
  },
  poliRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  poliChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F7F5F2', borderWidth: 1, borderColor: '#E4E1DA' },
  poliChipActive: { backgroundColor: '#4A3FC4', borderColor: '#4A3FC4' },
  poliChipText: { fontSize: 12, color: '#1C1B29' },
  poliChipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  addBtn: { backgroundColor: '#16A38A', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  addBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },

  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#1C1B29', marginBottom: 10 },
  dokterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#E4E1DA',
  },
  dokterName: { fontSize: 13.5, fontWeight: '600', color: '#1C1B29' },
  dokterPoli: { fontSize: 11.5, color: '#6B6968', marginTop: 2 },
  linkText: { fontSize: 12, color: '#4A3FC4', fontWeight: '600' },
  deleteText: { fontSize: 12, color: '#D14343', fontWeight: '600' },
});