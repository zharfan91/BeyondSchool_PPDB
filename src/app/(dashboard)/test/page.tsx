"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/data/empty-state";
import { ClipboardList, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type QType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";

interface TestOption {
  id: string;
  label: string;
  text: string;
}
interface TestQuestion {
  id: string;
  type: QType;
  question: string;
  points: number;
  options: TestOption[];
}
interface TestAnswer {
  questionId: string;
  selectedOptionId: string | null;
  essayAnswer: string | null;
  pointsAwarded: number | null;
  feedback: string | null;
}
interface TestAttempt {
  id: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADED";
  startedAt: string;
  expiresAt: string | null;
  submittedAt: string | null;
  totalScore: number | null;
  maxScore: number | null;
}
interface TestMeta {
  title: string;
  description: string | null;
  durationMinutes: number | null;
  opensAt: string | null;
  closesAt: string | null;
  isPublished: boolean;
}

function formatRemaining(ms: number): string {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return (h > 0 ? `${h}:` : "") + `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasRegistration, setHasRegistration] = useState(true);
  const [eligible, setEligible] = useState(true);
  const [available, setAvailable] = useState(true);
  const [notYetOpen, setNotYetOpen] = useState(false);
  const [alreadyClosed, setAlreadyClosed] = useState(false);
  const [meta, setMeta] = useState<TestMeta | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, TestAnswer>>({});
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState<number>(0);
  const autoSubmittedRef = useRef(false);

  const load = () => {
    fetch("/api/test")
      .then((res) => res.json())
      .then((data) => {
        setHasRegistration(!!data.hasRegistration);
        setEligible(data.eligible ?? true);
        setAvailable(data.available ?? false);
        setNotYetOpen(!!data.notYetOpen);
        setAlreadyClosed(!!data.alreadyClosed);
        setMeta(data.test ?? null);
        setQuestions(data.questions ?? []);
        setAttempt(data.attempt ?? null);
        const map: Record<string, TestAnswer> = {};
        (data.answers ?? []).forEach((a: TestAnswer) => {
          map[a.questionId] = a;
        });
        setAnswers(map);
      })
      .catch((err) => console.error("Failed to load test:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const inProgress = attempt?.status === "IN_PROGRESS";

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submitting) return;
      if (!auto) {
        const unanswered = questions.filter((q) => {
          const a = answers[q.id];
          return !a || (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" ? !a.selectedOptionId : !a.essayAnswer?.trim());
        });
        if (unanswered.length > 0) {
          setError(`Masih ada ${unanswered.length} soal yang belum dijawab. Lengkapi semua soal sebelum mengirim.`);
          return;
        }
        if (!confirm("Kirim jawaban tes sekarang? Jawaban tidak dapat diubah setelah dikirim.")) return;
      }
      setSubmitting(true);
      setError("");
      try {
        const res = await fetch("/api/test/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auto }),
        });
        const body = await res.json();
        if (!res.ok) {
          setError(body?.error ?? "Gagal mengirim tes");
          return;
        }
        load();
      } finally {
        setSubmitting(false);
      }
    },
    [answers, questions, submitting]
  );

  // Live clock (1s) only while a timed attempt is in progress.
  useEffect(() => {
    if (!inProgress || !attempt?.expiresAt) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [inProgress, attempt?.expiresAt]);

  // Auto-submit when the timer hits zero.
  const expiryMs = attempt?.expiresAt ? new Date(attempt.expiresAt).getTime() : null;
  useEffect(() => {
    if (!inProgress || !expiryMs || !now) return;
    if (now >= expiryMs && !autoSubmittedRef.current) {
      autoSubmittedRef.current = true;
      handleSubmit(true);
    }
  }, [now, expiryMs, inProgress, handleSubmit]);

  // Warn before leaving mid-test.
  useEffect(() => {
    if (!inProgress) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [inProgress]);

  const saveAnswer = (questionId: string, patch: { selectedOptionId?: string; essayAnswer?: string }) => {
    fetch("/api/test/answer", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, ...patch }),
    }).catch((e) => console.error("Failed to save answer:", e));
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], questionId, selectedOptionId: optionId, essayAnswer: null, pointsAwarded: null, feedback: null } }));
    saveAnswer(questionId, { selectedOptionId: optionId });
  };
  const handleTextChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], questionId, essayAnswer: value, selectedOptionId: null, pointsAwarded: null, feedback: null } }));
  };
  const handleTextBlur = (questionId: string) => {
    saveAnswer(questionId, { essayAnswer: answers[questionId]?.essayAnswer ?? "" });
  };

  const handleStart = async () => {
    setStarting(true);
    setError("");
    try {
      const res = await fetch("/api/test", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error ?? "Gagal memulai tes");
        return;
      }
      load();
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <LoadingState rows={4} />;

  const header = <PageHeader title="Test" description="Tes seleksi PPDB" />;

  if (!hasRegistration) {
    return (
      <div>
        {header}
        <EmptyState icon={ClipboardList} title="Selesaikan Pendaftaran Terlebih Dahulu" description="Anda perlu menyelesaikan formulir pendaftaran sebelum dapat mengerjakan tes." action={{ label: "Ke Formulir Pendaftaran", onClick: () => router.push("/registration") }} />
      </div>
    );
  }

  // GRADED — show result.
  if (attempt?.status === "GRADED") {
    return (
      <div>
        {header}
        <Card className="mb-6">
          <CardContent className="p-6 flex items-center gap-4">
            <CheckCircle2 className="h-10 w-10 text-success shrink-0" />
            <div>
              <p className="text-headline-md text-foreground">Skor Anda: {Number(attempt.totalScore)} / {attempt.maxScore}</p>
              <p className="text-sm text-muted-foreground">Tes telah selesai dinilai.</p>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          {questions.map((q, i) => {
            const a = answers[q.id];
            return (
              <Card key={q.id}>
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm font-medium">{i + 1}. {q.question}</p>
                  {q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" ? (
                    <p className="text-sm text-muted-foreground">Jawaban Anda: {q.options.find((o) => o.id === a?.selectedOptionId)?.text ?? "-"}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Jawaban Anda: {a?.essayAnswer ?? "-"}</p>
                  )}
                  <p className="text-sm font-medium text-primary">Poin: {a?.pointsAwarded ?? 0} / {q.points}</p>
                  {a?.feedback && <p className="text-xs text-muted-foreground">Catatan penilai: {a.feedback}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // SUBMITTED — waiting for manual grading.
  if (attempt?.status === "SUBMITTED") {
    return (
      <div>
        {header}
        <EmptyState icon={Clock} title="Jawaban Sedang Dinilai" description="Jawaban Anda sudah terkirim dan sebagian sedang diperiksa panitia. Hasil akan muncul di sini setelah penilaian selesai." />
      </div>
    );
  }

  // No attempt yet — show start gate.
  if (!attempt) {
    let blocker: { title: string; desc: string } | null = null;
    if (!eligible) blocker = { title: "Belum Memenuhi Syarat", desc: "Selesaikan dan kirim formulir pendaftaran Anda terlebih dahulu sebelum mengikuti tes." };
    else if (notYetOpen) blocker = { title: "Tes Belum Dibuka", desc: `Tes akan dibuka pada ${meta?.opensAt ? new Date(meta.opensAt).toLocaleString("id-ID") : "jadwal yang ditentukan"}.` };
    else if (alreadyClosed) blocker = { title: "Tes Sudah Ditutup", desc: "Waktu pengerjaan tes untuk periode ini telah berakhir." };
    else if (!available || questions.length === 0) blocker = { title: "Tes Belum Tersedia", desc: "Panitia belum membuka tes untuk periode pendaftaran ini. Silakan cek kembali nanti." };

    if (blocker) {
      return (
        <div>
          {header}
          <EmptyState icon={AlertCircle} title={blocker.title} description={blocker.desc} />
        </div>
      );
    }

    return (
      <div>
        {header}
        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
        <Card>
          <CardHeader><CardTitle className="text-headline-md">{meta?.title ?? "Tes Masuk"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {meta?.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{meta.description}</p>}
            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
              <li>{questions.length} soal.</li>
              <li>{meta?.durationMinutes ? `Batas waktu ${meta.durationMinutes} menit — timer berjalan begitu Anda mulai.` : "Tanpa batas waktu."}</li>
              <li>Jawaban tersimpan otomatis, tetapi setelah dikirim tidak dapat diubah lagi.</li>
              {meta?.closesAt && <li>Tes ditutup pada {new Date(meta.closesAt).toLocaleString("id-ID")}.</li>}
            </ul>
            <Button onClick={handleStart} disabled={starting}>{starting ? "Memulai..." : "Mulai Tes"}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // IN_PROGRESS — the test itself.
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return a && (q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" ? !!a.selectedOptionId : !!a.essayAnswer?.trim());
  }).length;
  const remainingMs = expiryMs && now ? expiryMs - now : null;

  return (
    <div>
      <PageHeader title={meta?.title ?? "Test"} description="Jawab semua soal, lalu kirim jika sudah selesai" />

      <div className="sticky top-0 z-10 -mx-2 mb-4 flex items-center justify-between rounded-lg border border-border bg-white/90 px-4 py-3 backdrop-blur">
        <span className="text-sm font-medium">{answeredCount}/{questions.length} terjawab</span>
        {remainingMs !== null && (
          <span className={`flex items-center gap-2 text-sm font-semibold ${remainingMs < 60_000 ? "text-red-600" : "text-foreground"}`}>
            <Clock className="h-4 w-4" />
            {formatRemaining(remainingMs)}
          </span>
        )}
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

      <div className="space-y-4">
        {questions.map((q, i) => {
          const a = answers[q.id];
          return (
            <Card key={q.id}>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-medium">{i + 1}. {q.question} <span className="text-xs text-muted-foreground">({q.points} poin)</span></p>
                {q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" ? (
                  <div className="space-y-2">
                    {q.options.map((o) => (
                      <label key={o.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="radio" name={q.id} checked={a?.selectedOptionId === o.id} onChange={() => handleSelectOption(q.id, o.id)} className="h-4 w-4" />
                        {o.label}. {o.text}
                      </label>
                    ))}
                  </div>
                ) : q.type === "SHORT_ANSWER" ? (
                  <Input value={a?.essayAnswer ?? ""} onChange={(e) => handleTextChange(q.id, e.target.value)} onBlur={() => handleTextBlur(q.id)} placeholder="Jawaban singkat" />
                ) : (
                  <textarea className="flex min-h-[120px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm" value={a?.essayAnswer ?? ""} onChange={(e) => handleTextChange(q.id, e.target.value)} onBlur={() => handleTextBlur(q.id)} placeholder="Tulis jawaban Anda di sini..." />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <Button onClick={() => handleSubmit(false)} disabled={submitting}>{submitting ? "Mengirim..." : "Kirim Jawaban"}</Button>
      </div>
    </div>
  );
}
