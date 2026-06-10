"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { importProducts } from "../api/admin";
import type { ImportResult, ImportResultRow } from "../types/admin";

export type ImportMode = "file" | "text" | "table";
type ResultFilter = "all" | "success" | "skipped" | "error";
type LegacyMode = "file" | "paste";

export const CSV_HEADERS = ["name","description","brand","category","price","weight_grams","purity","stock_quantity","sku","image_url"] as const;
export const REQUIRED_TABLE_HEADERS = ["name","description","price","sku","brand","category","image_url"];
export const FULL_TABLE_HEADERS = [...CSV_HEADERS];

const PERSIAN_SAMPLE_DATA = [
  { name:"پاشنه‌پوش اکوسن", description:"پاشنه‌پوش طبی با فنر جاذب ضربه", brand:"اکوسن", category:"کفی‌پاشنه", price:"485000", weight_grams:"120", purity:"", stock_quantity:"50", sku:"ECO-HEEL-001", image_url:"" },
  { name:"زانوبند چهارفنره", description:"زانوبند طبی بازو تقویت زانو", brand:"اورتو+", category:"زانوبند", price:"1280000", weight_grams:"200", purity:"", stock_quantity:"30", sku:"ORTU-KNEE-002", image_url:"" },
];

const makeEmptyRow = (n: number): string[] => Array.from({ length: n }, () => "");
const escapeCsvCell = (v: string): string => `"${v.replaceAll('"', '""')}"`;

const buildSampleCsv = () => {
  const rows = PERSIAN_SAMPLE_DATA.map((item) =>
    CSV_HEADERS.map((h) => escapeCsvCell(String(item[h as keyof typeof item] ?? ""))).join(","),
  );
  return `${CSV_HEADERS.join(",")}\n${rows.join("\n")}\n`;
};

const downloadCsv = (fileName: string, content: string) => {
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName; a.click();
  URL.revokeObjectURL(url);
};

export function useProductImport() {
  const [importMode, setImportMode] = useState<ImportMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState("");
  const [customFileName, setCustomFileName] = useState("products-import.csv");
  const [tableHeaders, setTableHeaders] = useState<string[]>([...REQUIRED_TABLE_HEADERS]);
  const [tableRows, setTableRows] = useState<string[][]>([makeEmptyRow(REQUIRED_TABLE_HEADERS.length)]);
  const [showOptionalCols, setShowOptionalCols] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [resultFilter, setResultFilter] = useState<ResultFilter>("all");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const filledRowCount = useMemo(() => tableRows.filter((r) => r.some((c) => c.trim().length > 0)).length, [tableRows]);
  const filteredResults = useMemo(() => {
    if (!importResult) return [];
    if (resultFilter === "all") return importResult.results;
    return importResult.results.filter((r) => r.status === resultFilter);
  }, [importResult, resultFilter]);

  const switchMode = useCallback((m: ImportMode) => { setImportMode(m); setError(null); }, []);
  const setMode = useCallback((m: LegacyMode) => { setImportMode(m === "paste" ? "text" : "file"); setError(null); }, []);
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => { setFile(e.target.files?.[0] ?? null); setError(null); }, []);
  const copySampleToTextarea = useCallback(() => { setCsvText(buildSampleCsv()); setError(null); }, []);

  const addRow = useCallback(() => setTableRows((prev) => [...prev, makeEmptyRow(tableHeaders.length)]), [tableHeaders.length]);
  const removeRow = useCallback((i: number) => setTableRows((prev) => { const next = prev.filter((_, idx) => idx !== i); return next.length > 0 ? next : [makeEmptyRow(prev[0]?.length ?? 1)]; }), []);
  const updateCell = useCallback((row: number, col: number, value: string) => setTableRows((prev) => prev.map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? value : c) : r)), []);
  const removeColumn = useCallback((i: number) => setTableHeaders((prevH) => { if (prevH.length <= 1) return prevH; const next = prevH.filter((_, idx) => idx !== i); setTableRows((prevR) => prevR.map((r) => r.filter((_, idx) => idx !== i))); return next; }), []);
  const clearTable = useCallback(() => { setTableRows([makeEmptyRow(tableHeaders.length)]); setError(null); }, [tableHeaders.length]);
  const loadSampleRows = useCallback(() => { setShowOptionalCols(true); setTableHeaders([...FULL_TABLE_HEADERS]); setTableRows(PERSIAN_SAMPLE_DATA.map((item) => FULL_TABLE_HEADERS.map((h) => String(item[h as keyof typeof item] ?? "")))); setError(null); }, []);

  const toggleOptionalCols = useCallback(() => setShowOptionalCols((prev) => {
    const next = !prev;
    const nextHeaders = next ? FULL_TABLE_HEADERS : REQUIRED_TABLE_HEADERS;
    setTableHeaders([...nextHeaders]);
    setTableRows((prevR) => prevR.map((row) => nextHeaders.length <= row.length ? row.slice(0, nextHeaders.length) : [...row, ...makeEmptyRow(nextHeaders.length - row.length)]));
    return next;
  }), []);

  const buildCsvFromTable = useCallback(() => {
    const nonEmpty = tableRows.filter((r) => r.some((c) => c.trim().length > 0));
    return `${tableHeaders.join(",")}\n${nonEmpty.map((r) => r.map(escapeCsvCell).join(",")).join("\n")}`;
  }, [tableHeaders, tableRows]);

  const isImportDisabled = useMemo(() => {
    if (loading) return true;
    if (importMode === "file") return !file;
    if (importMode === "text") return csvText.trim().length === 0;
    return filledRowCount === 0;
  }, [csvText, file, filledRowCount, importMode, loading]);

  const handleImport = useCallback(async () => {
    if (loading) return;
    setError(null); setLoading(true);
    try {
      let csvContent = "";
      if (importMode === "file") { if (!file) { setError("لطفاً فایل CSV را انتخاب کنید."); return; } csvContent = await file.text(); }
      else if (importMode === "text") { csvContent = csvText; }
      else { csvContent = buildCsvFromTable(); }
      if (!csvContent.trim()) { setError("داده‌ای برای وارد کردن وجود ندارد."); return; }
      setImportResult(await importProducts(csvContent, skipDuplicates));
      setResultFilter("all");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در وارد کردن محصولات");
    } finally { setLoading(false); }
  }, [buildCsvFromTable, csvText, file, importMode, loading, skipDuplicates]);

  const downloadTemplate = useCallback(() => downloadCsv("products-template.csv", `${CSV_HEADERS.join(",")}\n`), []);
  const downloadSample = useCallback(() => downloadCsv(customFileName || "products-sample.csv", buildSampleCsv()), [customFileName]);

  return {
    importMode, switchMode, file, setFile, fileInputRef, handleFileChange,
    csvText, setCsvText, customFileName, setCustomFileName, textAreaRef, copySampleToTextarea,
    tableHeaders, tableRows, showOptionalCols, filledRowCount, addRow, removeRow, updateCell, removeColumn, toggleOptionalCols, clearTable, loadSampleRows,
    skipDuplicates, setSkipDuplicates, error, loading, isImportDisabled, handleImport,
    importResult, resultFilter, setResultFilter, filteredResults,
    downloadTemplate, downloadSample,
    mode: importMode === "text" ? "paste" : "file" as LegacyMode,
    setMode, pasteText: csvText, setPasteText: setCsvText,
    result: importResult, canSubmit: !isImportDisabled, submit: handleImport,
  };
}
