import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfilDokter() {
  const { session } = useAuth();
  const [dokterId, setDokterId] = useState<string | null>(null);
  const [nama, setNama] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('dokter')
      .select('id, nama, foto_url')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setDokterId(data.id);
          setNama(data.nama);
          setFotoUrl(data.foto_url);
        }
        setLoading(false);
      });
  }, [session]);

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin ditolak', 'Aplikasi butuh akses galeri buat pilih foto');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !dokterId) return;

    setUploading(true);
    try {
      const uri = result.assets[0].uri;
      const fileExt = uri.split('.').pop();
      const fileName = `${dokterId}-${Date.now()}.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const newUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('dokter')
        .update({ foto_url: newUrl })
        .eq('id', dokterId);

      if (updateError) throw updateError;

      setFotoUrl(newUrl);
      Alert.alert('Berhasil', 'Foto profil sudah diperbarui');
    } catch (err: any) {
      Alert.alert('Gagal upload', err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator color="#4A3FC4" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Profil Saya</Text>

        <TouchableOpacity style={styles.avatarWrap} onPress={pickAndUpload} disabled={uploading}>
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialCommunityIcons name="doctor" size={48} color="#4A3FC4" />
            </View>
          )}
          <View style={styles.editBadge}>
            {uploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialCommunityIcons name="camera" size={16} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>

        <Text style={styles.hint}>Ketuk foto untuk mengganti</Text>
        <Text style={styles.dokterName}>{nama}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1B29', alignSelf: 'flex-start', marginBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  avatarWrap: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: { backgroundColor: '#E7E4FB', alignItems: 'center', justifyContent: 'center' },
  editBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#4A3FC4', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },

  hint: { fontSize: 12, color: '#6B6968', marginTop: 12 },
  dokterName: { fontSize: 16, fontWeight: '700', color: '#1C1B29', marginTop: 16 },
});