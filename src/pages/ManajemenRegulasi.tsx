import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Edit, Upload, AlertCircle } from "lucide-react";
import { fetchRegulationsForAdmin, createRegulation, updateRegulation, uploadRegulationPdf } from "../lib/admin-api";
import { mapRegulationToRegulasi, BackendRegulation } from "../lib/adapters";
import { getErrorMessage } from "../lib/api";
import { Regulasi } from "../data/types";

export default function ManajemenRegulasi() {
  const [regulasi, setRegulasi] = useState<Regulasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRegulasi, setEditingRegulasi] = useState<BackendRegulation | null>(null);
  const [formData, setFormData] = useState({
    judul: "",
    jenis: "perda",
    nomor: "",
    tahun: new Date().getFullYear(),
    tentang: "",
    opd: "",
  });
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  useEffect(() => {
    loadRegulasi();
  }, []);

  async function loadRegulasi() {
    try {
      setIsLoading(true);
      const data = await fetchRegulationsForAdmin({ per_page: 50 });
      setRegulasi(data.data.map(mapRegulationToRegulasi));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      if (editingRegulasi) {
        await updateRegulation(editingRegulasi.id, formData);
      } else {
        await createRegulation(formData);
      }
      setShowForm(false);
      setEditingRegulasi(null);
      setFormData({
        judul: "",
        jenis: "perda",
        nomor: "",
        tahun: new Date().getFullYear(),
        tentang: "",
        opd: "",
      });
      loadRegulasi();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleUpload(regulasiId: number) {
    if (!uploadingFile) return;
    try {
      setUploadingId(regulasiId);
      setUploadProgress(0);
      await uploadRegulationPdf(regulasiId, uploadingFile, setUploadProgress);
      setUploadingId(null);
      setUploadingFile(null);
      setUploadProgress(0);
      loadRegulasi();
    } catch (err) {
      setError(getErrorMessage(err));
      setUploadingId(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-ink-900">Manajemen Regulasi</h1>
        <p className="mt-2 text-ink-600">Kelola daftar regulasi Kabupaten Sidoarjo, upload PDF, dan update metadata.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-sirah-200 bg-sirah-50 p-4 text-sm text-sirah-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div></div>
        <button
          onClick={() => {
            setEditingRegulasi(null);
            setFormData({
              judul: "",
              jenis: "perda",
              nomor: "",
              tahun: new Date().getFullYear(),
              tentang: "",
              opd: "",
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-ink-900 px-4 py-2 text-sm font-medium text-white hover:bg-ink-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Regulasi
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-ink-900">
              {editingRegulasi ? "Edit Regulasi" : "Tambah Regulasi Baru"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingRegulasi(null);
              }}
              className="text-sm text-ink-500 hover:text-ink-800"
            >
              Batal
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-1">Judul</label>
                <input
                  required
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brass-400 focus:outline-none"
                  placeholder="Judul regulasi..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Jenis</label>
                <select
                  required
                  value={formData.jenis}
                  onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brass-400 focus:outline-none"
                >
                  <option value="perda">Peraturan Daerah</option>
                  <option value="perbup">Peraturan Bupati</option>
                  <option value="se">Surat Edaran</option>
                  <option value="instruksi_bupati">Instruksi Bupati</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Nomor</label>
                <input
                  required
                  value={formData.nomor}
                  onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brass-400 focus:outline-none"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">Tahun</label>
                <input
                  required
                  type="number"
                  value={formData.tahun}
                  onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brass-400 focus:outline-none"
                  placeholder="2024"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-1">Tentang</label>
                <textarea
                  required
                  value={formData.tentang}
                  onChange={(e) => setFormData({ ...formData, tentang: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brass-400 focus:outline-none"
                  placeholder="Tentang apa regulasi ini..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1">OPD</label>
                <input
                  required
                  value={formData.opd}
                  onChange={(e) => setFormData({ ...formData, opd: e.target.value })}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm focus:border-brass-400 focus:outline-none"
                  placeholder="Dinas Pendidikan"
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="rounded-lg bg-brass-700 px-4 py-2 text-sm font-medium text-white hover:bg-brass-800"
              >
                {editingRegulasi ? "Simpan Perubahan" : "Tambah Regulasi"}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-ink-500">
          Memuat daftar regulasi...
        </div>
      ) : (
        <div className="rounded-2xl border border-ink-200 bg-white shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ink-50 border-b border-ink-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest text-ink-500">
                    Regulasi
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest text-ink-500">
                    OPD
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-widest text-ink-500">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {regulasi.map((item) => (
                  <tr key={item.id} className="hover:bg-ink-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-ink-400" />
                        <div>
                          <Link
                            to={`/regulasi/${item.id}`}
                            className="text-sm font-medium text-ink-900 hover:text-brass-700"
                          >
                            {item.judul}
                          </Link>
                          <div className="text-xs text-ink-500 mt-0.5">
                            {item.jenis} No. {item.nomor}/{item.tahun}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-600">{item.opd}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            // Convert back to backend number id for editing
                            const backendId = parseInt(item.id);
                            // For now, we'll use a minimal backend object since we don't have all fields
                            setEditingRegulasi({
                              id: backendId,
                              judul: item.judul,
                              jenis: item.jenis.toLowerCase().replace(/ /g, "_"),
                              nomor: item.nomor,
                              tahun: item.tahun,
                              opd: item.opd,
                              status: "berlaku",
                              tags: item.tags,
                              ringkasan: item.ringkasan,
                              decay_score: item.decayScore,
                              jumlah_dilihat: item.jumlahDilihat,
                              jumlah_ditanyakan: item.jumlahDitanyakan,
                              tanggal_terbit: item.tanggalTerbit,
                            } as BackendRegulation);
                            setFormData({
                              judul: item.judul,
                              jenis: item.jenis.toLowerCase().replace(/ /g, "_"),
                              nomor: item.nomor,
                              tahun: item.tahun,
                              tentang: "", // We don't have this field in frontend type
                              opd: item.opd,
                            });
                            setShowForm(true);
                          }}
                          className="rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
                        >
                          <Edit className="h-3.5 w-3.5 inline mr-1" />
                          Edit
                        </button>
                        <div className="flex items-center gap-2">
                          <input
                            id={`pdf-${item.id}`}
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => setUploadingFile(e.target.files?.[0] || null)}
                          />
                          <label
                            htmlFor={`pdf-${item.id}`}
                            className="cursor-pointer rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-ink-50"
                          >
                            <Upload className="h-3.5 w-3.5 inline mr-1" />
                            Upload PDF
                          </label>
                          {uploadingId === parseInt(item.id) ? (
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-ink-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-brass-600 transition-all"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                              <span className="text-xs text-ink-500">{uploadProgress}%</span>
                            </div>
                          ) : uploadingFile ? (
                            <button
                              onClick={() => handleUpload(parseInt(item.id))}
                              className="rounded-md bg-sawo-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-sawo-800"
                            >
                              Kirim
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
