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
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';
import { useAuth } from '@/context/auth-context';

type RumahSakit = { id: string; nama: string; alamat: string };
type Poli = { id: string; nama: string };
type Jadwal = { id: string; hari: string; jam_mulai: string; jam_selesai: string; kuota: number };
type Dokter = { id: string; nama: string; jadwal_dokter: Jadwal[] };

const HARI_INDEX: Record<string, number> = {
  Minggu: 0,
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
};

function getNextDateForHari(hari: string) {
  const today = new Date();
  const targetDay = HARI_INDEX[hari];
  const diff = (targetDay - today.getDay() + 7) % 7 || 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + diff);
  return nextDate.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function JadwalkanScreen() {
  const { session } = useAuth();

  const [rsList, setRsList] = useState<RumahSakit[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRs, setSelectedRs] = useState<RumahSakit | null>(null);

  const [poliList, setPoliList] = useState<Poli[]>([]);
  const [selectedPoli, setSelectedPoli] = useState<Poli | null>(null);

  const [dokterList, setDokterList] = useState<Dokter[]>([]);
  const [selectedHari, setSelectedHari] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [bookingResult, setBookingResult] = useState<{
    nomor: string;
    dokterNama: string;
    poliNama: string;
    rsNama: string;
    hari: string;
    jamMulai: string;
    jamSelesai: string;
    tanggal: string;
  } | null>(null);

  useEffect(() => {
    supabase
      .from('rumah_sakit')
      .select('*')
      .then(({ data, error }) => {
        if (data) setRsList(data);
        if (error) console.log('RS fetch error:', error);
      });
  }, []);

  useEffect(() => {
    if (!selectedRs) return;
    supabase
      .from('poli')
      .select('*')
      .then(({ data }) => {
        if (data) setPoliList(data);
      });
    setSelectedPoli(null);
    setDokterList([]);
    setBookingResult(null);
  }, [selectedRs]);

  useEffect(() => {
    if (!selectedRs || !selectedPoli) return;
    const fetchDokter = async () => {
      const { data, error } = await supabase
        .from('dokter')
        .select('id, nama, jadwal_dokter(id, hari, jam_mulai, jam_selesai, kuota)')
        .eq('rumah_sakit_id', selectedRs.id)
        .eq('poli_id', selectedPoli.id);
      if (!error && data) setDokterList(data as any);
    };
    fetchDokter();
    setBookingResult(null);
  }, [selectedRs, selectedPoli]);

  const filteredRs = rsList.filter((rs) =>
    rs.nama.toLowerCase().includes(search.toLowerCase())
  );

  const handleBooking = async (dokter: Dokter, jadwal: Jadwal) => {
    if (!session) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    const nomorAntrian = 'A-' + String(Math.floor(Math.random() * 900) + 100);

    const { error } = await supabase.from('booking').insert({
      pasien_id: session.user.id,
      dokter_id: dokter.id,
      jadwal_id: jadwal.id,
      kategori: 'Umum', 
      nomor_antrian: nomorAntrian,
      status: 'menunggu',
    });

    setSubmitting(false);

    if (error) {
      console.log('Booking error:', error);
      return;
    }

    setBookingResult({
      nomor: nomorAntrian,
      dokterNama: dokter.nama,
      poliNama: selectedPoli!.nama,
      rsNama: selectedRs!.nama,
      hari: jadwal.hari,
      jamMulai: jadwal.jam_mulai.slice(0, 5),
      jamSelesai: jadwal.jam_selesai.slice(0, 5),
      tanggal: getNextDateForHari(jadwal.hari),
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F7F5F2' }}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Jadwalkan Pemeriksaan</Text>
        <Text style={styles.pageSubtitle}>Jadwalkan pemeriksaan sesuai kebutuhan Anda</Text>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>1</Text>
          </View>
          <Text style={styles.stepLabel}>Pilih Rumah Sakit</Text>
        </View>

        <TextInput
          placeholder="Cari rumah sakit..."
          placeholderTextColor="#9C9A94"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        {filteredRs.length === 0 && (
          <Text style={styles.emptyText}>Rumah sakit tidak ditemukan</Text>
        )}

        {filteredRs.map((item) => {
          const active = selectedRs?.id === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, active && styles.cardActive]}
              onPress={() => setSelectedRs(item)}
            >
              <Text style={[styles.cardTitle, active && styles.cardTitleActive]}>
                {item.nama}
              </Text>
              <Text style={[styles.cardSub, active && styles.cardSubActive]}>
                {item.alamat}
              </Text>
            </TouchableOpacity>
          );
        })}

        {selectedRs && (
          <>
            <View style={[styles.stepRow, { marginTop: 24 }]}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>2</Text>
              </View>
              <Text style={styles.stepLabel}>Pilih Poli</Text>
            </View>

            <View style={styles.poliGrid}>
              {poliList.map((p) => {
                const active = selectedPoli?.id === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.poliCard, active && styles.poliCardActive]}
                    onPress={() => setSelectedPoli(p)}
                  >
                    <Text style={[styles.poliLabel, active && styles.poliLabelActive]}>
                      {p.nama}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {selectedRs && selectedPoli && (
          <>
            <View style={[styles.stepRow, { marginTop: 24 }]}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>3</Text>
              </View>
              <Text style={styles.stepLabel}>Pilih Dokter</Text>
            </View>

            {dokterList.length === 0 && (
              <Text style={styles.emptyText}>
                Belum ada dokter untuk poli ini di RS terpilih
              </Text>
            )}

            {dokterList.map((dok) => {
              const activeHari = selectedHari[dok.id];
              const jadwalAktif = dok.jadwal_dokter.find((j) => j.hari === activeHari);

              return (
                <View key={dok.id} style={styles.dokterCard}>
                  <Text style={styles.dokterName}>{dok.nama}</Text>

                  <View style={styles.hariRow}>
                    {dok.jadwal_dokter.map((j) => {
                      const active = activeHari === j.hari;
                      return (
                        <TouchableOpacity
                          key={j.id}
                          style={[styles.hariChip, active && styles.hariChipActive]}
                          onPress={() =>
                            setSelectedHari((prev) => ({ ...prev, [dok.id]: j.hari }))
                          }
                        >
                          <Text style={[styles.hariText, active && styles.hariTextActive]}>
                            {j.hari}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {jadwalAktif && (
                    <>
                      <View style={styles.jamBox}>
                        <Text style={styles.jamText}>
                          {jadwalAktif.jam_mulai.slice(0, 5)} - {jadwalAktif.jam_selesai.slice(0, 5)}
                        </Text>
                        <Text style={styles.kuotaText}>Available</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.bookBtn}
                        disabled={submitting}
                        onPress={() => handleBooking(dok, jadwalAktif)}
                      >
                        <Text style={styles.bookBtnText}>
                          {submitting ? 'Memproses...' : 'Booking'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              );
            })}
          </>
        )}

        {bookingResult && (
          <>
            <View style={[styles.stepRow, { marginTop: 24 }]}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>4</Text>
              </View>
              <Text style={styles.stepLabel}>Nomor Antrian</Text>
            </View>

            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>{bookingResult.tanggal}</Text>
              <Text style={styles.resultSub}>Nomor antrian anda:</Text>
              <Text style={styles.resultNomor}>{bookingResult.nomor}</Text>

              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() =>
                  router.push({
                    pathname: '/detail-booking',
                    params: bookingResult,
                  })
                }
              >
                <Text style={styles.detailBtnText}>Lihat Detail Booking</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 60 },
  pageTitle: { fontSize: 20, fontWeight: '700', color: '#1C1B29' },
  pageSubtitle: { fontSize: 12.5, color: '#6B6968', marginTop: 4, marginBottom: 20 },

  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4A3FC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 14, fontWeight: '600', color: '#1C1B29' },

  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E1DA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1C1B29',
    marginBottom: 12,
  },
  emptyText: { fontSize: 12.5, color: '#6B6968', marginTop: 8, marginBottom: 8 },

  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E1DA',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardActive: { borderColor: '#4A3FC4', backgroundColor: '#E7E4FB' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#1C1B29' },
  cardTitleActive: { color: '#2E2470' },
  cardSub: { fontSize: 12, color: '#6B6968', marginTop: 3 },
  cardSubActive: { color: '#4A3FC4' },

  poliGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  poliCard: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E1DA',
  },
  poliCardActive: { backgroundColor: '#4A3FC4', borderColor: '#4A3FC4' },
  poliLabel: { fontSize: 13, color: '#1C1B29' },
  poliLabelActive: { color: '#FFFFFF', fontWeight: '600' },

  dokterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E4E1DA',
  },
  dokterName: { fontSize: 14, fontWeight: '600', color: '#1C1B29', marginBottom: 10 },
  hariRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hariChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F7F5F2',
  },
  hariChipActive: { backgroundColor: '#2E2470' },
  hariText: { fontSize: 12, color: '#1C1B29' },
  hariTextActive: { color: '#FFFFFF', fontWeight: '600' },

  jamBox: {
    marginTop: 12,
    backgroundColor: '#E7E4FB',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jamText: { fontSize: 13, fontWeight: '600', color: '#2E2470' },
  kuotaText: { fontSize: 12, color: '#4A3FC4' },

  bookBtn: {
    backgroundColor: '#4A3FC4',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  bookBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },

  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E4E1DA',
  },
  resultLabel: { fontSize: 12.5, color: '#6B6968', marginBottom: 4 },
  resultSub: { fontSize: 12.5, color: '#6B6968', marginTop: 8 },
  resultNomor: { fontSize: 32, fontWeight: '700', color: '#1C1B29', marginBottom: 16 },
  detailBtn: {
    backgroundColor: '#2E2470',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});
