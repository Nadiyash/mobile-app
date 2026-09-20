const { StreamChat } = require('stream-chat');

const API_KEY = '9k7zy54qmg7g';
const API_SECRET = '2nwxcx2wxsa423udxsb5x8drhh4mrd23kdndn3r6jbmm8eat9awshph8sqwcn48c';


async function main() {
  const client = StreamChat.getInstance(API_KEY, API_SECRET);

  await client.updateAppSettings({
    disable_auth_checks: true,
  });

  console.log('Berhasil! disable_auth_checks sekarang: true');
  console.log('devToken sekarang bisa dipake buat testing di app kamu.');
}

main().catch((err) => {
  console.error('Gagal:', err.message);
});