"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/data/empty-state";
import { Trash2, Plus, ListChecks, ClipboardCheck, Settings2, Upload, Eye, Pencil, ArrowUp, ArrowDown, X } from "lucide-react";

type QType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";

interface TestOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}
interface TestQuestion {
  id: string;
  type: QType;
  question: string;
  points: number;
  order: number;
  essayAnswerKey: string | null;
  acceptedAnswers: string[] | null;
  options: TestOption[];
  answers?: unknown[];
}
interface TestConfig {
  id: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  durationMinutes: number | null;
  opensAt: string | null;
  closesAt: string | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  selectionWeight: string;
}
interface EssayAnswerToGrade {
  answerId: string;
  question: string;
  answerKey: string | null;
  maxPoints: number;
  essayAnswer: string | null;
  pointsAwarded: number | null;
  feedback: string | null;
}
interface GradingAttempt {
  attemptId: string;
  applicantName: string;
  registrationNumber: string | null;
  submittedAt: string;
  essayAnswers: EssayAnswerToGrade[];
}
interface CopySource {
  id: string;
  periodName: string;
  questionCount: number;
}

const TYPE_LABELS: Record<QType, string> = {
  MULTIPLE_CHOICE: "Pilihan Ganda",
  TRUE_FALSE: "Benar / Salah",
  SHORT_ANSWER: "Isian Singkat",
  ESSAY: "Esai / Tertulis",
};

const emptyForm = {
  id: null as string | null,
  type: "MULTIPLE_CHOICE" as QType,
  question: "",
  points: "10",
  options: [
    { label: "A", text: "", isCorrect: true },
    { label: "B", text: "", isCorrect: false },
    { label: "C", text: "", isCorrect: false },
    { label: "D", text: "", isCorrect: false },
  ],
  correctBool: true,
  acceptedAnswers: "",
  essayAnswerKey: "",
};

