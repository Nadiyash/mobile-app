import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HamburgerMenu } from './hamburger-menu';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.logoRow}>
        <Text style={styles.logoIcon}>✚</Text>
        <Text style={styles.logoText}>VitaCare</Text>
      </View>
      <TouchableOpacity onPress={() => setMenuOpen(true)}>
        <Text style={styles.hamburger}>☰</Text>
      </TouchableOpacity>

      <HamburgerMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { color: '#16A38A', fontSize: 18 },
  logoText: { color: '#4A3FC4', fontWeight: '700', fontSize: 18 },
  hamburger: { fontSize: 22, color: '#1C1B29' },
});