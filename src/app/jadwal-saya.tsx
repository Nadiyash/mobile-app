import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';

type BookingRow = {
  id: string;
  nomor_antrian: string;
  status: string;
  dokter: { nama: string; poli: { nama: string }; rumah_sakit: { nama: string } };
  jadwal_dokter: { hari: string; jam_mulai: string; jam_selesai: string };
};

export default function JadwalSayaScreen() {
  const { session, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!session) { setLoading(false); return; }

    supabase
      .from('booking')
      .select('id, nomor_antrian, status, dokter(nama, poli(nama), rumah_sakit(nama)), jadwal_dokter(hari, jam_mulai, jam_selesai)')
      .eq('pasien_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setBookings(data as any);
        setLoading(false);
      });
  }, [session, authLoading]);

  if (!authLoading && !session) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
        <Header />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Masuk dulu untuk melihat jadwal kamu</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginBtnText}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Jadwal Saya</Text>
        <Text style={styles.subtitle}>Riwayat dan jadwal pemeriksaan kamu</Text>

        {loading && <Text style={styles.emptyText}>Memuat...</Text>}
        {!loading && bookings.length === 0 && <Text style={styles.emptyText}>Belum ada jadwal pemeriksaan</Text>}

        {bookings.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={styles.card}
            onPress={() => router.push({
              pathname: '/detail-booking',
              params: {
                nomor: b.nomor_antrian,
                dokterNama: b.dokter.nama,
                poliNama: b.dokter.poli.nama,
                rsNama: b.dokter.rumah_sakit.nama,
                hari: b.jadwal_dokter.hari,
                jamMulai: b.jadwal_dokter.jam_mulai.slice(0, 5),
                jamSelesai: b.jadwal_dokter.jam_selesai.slice(0, 5),
                tanggal: b.jadwal_dokter.hari,
              },
            })}
          >
            <Text style={styles.kode}>{b.nomor_antrian}</Text>
            <Text style={styles.dokter}>{b.dokter.nama} · {b.dokter.poli.nama}</Text>
            <Text style={styles.rs}>{b.dokter.rumah_sakit.nama}</Text>
            <Text style={styles.status}>{b.status}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#1C1B29' },
  subtitle: { fontSize: 12.5, color: '#6B6968', marginTop: 4, marginBottom: 20 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText: { fontSize: 13, color: '#6B6968', marginBottom: 16, textAlign: 'center' },
  loginBtn: { backgroundColor: '#4A3FC4', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  loginBtnText: { color: '#FFFFFF', fontWeight: '600' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E4E1DA' },
  kode: { fontSize: 18, fontWeight: '700', color: '#4A3FC4', marginBottom: 6 },
  dokter: { fontSize: 13, fontWeight: '600', color: '#1C1B29' },
  rs: { fontSize: 12, color: '#6B6968', marginTop: 2 },
  status: { fontSize: 11, color: '#16A38A', marginTop: 6, textTransform: 'capitalize' },
});