import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';

const HARI_LIST = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

type JadwalRow = { id: string; hari: string; jam_mulai: string; jam_selesai: string; kuota: number };

export default function AturJadwal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [jadwalList, setJadwalList] = useState<JadwalRow[]>([]);
  const [dokterNama, setDokterNama] = useState('');

  const [hariBaru, setHariBaru] = useState(HARI_LIST[0]);
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('12:00');
  const [kuota, setKuota] = useState('10');

  const loadJadwal = async () => {
    const { data } = await supabase
      .from('jadwal_dokter')
      .select('*')
      .eq('dokter_id', id)
      .order('hari');
    if (data) setJadwalList(data);
  };

  useEffect(() => {
    if (!id) return;
    supabase.from('dokter').select('nama').eq('id', id).single().then(({ data }) => {
      if (data) setDokterNama(data.nama);
    });
    loadJadwal();
  }, [id]);

  const handleTambah = async () => {
    const { error } = await supabase.from('jadwal_dokter').insert({
      dokter_id: id,
      hari: hariBaru,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      kuota: parseInt(kuota, 10) || 0,
    });
    if (error) {
      Alert.alert('Gagal', error.message);
      return;
    }
    loadJadwal();
  };

  const handleUpdateKuota = async (jadwalId: string, kuotaBaru: string) => {
    const val = parseInt(kuotaBaru, 10);
    if (isNaN(val)) return;
    await supabase.from('jadwal_dokter').update({ kuota: val }).eq('id', jadwalId);
  };

  const handleHapus = async (jadwalId: string) => {
    await supabase.from('jadwal_dokter').delete().eq('id', jadwalId);
    loadJadwal();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Jadwal — {dokterNama}</Text>

        <View style={styles.formCard}>
          <Text style={styles.label}>Hari</Text>
          <View style={styles.hariRow}>
            {HARI_LIST.map((h) => (
              <TouchableOpacity
                key={h}
                style={[styles.hariChip, hariBaru === h && styles.hariChipActive]}
                onPress={() => setHariBaru(h)}
              >
                <Text style={[styles.hariText, hariBaru === h && styles.hariTextActive]}>{h.slice(0, 3)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Jam Mulai</Text>
              <TextInput style={styles.input} value={jamMulai} onChangeText={setJamMulai} placeholder="08:00" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Jam Selesai</Text>
              <TextInput style={styles.input} value={jamSelesai} onChangeText={setJamSelesai} placeholder="12:00" />
            </View>
          </View>

          <Text style={styles.label}>Kuota Pasien</Text>
          <TextInput style={styles.input} value={kuota} onChangeText={setKuota} keyboardType="numeric" />

          <TouchableOpacity style={styles.addBtn} onPress={handleTambah}>
            <Text style={styles.addBtnText}>+ Tambah Slot Jadwal</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Jadwal Aktif</Text>
        {jadwalList.map((j) => (
          <View key={j.id} style={styles.jadwalRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.jadwalHari}>{j.hari}</Text>
              <Text style={styles.jadwalJam}>{j.jam_mulai.slice(0, 5)} - {j.jam_selesai.slice(0, 5)}</Text>
            </View>
            <TextInput
              style={styles.kuotaInput}
              defaultValue={String(j.kuota)}
              keyboardType="numeric"
              onEndEditing={(e) => handleUpdateKuota(j.id, e.nativeEvent.text)}
            />
            <TouchableOpacity onPress={() => handleHapus(j.id)}>
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
  hariRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  hariChip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#F7F5F2', borderWidth: 1, borderColor: '#E4E1DA' },
  hariChipActive: { backgroundColor: '#4A3FC4', borderColor: '#4A3FC4' },
  hariText: { fontSize: 11.5, color: '#1C1B29' },
  hariTextActive: { color: '#FFFFFF', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 10 },
  addBtn: { backgroundColor: '#16A38A', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  addBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },

  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#1C1B29', marginBottom: 10 },
  jadwalRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#E4E1DA',
  },
  jadwalHari: { fontSize: 13.5, fontWeight: '600', color: '#1C1B29' },
  jadwalJam: { fontSize: 12, color: '#6B6968', marginTop: 2 },
  kuotaInput: {
    width: 50, textAlign: 'center', backgroundColor: '#F7F5F2',
    borderWidth: 1, borderColor: '#E4E1DA', borderRadius: 8, paddingVertical: 6, fontSize: 13,
  },
  deleteText: { fontSize: 12, color: '#D14343', fontWeight: '600' },
});