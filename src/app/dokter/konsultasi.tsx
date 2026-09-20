import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import {
  OverlayProvider,
  Chat,
  ChannelList,
  Channel,
  MessageList,
  MessageInput,
  useCreateChatClient,
} from 'stream-chat-expo';
import { supabase } from '@/lib/supabase';
import { STREAM_API_KEY } from '@/lib/stream-chat';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';
import { StreamChat } from 'stream-chat';

function DokterChat({ dokterId }: { dokterId: string }) {
  const [selectedChannel, setSelectedChannel] = useState<any>(null);

  const chatClient = useCreateChatClient({
    apiKey: STREAM_API_KEY,
    userData: { id: dokterId, name: 'Dokter' },
    tokenOrProvider: StreamChat.getInstance(STREAM_API_KEY).devToken(dokterId),
  });

  useEffect(() => {
    setSelectedChannel(null);
  }, [dokterId]);

  if (!chatClient) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color="#4A3FC4" />
        <Text style={styles.loadingText}>Menyiapkan chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <OverlayProvider>
        <Chat client={chatClient}>
          {selectedChannel ? (
            <Channel channel={selectedChannel}>
              <MessageList />
              <MessageInput />
            </Channel>
          ) : (
            <ChannelList
              filters={{ members: { $in: [dokterId] } }}
              onSelect={(channel) => setSelectedChannel(channel)}
            />
          )}
        </Chat>
      </OverlayProvider>
    </KeyboardAvoidingView>
  );
}

export default function DokterKonsultasiScreen() {
  const { session } = useAuth();
  const [dokterId, setDokterId] = useState<string | null>(null);

  useEffect(() => {
    setDokterId(null); // reset dulu tiap session berubah

    if (!session) return;

    supabase
      .from('dokter')
      .select('id')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => {
        if (data) setDokterId(data.id.slice(0, 8));
      });
  }, [session]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      {dokterId ? (
        <DokterChat key={dokterId} dokterId={dokterId} />
      ) : (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#4A3FC4" />
          <Text style={styles.loadingText}>Memuat data dokter...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: '#6B6968' },
});