import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, MessageCircleQuestion, ShieldAlert, Network, TrendingDown, Mic, FileSearch } from "lucide-react";
import { StatCard, SectionEyebrow } from "../components/ui";
import { fetchRegulationsTotal } from "../lib/admin-api";

const features = [
  {
    icon: Search,
    title: "Pencarian Semantik",
    desc: "Cari berdasarkan judul, nomor, topik, atau isi pasal — bukan sekadar kecocokan kata kunci.",
    to: "/cari",
  },
  {
    icon: MessageCircleQuestion,
    title: "Tanya REGS (AI)",
    desc: "Tanyakan apa pun tentang regulasi daerah dalam bahasa sehari-hari, lengkap kutipan pasal sumber.",
    to: "/tanya",
  },
  {
    icon: ShieldAlert,
    title: "Verifikasi Klaim Petugas",
    desc: "Periksa apakah biaya atau prosedur yang diminta petugas benar-benar diatur dalam regulasi resmi.",
    to: "/verifikasi",
  },
  {
    icon: Network,
    title: "Conflict Graph Engine",
    desc: "Visualisasi jaringan relasi antar-regulasi untuk mendeteksi konflik dan redundansi.",
    to: "/admin/graf",
  },
  {
    icon: TrendingDown,
    title: "Regulatory Decay Tracker",
    desc: "Deteksi proaktif regulasi usang yang perlu ditinjau ulang, lengkap pelacakan tindak lanjut.",
    to: "/admin/decay",
  },
  {
    icon: Mic,
    title: "Input Suara",
    desc: "Akses inklusif bagi warga lansia atau dengan literasi digital terbatas — cukup berbicara.",
    to: "/tanya",
  },
];

export default function Home() {
  const [totalRegulasi, setTotalRegulasi] = useState<number | null>(null);

  useEffect(() => {
    fetchRegulationsTotal()
      .then(({ total }) => {
        setTotalRegulasi(total);
      })
      .catch(() => {
        // Landing page tetap tampil walau statistik gagal dimuat
      });
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/sidoarjo2.jpg)' }}
        />
        {/* Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-ink-900/70" />
        <div className="relative mx-auto max-w-6xl px-4 py-32 sm:px-6 sm:py-40 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Satu pintu untuk seluruh
              <br />
              <span className="text-brass-400">regulasi daerah</span> Sidoarjo.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-200">
              REGSIDA mengumpulkan seluruh Perda, Perbup, SE, dan Instruksi Bupati Sidoarjo ke satu tempat yang bisa dicari, ditanya, dan diverifikasi kapan pun butuh.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/tanya"
                className="group flex items-center gap-2 rounded-lg bg-brass-600 px-8 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-brass-500"
              >
                Tanyakan ke REGS
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/cari"
                className="flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-8 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <Search className="h-4 w-4" />
                Jelajahi Regulasi
              </Link>
              <Link
                to="/verifikasi"
                className="flex items-center gap-2 rounded-lg border border-sirah-400/50 bg-sirah-500/10 px-8 py-3 text-sm font-medium text-sirah-200 backdrop-blur-sm transition-colors hover:bg-sirah-500/20"
              >
                <ShieldAlert className="h-4 w-4" />
                Cek Pungli
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionEyebrow>Mengapa REGSIDA dibutuhkan</SectionEyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
              Regulasi yang tersebar adalah regulasi yang tidak berdaya.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-600">
              Kabupaten Sidoarjo, seperti kebanyakan daerah di Indonesia, menerbitkan
              ratusan produk hukum dari berbagai OPD setiap tahunnya. Warga tidak
              tahu hak dan kewajibannya. ASN membuat keputusan tanpa rujukan yang
              pasti. Dan celah ketidaktahuan ini menjadi ladang bagi praktik pungutan
              tidak resmi.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <StatCard
                value={totalRegulasi != null ? String(totalRegulasi) : "—"}
                label="Dokumen regulasi"
                sub="terindeks dalam sistem"
              />
              <StatCard value="< 30 dtk" label="Waktu pencarian" sub="dibanding 15-30 menit manual" />
            </div>
          </div>
          <div className="rounded-2xl border border-ink-200 bg-white p-8 shadow-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sirah-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest2 text-sirah-700">
              <span className="h-2 w-2 rounded-full bg-sirah-500" />
              Tanpa REGSIDA
            </div>
            <ul className="mt-6 space-y-4 text-base text-ink-700">
              <li className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sirah-500" />Warga membaca puluhan halaman PDF untuk satu jawaban sederhana.</li>
              <li className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sirah-500" />Petugas dapat mengklaim "prosedur tambahan" tanpa bisa diverifikasi warga.</li>
              <li className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sirah-500" />Regulasi yang saling bertentangan tidak terdeteksi hingga menimbulkan masalah.</li>
              <li className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sirah-500" />Regulasi usang dibiarkan tanpa tinjauan karena tidak ada yang memantau.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-ink-100 bg-ink-50/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionEyebrow>Kapabilitas sistem</SectionEyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
            Bukan sekadar mesin pencari — navigator penalaran hukum daerah.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Link
                key={f.title}
                to={f.to}
                className="group rounded-2xl border border-ink-200 bg-white p-7 shadow-lg transition-all hover:-translate-y-2 hover:border-brass-300 hover:shadow-2xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-ink-900 to-ink-700 text-brass-300 shadow-md">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold text-ink-900">{f.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-ink-600">{f.desc}</p>
                <div className="mt-6 flex items-center gap-2 text-base font-semibold text-brass-700 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                  Lihat selengkapnya <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 to-ink-800 px-10 py-16 sm:px-16">
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-sirah-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest2 text-sirah-300">
                <FileSearch className="h-4 w-4" /> Pencegahan pungutan tidak resmi
              </div>
              <h3 className="mt-4 font-display text-3xl font-semibold text-white">
                Diminta membayar biaya yang terasa tidak biasa?
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-ink-200">
                Periksa dulu apakah biaya tersebut benar-benar diatur dalam regulasi resmi
                Kabupaten Sidoarjo, sebelum membayar.
              </p>
            </div>
            <Link
              to="/verifikasi"
              className="flex shrink-0 items-center gap-3 rounded-xl bg-white px-8 py-4 text-base font-semibold text-ink-900 shadow-xl transition-all hover:-translate-y-1 hover:bg-brass-100 hover:shadow-2xl"
            >
              Verifikasi sekarang <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
