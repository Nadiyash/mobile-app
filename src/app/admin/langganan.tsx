import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';

export default function LanggananScreen() {
  const { session } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('rumah_sakit')
      .select('nama, status_langganan, tanggal_mulai, tanggal_berakhir')
      .eq('admin_id', session.user.id)
      .single()
      .then(({ data }) => setData(data));
  }, [session]);

  if (!data) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
        <Header />
      </View>
    );
  }

  const statusColor = data.status_langganan === 'aktif' ? '#16A38A' : '#D14343';

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Status Langganan</Text>

        <View style={styles.card}>
          <Text style={styles.rsName}>{data.nama}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor }]}>
            <Text style={styles.badgeText}>{data.status_langganan.toUpperCase()}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Mulai</Text>
            <Text style={styles.value}>{data.tanggal_mulai ?? '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Berakhir</Text>
            <Text style={styles.value}>{data.tanggal_berakhir ?? '-'}</Text>
          </View>
        </View>

        <Text style={styles.note}>
          Untuk perpanjangan atau perubahan status langganan, hubungi tim VitaCare.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1B29', marginBottom: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#E4E1DA' },
  rsName: { fontSize: 15, fontWeight: '700', color: '#1C1B29', marginBottom: 10 },
  badge: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 100, marginBottom: 16 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 12.5, color: '#6B6968' },
  value: { fontSize: 12.5, color: '#1C1B29', fontWeight: '600' },
  note: { fontSize: 12, color: '#6B6968', marginTop: 16, lineHeight: 18 },
});