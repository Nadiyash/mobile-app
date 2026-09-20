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
import { useLocalSearchParams } from 'expo-router';
import { STREAM_API_KEY } from '@/lib/stream-chat';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';
import { StreamChat } from 'stream-chat';

function PasienChat({ userId, userName, initialDokterId, initialDokterNama }: {
  userId: string;
  userName: string;
  initialDokterId?: string;
  initialDokterNama?: string;
}) {
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [channelName, setChannelName] = useState<string | null>(null);

  const chatClient = useCreateChatClient({
    apiKey: STREAM_API_KEY,
    userData: { id: userId, name: userName },
    tokenOrProvider: StreamChat.getInstance(STREAM_API_KEY).devToken(userId),
  });

  useEffect(() => {
    if (!chatClient || !initialDokterId) return;
    let cancelled = false;

    const openDirectChat = async () => {
      const shortUserId = userId.slice(0, 8);
      const shortDokterId = initialDokterId.slice(0, 8);
      const channelId = `k-${shortUserId}-${shortDokterId}`;
      const name = initialDokterNama ? `Konsultasi dengan ${initialDokterNama}` : 'Konsultasi dengan Dokter';

      const ch = chatClient.channel('messaging', channelId, {
        members: [userId, shortDokterId],
        name,
      } as any);
      await ch.watch();
      try {
        await ch.addMembers([shortDokterId]);
      } catch {}

      if (!cancelled) {
        setSelectedChannel(ch);
        setChannelName(name);
      }
    };

    openDirectChat();
    return () => { cancelled = true; };
  }, [chatClient, initialDokterId]);

  if (!chatClient) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color="#4A3FC4" />
        <Text style={styles.loadingText}>Menyiapkan konsultasi...</Text>
      </View>
    );
  }

  return (
    <>
      {channelName && selectedChannel && (
        <View style={styles.chatHeader}>
          <Text style={styles.chatHeaderText}>{channelName}</Text>
        </View>
      )}
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
                filters={{ members: { $in: [userId] } }}
                onSelect={(channel) => {
                  setSelectedChannel(channel);
                  setChannelName((channel.data as any)?.name ?? 'Konsultasi');
                }}
              />
            )}
          </Chat>
        </OverlayProvider>
      </KeyboardAvoidingView>
    </>
  );
}

export default function KonsultasiScreen() {
  const { session, loading: authLoading } = useAuth();
  const { dokterId, dokterNama } = useLocalSearchParams<{ dokterId?: string; dokterNama?: string }>();

  const userId = session?.user.id ?? 'guest-user';
  const userName = session?.user.email?.split('@')[0] ?? 'Pasien';

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
        <Header />
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#4A3FC4" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <PasienChat
        key={userId}
        userId={userId}
        userName={userName}
        initialDokterId={dokterId}
        initialDokterNama={dokterNama}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: '#6B6968' },
  chatHeader: {
    backgroundColor: '#4A3FC4',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  chatHeaderText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});