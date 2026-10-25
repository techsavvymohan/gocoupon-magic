"use client";

import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, useDialogA11yIds } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getAdminAuthHeaders } from "@/context/AdminAuthContext";

const TEMPLATE_HEADERS = ["storeSlug", "title", "description", "type", "code", "expiryDate", "status", "source", "affiliateLink"];
const REQUIRED_FIELDS = ["storeSlug", "title"];

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" className="stroke-current opacity-25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" className="stroke-current" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeCsvValue(value) {
  return String(value || "").trim();
}

function buildDuplicateKey({ storeSlug, title, type, description, expiryDate, status, affiliateLink }) {
  return [
    String(storeSlug || "").toLowerCase(),
    String(type || "").toLowerCase(),
    String(title || "").trim().toLowerCase(),
    normalizeCsvValue(description).toLowerCase(),
    normalizeCsvValue(expiryDate).toLowerCase(),
    normalizeCsvValue(status).toLowerCase(),
    normalizeCsvValue(affiliateLink).toLowerCase(),
  ].join("::");
}

function normalizeType(value, code) {
  const normalized = normalizeCsvValue(value).toLowerCase();
  if (normalized === "deal") return "Deal";
  if (normalized === "coupon") return "Coupon";
  return code ? "Coupon" : "Deal";
}

function normalizeStatus(value) {
  const normalized = normalizeCsvValue(value).toLowerCase();
  if (normalized === "expired") return "Expired";
  if (normalized === "scheduled") return "Scheduled";
  if (normalized === "ending soon") return "Ending soon";
  return "Active";
}

function isValidDateString(value) {
  if (!value) return true;

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    const [month, day, year] = value.split("/").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function normalizeExpiryDate(value) {
  const normalized = normalizeCsvValue(value);
  if (!normalized) return "";

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(normalized)) {
    const [month, day, year] = normalized.split("/").map(Number);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return normalized;
}

function parseCsvFile(input) {
  return new Promise((resolve, reject) => {
    Papa.parse(input, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (error) => reject(error),
    });
  });
}

