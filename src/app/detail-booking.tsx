import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/header';

export default function DetailBookingScreen() {
  const params = useLocalSearchParams<{
    nama: string;
    nomor: string;
    dokterNama: string;
    poliNama: string;
    rsNama: string;
    hari: string;
    jamMulai: string;
    jamSelesai: string;
    tanggal: string;
  }>();

  const rows = [
    { label: 'Pasien', value: params.nama }, 
    { label: 'Dokter', value: params.dokterNama },
    { label: 'Spesialis/Poli', value: params.poliNama },
    { label: 'Rumah Sakit', value: params.rsNama },
    { label: 'Jadwal', value: params.tanggal },
    { label: 'Jam', value: `${params.jamMulai} - ${params.jamSelesai}` },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Penjadwalan Berhasil</Text>
        <Text style={styles.subtitle}>Simpan/tunjukkan kode booking saat tiba di rumah sakit</Text>

        <View style={styles.card}>
          <Text style={styles.kodeLabel}>Kode booking</Text>
          <Text style={styles.kodeValue}>{params.nomor}</Text>

          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/')}>
          <Text style={styles.backBtnText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#16A38A' },
  subtitle: { fontSize: 12.5, color: '#6B6968', marginTop: 4, marginBottom: 20 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: '#E4E1DA', marginBottom: 24,
  },
  kodeLabel: { fontSize: 12, color: '#6B6968' },
  kodeValue: { fontSize: 24, fontWeight: '700', color: '#1C1B29', marginBottom: 16 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  rowLabel: { fontSize: 13, color: '#6B6968' },
  rowValue: { fontSize: 13, color: '#1C1B29', fontWeight: '600' },

  backBtn: {
    backgroundColor: '#2E2470', borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  backBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
});