import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';
import { POLI_ICON } from '@/constants/poli-icons';

type Poli = { id: string; nama: string };

export default function HomeScreen() {
  const [poli, setPoli] = useState<Poli[]>([]);
  const [activeTab, setActiveTab] = useState<'Semua' | 'Rumah Sakit' | 'Dokter' | 'Poli'>('Semua');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPoli = async () => {
      const { data, error } = await supabase.from('poli').select('*');
      if (!error && data) setPoli(data);
    };
    fetchPoli();
  }, []);

  const tabs: typeof activeTab[] = ['Semua', 'Rumah Sakit', 'Dokter', 'Poli'];

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Kesehatan Anda,{'\n'}Genggaman Anda</Text>
          <Text style={styles.heroSubtitle}>
            Temukan dokter spesialis, cek jadwal poli, dan konsultasi langsung dari mana saja.
          </Text>

          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push('/jadwalkan')}
          >
            <Text style={styles.btnPrimaryText}>Jadwalkan Pemeriksaan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push('/konsultasi')}
          >
            <Text style={styles.btnSecondaryText}>Konsultasi Online</Text>
          </TouchableOpacity>

          <View style={styles.searchCard}>
            <View style={styles.tabRow}>
              {tabs.map((tab) => (
                <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
                  <View style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}>
                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                      {tab}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.searchRow}>
              <TextInput
                placeholder="Cari rumah sakit, dokter, atau poli..."
                placeholderTextColor="#9C9A94"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
              <TouchableOpacity style={styles.searchBtn}>
                <Text style={styles.searchBtnText}>Cari</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Poli & Spesialisasi</Text>
            <Text style={styles.sectionLink}>Lihat Semua Poli</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Pilih poli yang sesuai kebutuhan Anda</Text>

          <View style={styles.poliGrid}>
            {poli.map((item) => (
              <TouchableOpacity key={item.id} style={styles.poliCard}>
                <MaterialCommunityIcons
                  name={POLI_ICON[item.nama] ?? 'help-circle-outline'}
                  size={26}
                  color="#4A3FC4"
                />
                <Text style={styles.poliLabel}>{item.nama}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#4A3FC4',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 10,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  btnPrimary: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 13,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryText: { color: '#4A3FC4', fontWeight: '600', fontSize: 14 },
  btnSecondary: {
    backgroundColor: '#16A38A',
    paddingVertical: 13,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  btnSecondaryText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    width: '100%',
  },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tabItem: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  tabItemActive: { backgroundColor: '#2E2470' },
  tabText: { fontSize: 12, color: '#6B6968' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '600' },
  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: '#1C1B29',
    paddingVertical: 6,
  },
  searchBtn: {
    backgroundColor: '#2E2470',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  searchBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1C1B29' },
  sectionLink: { fontSize: 12, color: '#4A3FC4' },
  sectionSubtitle: { fontSize: 12.5, color: '#6B6968', marginTop: 2, marginBottom: 16 },

  poliGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  poliCard: {
    width: '22%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E1DA',
  },
  poliLabel: { fontSize: 11.5, color: '#1C1B29', marginTop: 6 },
});