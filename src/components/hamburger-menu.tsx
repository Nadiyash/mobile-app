import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';

type Props = { visible: boolean; onClose: () => void };

export function HamburgerMenu({ visible, onClose }: Props) {
  const { session } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setRole(null);
      return;
    }
    supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => setRole(data?.role ?? null));
  }, [session]);

  const goTo = (path: string) => { onClose(); router.push(path as any); };
  const handleLogout = async () => { await supabase.auth.signOut(); onClose(); router.replace('/'); };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1}>
        <View style={styles.menu}>
          {role === 'dokter' ? (
            <>
              <Text style={styles.sectionLabel}>Menu Dokter</Text>
              <TouchableOpacity onPress={() => goTo('/dokter')}>
                <Text style={styles.item}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => goTo('/dokter/konsultasi')}>
                <Text style={styles.item}>Konsultasi Pasien</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Menu Pasien</Text>
              <TouchableOpacity onPress={() => goTo('/')}><Text style={styles.item}>Beranda</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => goTo('/jadwalkan')}><Text style={styles.item}>Jadwalkan Pemeriksaan</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => goTo('/jadwal-saya')}><Text style={styles.item}>Jadwal Saya</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => goTo('/konsultasi')}><Text style={styles.item}>Konsultasi Online</Text></TouchableOpacity>
            </>
          )}

          <View style={styles.divider} />

          {session ? (
            <TouchableOpacity onPress={handleLogout}><Text style={styles.item}>Keluar</Text></TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => goTo('/login')}><Text style={styles.item}>Masuk / Daftar</Text></TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'flex-end' },
  menu: { width: '70%', height: '100%', backgroundColor: '#2E2470', paddingTop: 60, paddingHorizontal: 24 },
  sectionLabel: { color: '#FFFFFF', fontWeight: '700', marginBottom: 16, fontSize: 14 },
  item: { color: '#FFFFFF', fontSize: 15, marginBottom: 18 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginBottom: 18 },
});