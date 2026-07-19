import { useEffect, useState } from "react";
import { Users, AlertCircle } from "lucide-react";
import { fetchCivicInsights } from "../lib/admin-api";
import { getErrorMessage } from "../lib/api";

export default function SuaraWarga() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchCivicInsights();
        setData(res);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest2 text-brass-700 mb-2">
          <Users className="h-3.5 w-3.5" />
          Civic Sentiment Intelligence
        </div>
        <h1 className="font-display text-3xl font-semibold text-ink-900">Suara Warga</h1>
        <p className="mt-2 text-ink-600">Analisis interaksi warga dengan REGSIDA secara agregat.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-sirah-200 bg-sirah-50 p-4 text-sm text-sirah-800 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-ink-500">
          Memuat data...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-ink-200 bg-white p-5">
              <div className="text-2xl font-display font-semibold text-ink-900">
                {data?.total_interactions || 0}
              </div>
              <div className="text-xs text-ink-500">Total Interaksi</div>
            </div>
            <div className="rounded-xl border border-ink-200 bg-white p-5">
              <div className="text-2xl font-display font-semibold text-ink-900">
                {data?.top_topics?.[0]?.topic || "-"}
              </div>
              <div className="text-xs text-ink-500">Topik Terpopuler</div>
            </div>
            <div className="rounded-xl border border-ink-200 bg-white p-5">
              <div className="text-2xl font-display font-semibold text-ink-900">
                {data?.sentiment_breakdown?.positive || 0}%
              </div>
              <div className="text-xs text-ink-500">Sentimen Positif</div>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-ink-900 mb-4">Topik yang Sering Ditanyakan</h3>
            {data?.top_topics?.length > 0 ? (
              <div className="space-y-3">
                {data.top_topics.map((topic: any, index: number) => (
                  <div key={index} className="flex items-center justify-between border-b border-ink-100 pb-3 last:border-0 last:pb-0">
                    <div className="text-sm text-ink-800">{topic.topic}</div>
                    <div className="text-xs font-medium text-ink-500">{topic.count} interaksi</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-ink-500">Belum ada data topik.</div>
            )}
          </div>

          <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
            <h3 className="font-display text-lg font-semibold text-ink-900 mb-4">Breakdown Sentimen</h3>
            {data?.sentiment_breakdown ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-sawo-200 bg-sawo-50 p-4">
                  <div className="text-lg font-semibold text-sawo-800">{data.sentiment_breakdown.positive}%</div>
                  <div className="text-xs text-sawo-700">Positif</div>
                </div>
                <div className="rounded-lg border border-brass-200 bg-brass-50 p-4">
                  <div className="text-lg font-semibold text-brass-800">{data.sentiment_breakdown.neutral}%</div>
                  <div className="text-xs text-brass-700">Netral</div>
                </div>
                <div className="rounded-lg border border-sirah-200 bg-sirah-50 p-4">
                  <div className="text-lg font-semibold text-sirah-800">{data.sentiment_breakdown.negative}%</div>
                  <div className="text-xs text-sirah-700">Negatif</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-ink-500">Belum ada data sentimen.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