export default function AdminTestPage() {
  const [loading, setLoading] = useState(true);
  const [activePeriodName, setActivePeriodName] = useState<string | null>(null);
  const [config, setConfig] = useState<TestConfig | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);

  const [form, setForm] = useState(emptyForm);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [formError, setFormError] = useState("");

  const [savingConfig, setSavingConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<string>("");
  const [copySources, setCopySources] = useState<CopySource[]>([]);
  const [copyFrom, setCopyFrom] = useState("");

  const [grading, setGrading] = useState<GradingAttempt[]>([]);
  const [gradeInputs, setGradeInputs] = useState<Record<string, { points: string; feedback: string }>>({});
  const [savingAttempt, setSavingAttempt] = useState<string | null>(null);

  const loadTest = () => {
    fetch("/api/admin/test")
      .then((r) => r.json())
      .then((d) => {
        setActivePeriodName(d.activePeriod?.name ?? null);
        setConfig(d.test ?? null);
        setQuestions(d.questions ?? []);
        setAttemptCount(d.attemptCount ?? 0);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };
  const loadGrading = () => {
    fetch("/api/admin/test/grading")
      .then((r) => r.json())
      .then((d: GradingAttempt[]) => {
        setGrading(Array.isArray(d) ? d : []);
        const inputs: Record<string, { points: string; feedback: string }> = {};
        (Array.isArray(d) ? d : []).forEach((att) =>
          att.essayAnswers.forEach((ans) => {
            inputs[ans.answerId] = { points: ans.pointsAwarded != null ? String(ans.pointsAwarded) : "", feedback: ans.feedback ?? "" };
          })
        );
        setGradeInputs(inputs);
      })
      .catch((e) => console.error(e));
  };
  const loadCopySources = () => {
    fetch("/api/admin/test/copy-from")
      .then((r) => r.json())
      .then((d) => setCopySources(Array.isArray(d) ? d : []))
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    loadTest();
    loadGrading();
    loadCopySources();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setFormError("");
  };

  const startEdit = (q: TestQuestion) => {
    setFormError("");
    setForm({
      id: q.id,
      type: q.type,
      question: q.question,
      points: String(q.points),
      options:
        q.type === "MULTIPLE_CHOICE" && q.options.length
          ? q.options.map((o) => ({ label: o.label, text: o.text, isCorrect: o.isCorrect }))
          : emptyForm.options,
      correctBool: q.type === "TRUE_FALSE" ? q.options.find((o) => o.isCorrect)?.label === "B" : true,
      acceptedAnswers: q.type === "SHORT_ANSWER" && Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.join("\n") : "",
      essayAnswerKey: q.essayAnswerKey ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildPayload = () => {
    const base: Record<string, unknown> = { type: form.type, question: form.question, points: Number(form.points) || 1 };
    if (form.type === "MULTIPLE_CHOICE") base.options = form.options.filter((o) => o.text.trim());
    else if (form.type === "TRUE_FALSE") base.correctBool = form.correctBool;
    else if (form.type === "SHORT_ANSWER") base.acceptedAnswers = form.acceptedAnswers.split("\n").map((s) => s.trim()).filter(Boolean);
    else if (form.type === "ESSAY") base.essayAnswerKey = form.essayAnswerKey;
    return base;
  };

  const handleSaveQuestion = async () => {
    setFormError("");
    if (!form.question.trim()) return setFormError("Teks soal wajib diisi");
    setSavingQuestion(true);
    try {
      const editing = !!form.id;
      const res = await fetch(editing ? `/api/admin/test/questions/${form.id}` : "/api/admin/test/questions", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const body = await res.json();
      if (!res.ok) return setFormError(body?.error ?? "Gagal menyimpan soal");
      resetForm();
      loadTest();
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus soal ini?")) return;
    const res = await fetch(`/api/admin/test/questions/${id}`, { method: "DELETE" });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return alert(body?.error ?? "Gagal menghapus soal");
    loadTest();
  };

  const handleMove = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= questions.length) return;
    const reordered = [...questions];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setQuestions(reordered);
    await fetch("/api/admin/test/questions/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((q) => q.id) }),
    });
  };

  const patchConfig = async (patch: Record<string, unknown>, showSaved = false) => {
    setSavingConfig(true);
    setConfigSaved(false);
    try {
      const res = await fetch("/api/admin/test", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = await res.json();
      if (!res.ok) {
        alert(body?.error ?? "Gagal menyimpan pengaturan");
        loadTest(); // revert optimistic toggles
        return false;
      }
      setConfig(body);
      if (showSaved) setConfigSaved(true);
      return true;
    } finally {
      setSavingConfig(false);
    }
  };

  const handleImport = async () => {
    setImportResult("");
    const res = await fetch("/api/admin/test/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tsv: importText }),
    });
    const body = await res.json();
    if (!res.ok) {
      setImportResult((body?.error ?? "Gagal mengimpor") + (body?.errors?.length ? "\n" + body.errors.join("\n") : ""));
      return;
    }
    setImportResult(`Berhasil impor ${body.imported} soal.` + (body.skipped?.length ? `\nDilewati:\n${body.skipped.join("\n")}` : ""));
    setImportText("");
    loadTest();
  };

  const handleCopy = async () => {
    if (!copyFrom) return;
    const res = await fetch("/api/admin/test/copy-from", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromTestId: copyFrom }),
    });
    const body = await res.json();
    if (!res.ok) return alert(body?.error ?? "Gagal menyalin");
    alert(`Berhasil menyalin ${body.copied} soal.`);
    setCopyFrom("");
    loadTest();
  };

  const handleSaveGrades = async (attempt: GradingAttempt) => {
    setSavingAttempt(attempt.attemptId);
    try {
      const grades = attempt.essayAnswers.map((ans) => ({
        answerId: ans.answerId,
        points: Number(gradeInputs[ans.answerId]?.points ?? 0),
        feedback: gradeInputs[ans.answerId]?.feedback || undefined,
      }));
      const res = await fetch(`/api/admin/test/grading/${attempt.attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades }),
      });
      const body = await res.json();
      if (!res.ok) return alert(body?.error ?? "Gagal menyimpan penilaian");
      loadGrading();
      loadTest();
    } finally {
      setSavingAttempt(null);
    }
  };

  if (loading) return <LoadingState rows={4} />;

  const published = config?.isPublished ?? false;
  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  return (
    <div>
      <PageHeader
        title="Test"
        description={activePeriodName ? `Kelola tes untuk periode ${activePeriodName}` : "Belum ada periode pendaftaran yang aktif"}
        actions={
          config ? (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${published ? "text-success" : "text-muted-foreground"}`}>{published ? "Terbit" : "Draft"}</span>
              <Switch checked={published} onCheckedChange={(v) => patchConfig({ isPublished: v })} disabled={savingConfig} />
            </div>
          ) : undefined
        }
      />

      {!config ? (
        <EmptyState icon={Settings2} title="Belum Ada Periode Aktif" description="Aktifkan sebuah periode pendaftaran di menu Periode & Kuota untuk mulai menyiapkan tes." />
      ) : (
        <Tabs defaultValue="questions">
          <TabsList className="mb-6 flex-wrap">
            <TabsTrigger value="questions"><ListChecks className="mr-2 h-4 w-4 inline" />Soal ({questions.length})</TabsTrigger>
            <TabsTrigger value="settings"><Settings2 className="mr-2 h-4 w-4 inline" />Pengaturan</TabsTrigger>
            <TabsTrigger value="import"><Upload className="mr-2 h-4 w-4 inline" />Impor & Salin</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4 inline" />Preview</TabsTrigger>
            <TabsTrigger value="grading"><ClipboardCheck className="mr-2 h-4 w-4 inline" />Penilaian Esai ({grading.length})</TabsTrigger>
          </TabsList>

          {/* ---------- QUESTIONS ---------- */}
          <TabsContent value="questions">
            {published && (
              <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Tes sudah <strong>Terbit</strong> — pendaftar bisa mengerjakannya sekarang. Ubah ke Draft dulu (toggle di kanan atas) bila ingin menyusun soal tanpa terlihat pendaftar.
              </div>
            )}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-headline-md">{form.id ? "Edit Soal" : "Tambah Soal"}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {formError && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{formError}</div>}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipe Soal</label>
                    <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as QType }))} disabled={!!form.id}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(TYPE_LABELS) as QType[]).map((t) => (
                          <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.id && <p className="text-xs text-muted-foreground">Tipe soal tidak dapat diubah saat edit.</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pertanyaan</label>
                    <textarea className="flex min-h-[80px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm" value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Poin</label>
                    <Input type="number" className="max-w-[120px]" value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))} />
                  </div>

                  {form.type === "MULTIPLE_CHOICE" && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Opsi (pilih radio untuk kunci jawaban)</label>
                      {form.options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="radio" name="mc-correct" checked={opt.isCorrect} onChange={() => setForm((f) => ({ ...f, options: f.options.map((o, oi) => ({ ...o, isCorrect: oi === i })) }))} className="h-4 w-4" />
                          <span className="w-5 text-sm font-medium">{opt.label}</span>
                          <Input value={opt.text} onChange={(e) => setForm((f) => ({ ...f, options: f.options.map((o, oi) => (oi === i ? { ...o, text: e.target.value } : o)) }))} placeholder={`Opsi ${opt.label}`} />
                          {form.options.length > 2 && (
                            <button onClick={() => setForm((f) => ({ ...f, options: f.options.filter((_, oi) => oi !== i).map((o, oi) => ({ ...o, label: String.fromCharCode(65 + oi) })) }))} className="text-muted-foreground hover:text-red-600"><X className="h-4 w-4" /></button>
                          )}
                        </div>
                      ))}
                      {form.options.length < 5 && (
                        <Button variant="outline" size="sm" onClick={() => setForm((f) => ({ ...f, options: [...f.options, { label: String.fromCharCode(65 + f.options.length), text: "", isCorrect: false }] }))}>
                          <Plus className="mr-2 h-4 w-4" />Tambah Opsi
                        </Button>
                      )}
                    </div>
                  )}

                  {form.type === "TRUE_FALSE" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Kunci Jawaban</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm"><input type="radio" name="tf" checked={form.correctBool} onChange={() => setForm((f) => ({ ...f, correctBool: true }))} />Benar</label>
                        <label className="flex items-center gap-2 text-sm"><input type="radio" name="tf" checked={!form.correctBool} onChange={() => setForm((f) => ({ ...f, correctBool: false }))} />Salah</label>
                      </div>
                    </div>
                  )}

                  {form.type === "SHORT_ANSWER" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jawaban yang Diterima (satu per baris)</label>
                      <textarea className="flex min-h-[80px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm" value={form.acceptedAnswers} onChange={(e) => setForm((f) => ({ ...f, acceptedAnswers: e.target.value }))} placeholder={"Jakarta\nDKI Jakarta"} />
                      <p className="text-xs text-muted-foreground">Jawaban pendaftar dicocokkan tanpa memperhatikan huruf besar/kecil & spasi berlebih.</p>
                    </div>
                  )}

                  {form.type === "ESSAY" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Kunci Jawaban / Rubrik</label>
                      <textarea className="flex min-h-[100px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm" value={form.essayAnswerKey} onChange={(e) => setForm((f) => ({ ...f, essayAnswerKey: e.target.value }))} placeholder="Acuan penilai saat memeriksa jawaban" />
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button onClick={handleSaveQuestion} disabled={savingQuestion}>{savingQuestion ? "Menyimpan..." : form.id ? "Simpan Perubahan" : "Tambah Soal"}</Button>
                    {form.id && <Button variant="outline" onClick={resetForm}>Batal</Button>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-headline-md">Daftar Soal · {totalPoints} poin</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {questions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada soal.</p>
                  ) : (
                    questions.map((q, i) => (
                      <div key={q.id} className="rounded-md border border-border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-medium text-primary">{TYPE_LABELS[q.type]} · {q.points} poin</span>
                            <p className="text-sm font-medium">{i + 1}. {q.question}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => handleMove(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                            <button onClick={() => handleMove(i, 1)} disabled={i === questions.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                            <button onClick={() => startEdit(q)} className="text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(q.id)} className="text-muted-foreground hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                        {q.type === "MULTIPLE_CHOICE" && (
                          <ul className="mt-2 space-y-0.5">
                            {q.options.map((o) => (
                              <li key={o.id} className={`text-xs ${o.isCorrect ? "text-success font-medium" : "text-muted-foreground"}`}>{o.label}. {o.text} {o.isCorrect && "✓"}</li>
                            ))}
                          </ul>
                        )}
                        {q.type === "TRUE_FALSE" && <p className="mt-1 text-xs text-success">Kunci: {q.options.find((o) => o.isCorrect)?.text}</p>}
                        {q.type === "SHORT_ANSWER" && <p className="mt-1 text-xs text-muted-foreground">Jawaban: {(q.acceptedAnswers ?? []).join(", ")}</p>}
                        {q.type === "ESSAY" && <p className="mt-1 text-xs text-muted-foreground">Kunci: {q.essayAnswerKey}</p>}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ---------- SETTINGS ---------- */}
          <TabsContent value="settings">
            <Card className="max-w-2xl">
              <CardHeader><CardTitle className="text-headline-md">Pengaturan Tes</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Judul Tes</label>
                  <Input value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deskripsi / Instruksi (opsional)</label>
                  <textarea className="flex min-h-[80px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm" value={config.description ?? ""} onChange={(e) => setConfig({ ...config, description: e.target.value })} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Batas Waktu (menit)</label>
                    <Input type="number" placeholder="Kosong = tanpa batas" value={config.durationMinutes ?? ""} onChange={(e) => setConfig({ ...config, durationMinutes: e.target.value ? Number(e.target.value) : null })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bobot ke Skor Seleksi</label>
                    <Input type="number" step="0.1" value={config.selectionWeight} onChange={(e) => setConfig({ ...config, selectionWeight: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Waktu Buka (opsional)</label>
                    <Input type="datetime-local" value={config.opensAt ? config.opensAt.slice(0, 16) : ""} onChange={(e) => setConfig({ ...config, opensAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Waktu Tutup (opsional)</label>
                    <Input type="datetime-local" value={config.closesAt ? config.closesAt.slice(0, 16) : ""} onChange={(e) => setConfig({ ...config, closesAt: e.target.value ? new Date(e.target.value).toISOString() : null })} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Acak urutan soal</p>
                    <p className="text-xs text-muted-foreground">Tiap pendaftar dapat urutan soal berbeda.</p>
                  </div>
                  <Switch checked={config.shuffleQuestions} onCheckedChange={(v) => setConfig({ ...config, shuffleQuestions: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Acak urutan opsi jawaban</p>
                    <p className="text-xs text-muted-foreground">Berlaku untuk soal pilihan ganda &amp; benar/salah.</p>
                  </div>
                  <Switch checked={config.shuffleOptions} onCheckedChange={(v) => setConfig({ ...config, shuffleOptions: v })} />
                </div>
                <div className="pt-2 flex items-center gap-3">
                  <Button
                    disabled={savingConfig}
                    onClick={() =>
                      patchConfig(
                        {
                          title: config.title,
                          description: config.description,
                          durationMinutes: config.durationMinutes,
                          selectionWeight: Number(config.selectionWeight),
                          opensAt: config.opensAt,
                          closesAt: config.closesAt,
                          shuffleQuestions: config.shuffleQuestions,
                          shuffleOptions: config.shuffleOptions,
                        },
                        true
                      )
                    }
                  >
                    {savingConfig ? "Menyimpan..." : "Simpan Pengaturan"}
                  </Button>
                  {configSaved && <span className="text-sm text-success">Tersimpan</span>}
                </div>
                {attemptCount > 0 && (
                  <p className="text-xs text-amber-700">{attemptCount} pendaftar sudah memulai tes. Perubahan batas waktu/pengacakan hanya berlaku bagi yang belum memulai.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- IMPORT & COPY ---------- */}
          <TabsContent value="import">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-headline-md">Impor Pilihan Ganda</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Tempel dari spreadsheet. Satu soal per baris, kolom dipisah TAB atau <code>|</code>:</p>
                  <pre className="rounded-md bg-surface-container p-2 text-xs overflow-x-auto">Pertanyaan | Opsi A | Opsi B | Opsi C | Opsi D | KunciHuruf | Poin</pre>
                  <textarea className="flex min-h-[160px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm font-mono" value={importText} onChange={(e) => setImportText(e.target.value)} placeholder={"Ibu kota Indonesia?|Jakarta|Bandung|Surabaya|Medan|A|10"} />
                  <Button onClick={handleImport} disabled={!importText.trim()}>Impor Soal</Button>
                  {importResult && <pre className="whitespace-pre-wrap rounded-md bg-surface-container p-2 text-xs">{importResult}</pre>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-headline-md">Salin dari Periode Lain</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {copySources.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada periode lain yang punya soal untuk disalin.</p>
                  ) : (
                    <>
                      <Select value={copyFrom} onValueChange={setCopyFrom}>
                        <SelectTrigger><SelectValue placeholder="Pilih periode sumber" /></SelectTrigger>
                        <SelectContent>
                          {copySources.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.periodName} ({s.questionCount} soal)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleCopy} disabled={!copyFrom}>Salin Soal ke Tes Ini</Button>
                      <p className="text-xs text-muted-foreground">Soal disalin (ditambahkan) ke tes periode aktif; sumber tidak berubah.</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ---------- PREVIEW ---------- */}
          <TabsContent value="preview">
            <Card>
              <CardHeader><CardTitle className="text-headline-md">{config.title} — Tampilan Pendaftar</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {questions.length} soal · {totalPoints} poin{config.durationMinutes ? ` · ${config.durationMinutes} menit` : " · tanpa batas waktu"}. Ini tampilan yang dilihat pendaftar (kunci jawaban disembunyikan).
                </p>
                {questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada soal.</p>
                ) : (
                  questions.map((q, i) => (
                    <div key={q.id} className="rounded-md border border-border p-4 space-y-2">
                      <p className="text-sm font-medium">{i + 1}. {q.question} <span className="text-xs text-muted-foreground">({q.points} poin)</span></p>
                      {(q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE") && (
                        <div className="space-y-1">
                          {q.options.map((o) => (
                            <label key={o.id} className="flex items-center gap-2 text-sm text-muted-foreground"><input type="radio" disabled className="h-4 w-4" />{o.label}. {o.text}</label>
                          ))}
                        </div>
                      )}
                      {q.type === "SHORT_ANSWER" && <Input disabled placeholder="Jawaban singkat pendaftar" />}
                      {q.type === "ESSAY" && <textarea disabled className="flex min-h-[80px] w-full rounded-md border border-border bg-surface-container px-3 py-2 text-sm" placeholder="Jawaban esai pendaftar" />}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------- GRADING ---------- */}
          <TabsContent value="grading">
            {grading.length === 0 ? (
              <EmptyState icon={ClipboardCheck} title="Tidak Ada yang Perlu Dinilai" description="Semua jawaban esai yang masuk sudah dinilai." />
            ) : (
              <div className="space-y-4">
                {grading.map((attempt) => (
                  <Card key={attempt.attemptId}>
                    <CardHeader>
                      <CardTitle className="text-headline-md">{attempt.applicantName} <span className="text-sm font-normal text-muted-foreground">({attempt.registrationNumber ?? "-"})</span></CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {attempt.essayAnswers.map((ans) => (
                        <div key={ans.answerId} className="rounded-md border border-border p-4 space-y-2">
                          <p className="text-sm font-medium">{ans.question} <span className="text-muted-foreground">(maks {ans.maxPoints} poin)</span></p>
                          <p className="text-xs text-muted-foreground">Kunci: {ans.answerKey}</p>
                          <div className="rounded-md bg-surface-container p-3 text-sm">{ans.essayAnswer || <em className="text-muted-foreground">Tidak dijawab</em>}</div>
                          <div className="flex gap-3 items-end">
                            <div className="space-y-1">
                              <label className="text-xs font-medium">Poin</label>
                              <Input type="number" className="w-24" value={gradeInputs[ans.answerId]?.points ?? ""} onChange={(e) => setGradeInputs((p) => ({ ...p, [ans.answerId]: { points: e.target.value, feedback: p[ans.answerId]?.feedback ?? "" } }))} />
                            </div>
                            <div className="flex-1 space-y-1">
                              <label className="text-xs font-medium">Catatan (opsional)</label>
                              <Input value={gradeInputs[ans.answerId]?.feedback ?? ""} onChange={(e) => setGradeInputs((p) => ({ ...p, [ans.answerId]: { feedback: e.target.value, points: p[ans.answerId]?.points ?? "" } }))} />
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button onClick={() => handleSaveGrades(attempt)} disabled={savingAttempt === attempt.attemptId}>{savingAttempt === attempt.attemptId ? "Menyimpan..." : "Simpan Penilaian"}</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