export default function BulkCouponImportDialog({ open, onOpenChange, stores = [], offers = [], onImported }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dryRunSummary, setDryRunSummary] = useState(null);
  const [finalSummary, setFinalSummary] = useState(null);
  const [validRows, setValidRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);
  const { titleId, descriptionId } = useDialogA11yIds();

  const storesBySlug = useMemo(() => new Map((stores || []).map((store) => [store.slug, store])), [stores]);
  const storesByNameMap = useMemo(
    () => new Map((stores || []).map((store) => [String(store.name || "").toLowerCase().trim(), store])),
    [stores]
  );
  const existingDuplicateKeys = useMemo(
    () =>
      new Set(
        (offers || []).map((offer) =>
          buildDuplicateKey({
            storeSlug: offer.storeSlug,
            title: offer.title,
            type: offer.type,
            description: offer.description,
            expiryDate: offer.expiryDate,
            status: offer.status,
            affiliateLink: offer.affiliateLink,
          })
        )
      ),
    [offers]
  );

  function resetState() {
    setSelectedFile(null);
    setSelectedFileContent("");
    setDryRunSummary(null);
    setFinalSummary(null);
    setValidRows([]);
    setErrors([]);
    setIsDragging(false);
  }

  function handleOpenChange(nextOpen) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      resetState();
    }
  }

  function downloadTemplate() {
    const csv = [
      TEMPLATE_HEADERS.join(","),
      "nike-store,Spring launch coupon,Use this on selected sneakers,Coupon,NIKE20,2026-04-30,Active,Manual,https://example.com/track/nike",
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gocoupon-bulk-coupons-template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function processAndValidateFile(file, contentOverride) {
    if (!file) return;

    setIsValidating(true);
    setDryRunSummary(null);
    setFinalSummary(null);
    setValidRows([]);
    setErrors([]);

    try {
      const csvSource = contentOverride || (await file.text());
      const results = await parseCsvFile(csvSource);
      const headers = Array.isArray(results.meta?.fields) ? results.meta.fields.map((field) => field.trim()) : [];
      const missingHeaders = REQUIRED_FIELDS.filter((header) => !headers.includes(header));

      if (missingHeaders.length) {
        const headerErrors = missingHeaders.map((header) => ({
          rowNumber: 1,
          reason: `Missing required CSV header: ${header}`,
        }));

        setErrors(headerErrors);
        setDryRunSummary({
          totalRecords: 0,
          validRows: 0,
          duplicates: 0,
          validationErrors: headerErrors.length,
        });
        toast.error("CSV template missing 'storeSlug' or 'title' header.");
        return;
      }

      const parsedRows = Array.isArray(results.data) ? results.data : [];
      const clientErrors = [];
      const nextValidRows = [];
      const csvDuplicateKeys = new Set();
      let duplicates = 0;
      let fallbackStoreSlug = stores && stores[0]?.slug ? stores[0].slug : "";

      parsedRows.forEach((row, index) => {
        const rowNumber = index + 2;
        const rawStoreSlug = normalizeCsvValue(row.storeSlug);
        let storeSlug = slugify(rawStoreSlug) || fallbackStoreSlug;
        const title = normalizeCsvValue(row.title);

        if (storeSlug) {
          fallbackStoreSlug = storeSlug;
        }

        if (!title) {
          clientErrors.push({ rowNumber, reason: "Offer title is required." });
          return;
        }

        // Smart Store Matching (By Slug, Name, or Fallback First Store)
        let store = storesBySlug.get(storeSlug) || storesByNameMap.get(String(rawStoreSlug || "").toLowerCase());
        if (!store && stores && stores.length > 0) {
          store = stores[0];
          storeSlug = store.slug;
        }

        if (!store) {
          clientErrors.push({ rowNumber, reason: `No managed store found for "${rawStoreSlug}".` });
          return;
        }

        let code = normalizeCsvValue(row.code);
        const type = normalizeType(row.type, code);

        // Smart Code Fallback for Coupons
        if (type === "Coupon" && !code) {
          code = `${storeSlug.toUpperCase()}SAVE`;
        }

        const description = normalizeCsvValue(row.description) || `${title} at ${store.name}.`;
        const expiryDate = normalizeExpiryDate(row.expiryDate);
        const status = normalizeStatus(row.status);
        const source = normalizeCsvValue(row.source) || "Manual";
        const affiliateLink = normalizeCsvValue(row.affiliateLink) || store.affiliateLink || "";

        if (!isValidDateString(expiryDate)) {
          clientErrors.push({ rowNumber, reason: "Expiry date must use YYYY-MM-DD or MM/DD/YYYY format." });
          return;
        }

        const duplicateKey = buildDuplicateKey({
          storeSlug,
          title,
          type,
          description,
          expiryDate,
          status,
          affiliateLink,
        });

        if (existingDuplicateKeys.has(duplicateKey)) {
          duplicates += 1;
          clientErrors.push({ rowNumber, reason: "This offer already exists in the catalog." });
          return;
        }

        if (csvDuplicateKeys.has(duplicateKey)) {
          duplicates += 1;
          clientErrors.push({ rowNumber, reason: "Duplicate offer content found in CSV." });
          return;
        }

        csvDuplicateKeys.add(duplicateKey);
        nextValidRows.push({
          storeSlug,
          title,
          description,
          type,
          code,
          expiryDate,
          status,
          source,
          affiliateLink,
        });
      });

      setValidRows(nextValidRows);
      setErrors(clientErrors);
      setDryRunSummary({
        totalRecords: parsedRows.length,
        validRows: nextValidRows.length,
        duplicates,
        validationErrors: clientErrors.length,
      });

      if (nextValidRows.length) {
        toast.success(`Validated ${nextValidRows.length} coupon/deal rows ready for import!`);
      } else {
        toast.error("No valid coupon rows found in CSV.");
      }
    } catch (error) {
      toast.error(error.message || "Unable to parse CSV file.");
    } finally {
      setIsValidating(false);
    }
  }

  async function selectFile(file) {
    if (!file) return;

    const isCsvFile = file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
    if (!isCsvFile) {
      toast.error("Only CSV files (.csv) are supported.");
      return;
    }

    try {
      const content = await file.text();
      setSelectedFile(file);
      setSelectedFileContent(content);
      await processAndValidateFile(file, content);
    } catch {
      toast.error("CSV file could not be read.");
    }
  }

  async function handleImport() {
    let rowsToImport = validRows;

    if (!rowsToImport.length && selectedFile) {
      await processAndValidateFile(selectedFile, selectedFileContent);
      rowsToImport = validRows;
    }

    if (!rowsToImport.length) {
      toast.error("Please attach a valid CSV file first.");
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch("/api/offers/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAdminAuthHeaders(),
        },
        body: JSON.stringify({ rows: rowsToImport }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to import coupons.");
      }

      setFinalSummary(payload.data);
      setErrors(payload.data.errors || []);

      if (payload.data.successfullyAdded > 0) {
        await onImported?.();
        toast.success(`🎉 ${payload.data.successfullyAdded} coupons/deals imported successfully!`);
      } else {
        toast.error("Import completed, but 0 new coupons were added.");
      }
    } catch (error) {
      toast.error(error.message || "Unable to import coupons.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        titleId={titleId}
        descriptionId={descriptionId}
        className="relative max-w-[1080px] max-h-[calc(100dvh-2.5rem)] flex flex-col rounded-[32px] border border-white/10 bg-zinc-950 p-0 text-white shadow-2xl overflow-hidden"
      >
        {/* Top Cancel/Close Button */}
        <button
          type="button"
          onClick={() => handleOpenChange(false)}
          className="absolute top-6 right-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-all shadow-md cursor-pointer"
          aria-label="Cancel and Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid gap-0 lg:grid-cols-[0.74fr_1.26fr] flex-1 overflow-y-auto">

          {/* Left Instructions Column */}
          <div className="border-b border-white/10 bg-zinc-900/60 p-6 lg:border-r lg:border-b-0 lg:p-8">
            <DialogHeader className="mb-6">
              <Badge className="w-fit border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">
                Bulk Import
              </Badge>
              <DialogTitle id={titleId} className="text-2xl font-black tracking-tight text-white mt-1">
                Bulk Import Coupons
              </DialogTitle>
              <DialogDescription id={descriptionId} className="text-xs text-white/50">
                Upload CSV, review dry run validation, and import offer batch.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="rounded-[22px] border border-white/10 bg-zinc-900/80 shadow-none">
                <CardContent className="p-4 space-y-2.5">
                  <div className="rounded-xl border border-white/8 bg-white/5 px-3.5 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Step 01</p>
                    <p className="mt-0.5 text-xs font-semibold text-white/80">Attach <code className="text-emerald-300">offers.csv</code></p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/5 px-3.5 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Step 02</p>
                    <p className="mt-0.5 text-xs font-semibold text-white/80">Review dry validation report</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/5 px-3.5 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Step 03</p>
                    <p className="mt-0.5 text-xs font-semibold text-white/80">Import approved coupon rows</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[22px] border border-white/10 bg-zinc-900/80 shadow-none">
                <CardContent className="space-y-3.5 p-4">
                  <div className="grid gap-2 text-xs">
                    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <span className="text-white/40 uppercase text-[10px] font-bold">Template</span>
                      <span className="font-semibold text-emerald-400">CSV Standard</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <span className="text-white/40 uppercase text-[10px] font-bold">Validation</span>
                      <span className="font-semibold text-white/80">Client + API</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <span className="text-white/40 uppercase text-[10px] font-bold">Affiliate</span>
                      <span className="font-semibold text-white/80">Store Fallback</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-xl border-white/15 bg-white/5 text-xs font-bold text-white hover:bg-white/10 hover:text-white transition-all py-2.5"
                    onClick={downloadTemplate}
                  >
                    📥 Download CSV Template
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Import & Actions Column */}
          <div className="grid gap-5 p-6 lg:p-8 bg-zinc-950">

            <div className="rounded-[24px] border border-white/10 bg-zinc-900/50 p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-white">Import Assets</p>
                  <p className="text-xs text-white/40">Select or drop Coupons CSV file below</p>
                </div>
                {selectedFile ? (
                  <Badge className="border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                    ✓ CSV Selected ({validRows.length} Coupons Ready)
                  </Badge>
                ) : null}
              </div>

              {/* CSV Input Hidden */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  void selectFile(event.target.files?.[0]);
                }}
              />

              {/* CSV Dropzone */}
              <div
                className={cn(
                  "rounded-[20px] border-2 border-dashed p-6 transition-all cursor-pointer",
                  isDragging
                    ? "border-emerald-500 bg-emerald-500/10"
                    : selectedFile
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/8"
                )}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragging(false);
                  void selectFile(event.dataTransfer.files?.[0]);
                }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 text-lg">
                      🎟️
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Coupons CSV File</p>
                      <p className="text-xs text-white/45">
                        {selectedFile ? selectedFile.name : "Drop file here or click to browse manually"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="min-w-[130px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Select CSV
                  </Button>
                </div>
              </div>

              {/* Active Action Buttons */}
              <div className="pt-2 grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl border-white/15 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-3"
                  disabled={!selectedFile || isValidating || isUploading}
                  onClick={() => processAndValidateFile(selectedFile, selectedFileContent)}
                >
                  {isValidating ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner />
                      Validating...
                    </span>
                  ) : (
                    "🔍 Run Dry Validation"
                  )}
                </Button>

                <Button
                  type="button"
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 shadow-lg shadow-emerald-600/30"
                  disabled={!selectedFile || isUploading || isValidating}
                  onClick={handleImport}
                >
                  {isUploading ? (
                    <span className="inline-flex items-center gap-2">
                      <Spinner />
                      Importing Coupons...
                    </span>
                  ) : (
                    "🚀 Import Coupons Now"
                  )}
                </Button>
              </div>

              {/* Bottom Cancel Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
                >
                  Cancel & Exit
                </button>
              </div>
            </div>

            {/* Results / Validation Summary Card */}
            {(dryRunSummary || finalSummary) ? (
              <Card className="rounded-[24px] border border-white/10 bg-zinc-900/80 shadow-none">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-white">
                      {finalSummary ? "Import Result Summary" : "Dry Run Summary"}
                    </p>
                    <Badge className={finalSummary ? "bg-emerald-500 text-black font-bold" : "bg-white/10 text-white"}>
                      {finalSummary ? "Done" : "Validated"}
                    </Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-xs">
                    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                      <p className="text-[10px] uppercase font-bold text-white/40">Total Records</p>
                      <p className="mt-1 text-lg font-black text-white">{(finalSummary || dryRunSummary).totalRecords}</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                      <p className="text-[10px] uppercase font-bold text-emerald-400">
                        {finalSummary ? "Imported" : "Valid Rows"}
                      </p>
                      <p className="mt-1 text-lg font-black text-emerald-400">
                        {finalSummary ? finalSummary.successfullyAdded : dryRunSummary.validRows}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                      <p className="text-[10px] uppercase font-bold text-amber-400">Duplicates</p>
                      <p className="mt-1 text-lg font-black text-amber-400">
                        {finalSummary ? finalSummary.skippedDuplicates : dryRunSummary.duplicates}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                      <p className="text-[10px] uppercase font-bold text-rose-400">Errors</p>
                      <p className="mt-1 text-lg font-black text-rose-400">
                        {finalSummary ? finalSummary.failed : dryRunSummary.validationErrors}
                      </p>
                    </div>
                  </div>

                  {errors.length > 0 && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                      <p className="text-xs font-bold text-rose-400">Errors ({errors.length})</p>
                      <div className="mt-2 max-h-32 overflow-y-auto space-y-1 text-xs text-rose-300">
                        {errors.map((err, i) => (
                          <p key={i}>Row {err.rowNumber}: {err.reason}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {finalSummary ? (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                        onClick={async () => {
                          await onImported?.();
                          handleOpenChange(false);
                        }}
                      >
                        Done & Refresh Catalog
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
