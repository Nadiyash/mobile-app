import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Header } from '@/components/header';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MENU = [
  { label: 'Data Rumah Sakit', icon: 'domain', path: '/admin/rumah-sakit' },
  { label: 'Kelola Dokter', icon: 'doctor', path: '/admin/dokter' },
  { label: 'Langganan', icon: 'credit-card-outline', path: '/admin/langganan' },
] as const;

export default function AdminDashboard() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard Admin RS</Text>
        <Text style={styles.subtitle}>Kelola data rumah sakit kamu</Text>

        {MENU.map((item) => (
          <TouchableOpacity
            key={item.path}
            style={styles.menuCard}
            onPress={() => router.push(item.path as any)}
          >
            <MaterialCommunityIcons name={item.icon as any} size={24} color="#4A3FC4" />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#9C9A94" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#1C1B29' },
  subtitle: { fontSize: 12.5, color: '#6B6968', marginTop: 4, marginBottom: 24 },
  menuCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#E4E1DA',
  },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1C1B29' },
});