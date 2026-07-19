import { useEffect, useRef, useState } from "react";
import { Send, Mic, Square, Volume2, Sparkles, User } from "lucide-react";
import { askRegsidaAPI, getErrorMessage } from "../lib/rag-api";
import { mapChatResponseToRagResponse, newUserMessage } from "../lib/adapters";
import { ChatMessage } from "../data/types";
import { useVoiceInput, speakText } from "../lib/voice";
import ExplainabilityPanel from "../components/ExplainabilityPanel";
import { useCitizenAuth } from "../context/CitizenAuthContext";

const SUGGESTIONS = [
  "Apakah warung makan saya perlu izin khusus?",
  "Berapa tarif Pajak Restoran di Sidoarjo?",
  "Apa saja insentif fiskal untuk UMKM?",
  "Apa benar ada biaya tambahan untuk PBG?",
];

export default function Tanya() {
  const { citizen } = useCitizenAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo, saya Tanya REGS — asisten regulasi daerah Kabupaten Sidoarjo. Anda dapat bertanya tentang pajak, retribusi, izin usaha, atau regulasi lain dalam bahasa sehari-hari. Saya hanya menjawab berdasarkan regulasi yang terindeks dalam sistem.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, isSupported, start, stop } = useVoiceInput();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ragMetaMap, setRagMetaMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text?: string) {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    const userMsg = newUserMessage(q);
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const raw = await askRegsidaAPI(q);
      const res = mapChatResponseToRagResponse(raw);

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: res.answer,
        confidence: res.confidence,
        sources: res.sources.map((s) => ({ regulasiId: s.regulasiId, pasal: s.pasal, score: s.score })),
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, assistantMsg]);
      setRagMetaMap((prev) => ({ ...prev, [assistantMsg.id]: res }));
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: getErrorMessage(err),
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-8 sm:px-6 lg:px-8" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Tanya REGS</h1>
        <p className="mt-1 text-sm text-ink-500">
          Asisten AI regulasi daerah — jawaban berbasis dokumen, dengan kutipan pasal yang dapat diverifikasi.
        </p>
        {citizen && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-brass-200 bg-brass-50 px-3 py-2 text-xs text-brass-800">
            <User className="h-3.5 w-3.5" />
            <span>Kamu masuk sebagai <strong>{citizen.name}</strong> — pertanyaanmu akan tercatat atas namamu.</span>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 space-y-4 overflow-y-auto rounded-2xl border border-ink-200 bg-white p-4 sm:p-6"
        style={{ maxHeight: "60vh" }}
      >
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${m.role === "user" ? "" : "w-full"}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-ink-900 text-white"
                    : "border border-ink-200 bg-ink-50/60 text-ink-800"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-brass-700">
                    <Sparkles className="h-3 w-3" /> REGS
                  </div>
                )}
                <p className="whitespace-pre-line">{m.content}</p>
                {m.role === "assistant" && (
                  <button
                    onClick={() => speakText(m.content)}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-ink-500 hover:text-ink-800"
                  >
                    <Volume2 className="h-3.5 w-3.5" /> Dengarkan jawaban
                  </button>
                )}
              </div>
              {m.role === "assistant" && ragMetaMap[m.id] && (
                <ExplainabilityPanel
                  sources={ragMetaMap[m.id].sources}
                  consideredCount={ragMetaMap[m.id].consideredCount}
                  confidence={ragMetaMap[m.id].confidence}
                  groundedFromAI={ragMetaMap[m.id].groundedFromAI}
                />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1.5 rounded-2xl border border-ink-200 bg-ink-50/60 px-4 py-3">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-xs text-ink-600 hover:border-brass-300 hover:bg-brass-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-ink-200 bg-white p-2 shadow-card focus-within:border-brass-400">
        {isSupported && (
          <button
            onClick={isListening ? stop : start}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
              isListening ? "bg-sirah-500 text-white animate-pulse-ring" : "bg-ink-100 text-ink-600 hover:bg-ink-200"
            }`}
            aria-label={isListening ? "Hentikan rekam suara" : "Mulai input suara"}
          >
            {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={isListening ? "Mendengarkan..." : "Ketik atau ucapkan pertanyaan Anda..."}
          className="flex-1 bg-transparent px-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-900 text-white transition-colors hover:bg-ink-800 disabled:opacity-30"
          aria-label="Kirim pertanyaan"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-400">
        Jawaban bersifat informatif berdasarkan regulasi yang terindeks. Untuk kepastian hukum, konsultasikan dengan Bagian Hukum Pemda.
      </p>
    </div>
  );
}
