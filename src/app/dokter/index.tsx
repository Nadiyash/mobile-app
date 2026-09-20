import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';

type BookingRow = {
  id: string;
  nomor_antrian: string;
  status: string;
  kategori: string;
  pasien: { nama: string } | null;
  jadwal_dokter: { hari: string; jam_mulai: string; jam_selesai: string };
};

export default function DokterDashboard() {
  const { session } = useAuth();
  const [dokterNama, setDokterNama] = useState('');
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const { data: dokterRow } = await supabase
        .from('dokter')
        .select('id, nama')
        .eq('user_id', session.user.id)
        .single();

      if (!dokterRow) {
        setLoading(false);
        return;
      }

      setDokterNama(dokterRow.nama);

      const { data, error } = await supabase
        .from('booking')
        .select('id, nomor_antrian, status, kategori, pasien:pasien_id(nama), jadwal_dokter(hari, jam_mulai, jam_selesai)')
        .eq('dokter_id', dokterRow.id)
        .order('created_at', { ascending: false });

      if (!error && data) setBookings(data as any);
      setLoading(false);
    };

    fetchData();
  }, [session]);

  const updateStatus = async (bookingId: string, status: 'selesai' | 'batal') => {
    const { error } = await supabase.from('booking').update({ status }).eq('id', bookingId);
    if (!error) {
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dashboard Dokter</Text>
        <Text style={styles.subtitle}>{dokterNama}</Text>

        {loading && <Text style={styles.emptyText}>Memuat...</Text>}
        {!loading && bookings.length === 0 && (
          <Text style={styles.emptyText}>Belum ada pasien yang booking</Text>
        )}

        {bookings.map((b) => (
          <View key={b.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.kode}>{b.nomor_antrian}</Text>
              <View style={[styles.statusBadge, styles[`status_${b.status}` as keyof typeof styles]]}>
                <Text style={styles.statusText}>{b.status}</Text>
              </View>
            </View>
            <Text style={styles.pasienName}>{b.pasien?.nama ?? 'Pasien'}</Text>
            <Text style={styles.jadwalInfo}>
              {b.jadwal_dokter.hari}, {b.jadwal_dokter.jam_mulai.slice(0, 5)} - {b.jadwal_dokter.jam_selesai.slice(0, 5)}
            </Text>
            <Text style={styles.kategoriInfo}>{b.kategori}</Text>

            {b.status === 'menunggu' && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.btnSelesai}
                  onPress={() => updateStatus(b.id, 'selesai')}
                >
                  <Text style={styles.btnSelesaiText}>Tandai Selesai</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnBatal}
                  onPress={() => updateStatus(b.id, 'batal')}
                >
                  <Text style={styles.btnBatalText}>Batalkan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#1C1B29' },
  subtitle: { fontSize: 13, color: '#4A3FC4', fontWeight: '600', marginTop: 4, marginBottom: 20 },
  emptyText: { fontSize: 13, color: '#6B6968', textAlign: 'center', marginTop: 20 },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#E4E1DA',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  kode: { fontSize: 16, fontWeight: '700', color: '#4A3FC4' },

  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 100 },
  status_menunggu: { backgroundColor: '#FFF4D6' },
  status_selesai: { backgroundColor: '#D8F3EC' },
  status_batal: { backgroundColor: '#FADADA' },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize', color: '#1C1B29' },

  pasienName: { fontSize: 14, fontWeight: '600', color: '#1C1B29' },
  jadwalInfo: { fontSize: 12.5, color: '#6B6968', marginTop: 3 },
  kategoriInfo: { fontSize: 12, color: '#6B6968', marginTop: 2 },

  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  btnSelesai: { flex: 1, backgroundColor: '#16A38A', borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  btnSelesaiText: { color: '#FFFFFF', fontSize: 12.5, fontWeight: '600' },
  btnBatal: { flex: 1, backgroundColor: '#F7F5F2', borderWidth: 1, borderColor: '#E4E1DA', borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  btnBatalText: { color: '#D14343', fontSize: 12.5, fontWeight: '600' },
});