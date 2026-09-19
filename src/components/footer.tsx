import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.sectionLabel}>Menu Pasien</Text>
      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.item}>Beranda</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/jadwalkan')}>
        <Text style={styles.item}>Jadwalkan Pemeriksaan</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/konsultasi')}>
        <Text style={styles.item}>Konsultasi Online</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Lainnya</Text>
      <Text style={styles.item}>Customer Service</Text>
      <Text style={styles.item}>Daftarkan Rumah Sakit Anda</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#2E2470',
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    marginTop: 24,
  },
  sectionLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 13, marginBottom: 12 },
  item: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginBottom: 14, fontWeight: '500' },
});