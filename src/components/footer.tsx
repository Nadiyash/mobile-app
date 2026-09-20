import { View, Text, StyleSheet, TouchableOpacity, Linking  } from 'react-native';
import { router } from 'expo-router';

const NOMOR_CS = '6283147668145'; 

const openWhatsApp = (pesan: string) => {
  const url = `https://wa.me/${NOMOR_CS}?text=${encodeURIComponent(pesan)}`;
  Linking.openURL(url);
};

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
      <TouchableOpacity
        onPress={() =>
          openWhatsApp('Halo VitaCare, saya butuh bantuan terkait aplikasi.')
        }
      >
        <Text style={styles.item}>Customer Service</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          openWhatsApp(
            'Halo VitaCare, saya ingin mendaftarkan rumah sakit saya untuk bergabung.\n\nNama RS: \nAlamat: \nNarahubung: '
          )
        }
      >
        <Text style={styles.item}>Daftarkan Rumah Sakit Anda</Text>
      </TouchableOpacity>
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