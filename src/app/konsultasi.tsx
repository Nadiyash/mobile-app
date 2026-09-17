import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import { STREAM_API_KEY } from '@/lib/stream-chat';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';

type ChatMessage = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: string;
  isMine: boolean;
};

export default function KonsultasiScreen() {
  const { session, loading: authLoading } = useAuth();
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);

  const clientRef = useRef<StreamChat | null>(null);
  const listRef = useRef<FlatList>(null);

  const userId = session?.user.id ?? 'guest-user';
  const userName = session?.user.email?.split('@')[0] ?? 'Pasien';

  // Ubah data mentah dari Stream jadi bentuk yang gampang dipakai FlatList
  const mapMessage = useCallback(
    (msg: any): ChatMessage => ({
      id: msg.id,
      text: msg.text ?? '',
      userId: msg.user?.id ?? '',
      userName: msg.user?.name ?? msg.user?.id ?? 'Unknown',
      createdAt: msg.created_at ?? new Date().toISOString(),
      isMine: msg.user?.id === userId,
    }),
    [userId],
  );

  useEffect(() => {
    if (authLoading) return;
    let isMounted = true;

    const setup = async () => {
      try {
        // stream-chat (bukan stream-chat-expo) = pure JS client, no native module,
        // jadi aman jalan di Expo Go.
        const client = StreamChat.getInstance(STREAM_API_KEY);
        clientRef.current = client;

        // NOTE: devToken cuma boleh dipake kalau "Disable Auth Checks" di-enable
        // di Stream Dashboard (App Settings > Auth). Untuk production,
        // token HARUS digenerate di backend pakai API Secret, jangan di client.
        const token = client.devToken(userId);

        if (!client.user) {
          await client.connectUser({ id: userId, name: userName }, token);
        }

        const ch = client.channel('messaging', `konsultasi-${userId}`, {
          members: [userId],
          name: 'Konsultasi dengan Dokter',
        });

        await ch.watch();

        if (!isMounted) return;

        setChannel(ch);
        setMessages(ch.state.messages.map(mapMessage));
        setReady(true);

        // Dengerin pesan baru yang masuk real-time
        ch.on('message.new', (event) => {
          if (!event.message) return;
          setMessages((prev) => [...prev, mapMessage(event.message)]);
        });
      } catch (err) {
        console.error('Gagal setup chat:', err);
      }
    };

    setup();

    return () => {
      isMounted = false;
      clientRef.current?.disconnectUser();
    };
  }, [authLoading, userId, userName, mapMessage]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !channel || sending) return;

    setSending(true);
    setInputText('');
    try {
      await channel.sendMessage({ text });
      // Pesan sendiri akan ikut masuk lewat event 'message.new' juga,
      // jadi gak perlu ditambahin manual ke state di sini.
    } catch (err) {
      console.error('Gagal kirim pesan:', err);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !ready) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
        <Header />
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#4A3FC4" />
          <Text style={styles.loadingText}>Menyiapkan konsultasi...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F7F5F2' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.isMine ? styles.bubbleMine : styles.bubbleTheirs,
            ]}
          >
            {!item.isMine && <Text style={styles.senderName}>{item.userName}</Text>}
            <Text style={item.isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>
              {item.text}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada pesan. Mulai konsultasi kamu!</Text>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Tulis pesan..."
          placeholderTextColor="#9A9895"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || sending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.sendButtonText}>Kirim</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: '#6B6968' },
  listContent: { padding: 16, gap: 10, flexGrow: 1 },
  emptyText: {
    textAlign: 'center',
    color: '#9A9895',
    marginTop: 40,
    fontSize: 13,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A3FC4',
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDEBE7',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B6968',
    marginBottom: 2,
  },
  bubbleTextMine: { color: '#FFFFFF', fontSize: 14 },
  bubbleTextTheirs: { color: '#2B2A28', fontSize: 14 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDEBE7',
    backgroundColor: '#F7F5F2',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
    color: '#2B2A28',
  },
  sendButton: {
    backgroundColor: '#4A3FC4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButtonDisabled: { opacity: 0.5 },
  sendButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});
