"use client";

import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, useDialogA11yIds } from "@/components/ui/dialog";
import { DEFAULT_COUNTRY_CODE, normalizeCountryCode } from "@/lib/countries";
import { cn } from "@/lib/utils";
import { getAdminAuthHeaders } from "@/context/AdminAuthContext";

const TEMPLATE_HEADERS = [
  "name",
  "slug",
  "category",
  "countryCode",
  "description",
  "trustStatus",
  "affiliateLink",
  "logoText",
  "logoFile",
  "contentIntroTitle",
  "contentIntroParagraph1",
  "contentIntroParagraph2",
  "contentWhyItemsText",
  "contentOutro",
  "faq1Question",
  "faq1Answer",
  "faq2Question",
  "faq2Answer",
  "faq3Question",
  "faq3Answer",
];
const TRUST_STATUSES = new Set(["Verified", "Trusted", "Pending", "Active"]);
const REQUIRED_HEADERS = ["name"];

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

function normalizeValue(value) {
  return String(value || "").trim();
}

function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results),
      error: (error) => reject(error),
    });
  });
}

export default function BulkStoreImportDialog({ open, onOpenChange, stores = [], categories = [], countries = [], onImported }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [selectedZipFile, setSelectedZipFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingZip, setIsDraggingZip] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dryRunSummary, setDryRunSummary] = useState(null);
  const [finalSummary, setFinalSummary] = useState(null);
  const [validRows, setValidRows] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);
  const zipInputRef = useRef(null);
  const { titleId, descriptionId } = useDialogA11yIds();

  const existingSlugs = useMemo(() => new Set((stores || []).map((store) => store.slug)), [stores]);
  const categoryNameMap = useMemo(
    () => new Map((categories || []).map((category) => [String(category.name || "").trim().toLowerCase(), category])),
    [categories]
  );
  const categorySlugMap = useMemo(
    () => new Map((categories || []).map((category) => [String(category.slug || "").trim().toLowerCase(), category])),
    [categories]
  );
  const allowedCountries = useMemo(
    () => new Set((countries || []).map((country) => normalizeCountryCode(country.code))),
    [countries]
  );

  function resetState() {
    setSelectedFile(null);
    setSelectedFileContent("");
    setSelectedZipFile(null);
    setIsDragging(false);
    setIsDraggingZip(false);
    setDryRunSummary(null);
    setFinalSummary(null);
    setValidRows([]);
    setErrors([]);
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
      'Nike Store,nike-store,Fashion,US,"Editorial summary for Nike page with verified savings.",Active,https://example.com/track/nike,Nike,nike.png,More Information On Nike Deals,"Nike intro paragraph one.","Nike intro paragraph two.","Verified deals\\nCoupon codes\\nStore updates","Nike outro copy","How often are Nike offers updated?","Offers are reviewed regularly.","Are Nike deals verified?","Gocoupon tracks trust signals.","Can I use both deals and coupons?","Yes, both appear on page."',
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gocoupon-store-template.csv";
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
      const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));

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
        toast.error("CSV template missing 'name' header.");
        return;
      }

      const parsedRows = Array.isArray(results.data) ? results.data : [];
      const nextErrors = [];
      const nextValidRows = [];
      const duplicateSlugs = new Set();
      const knownSlugs = new Set(existingSlugs);
      let duplicates = 0;

      parsedRows.forEach((row, index) => {
        const rowNumber = index + 2;
        const name = normalizeValue(row.name);
        if (!name) {
          nextErrors.push({ rowNumber, reason: "Store name is required." });
          return;
        }

        const rawSlug = normalizeValue(row.slug);
        const derivedSlug = slugify(rawSlug || name);
        if (!derivedSlug) {
          nextErrors.push({ rowNumber, reason: "Slug could not be generated." });
          return;
        }

        // Category smart fallback matching
        const rawCategory = normalizeValue(row.category) || "General";
        const catNorm = rawCategory.toLowerCase();
        let matchedCategory = categoryNameMap.get(catNorm) || categorySlugMap.get(catNorm);
        if (!matchedCategory && categories && categories.length > 0) {
          matchedCategory = categories[0];
        } else if (!matchedCategory) {
          matchedCategory = { name: rawCategory, slug: slugify(rawCategory) };
        }

        // Description fallback
        let description = normalizeValue(row.description);
        if (description.length < 10) {
          description = `${name} verified promo codes, coupons, and savings deals on Gocoupon.`;
        }

        // Country code fallback
        let countryCode = normalizeCountryCode(row.countryCode || row.country || DEFAULT_COUNTRY_CODE);
        if (allowedCountries.size > 0 && !allowedCountries.has(countryCode)) {
          countryCode = Array.from(allowedCountries)[0] || DEFAULT_COUNTRY_CODE || "US";
        }

        // Handle Duplicate Slugs
        if (knownSlugs.has(derivedSlug) || duplicateSlugs.has(derivedSlug)) {
          duplicates += 1;
          duplicateSlugs.add(derivedSlug);
          return;
        }

        knownSlugs.add(derivedSlug);

        const trustStatus = normalizeValue(row.trustStatus);
        const affiliateLink = normalizeValue(row.affiliateLink);
        const logoText = normalizeValue(row.logoText);
        const logoFile = normalizeValue(row.logoFile);

        nextValidRows.push({
          name,
          slug: derivedSlug,
          category: matchedCategory.name,
          categorySlug: matchedCategory.slug,
          countryCode,
          description,
          trustStatus: TRUST_STATUSES.has(trustStatus) ? trustStatus : "Active",
          affiliateLink,
          logoText: logoText || name,
          logoFile,
          contentIntroTitle: normalizeValue(row.contentIntroTitle),
          contentIntroParagraph1: normalizeValue(row.contentIntroParagraph1),
          contentIntroParagraph2: normalizeValue(row.contentIntroParagraph2),
          contentWhyItemsText: normalizeValue(row.contentWhyItemsText).replace(/\\n/g, "\n"),
          contentOutro: normalizeValue(row.contentOutro),
          faq1Question: normalizeValue(row.faq1Question),
          faq1Answer: normalizeValue(row.faq1Answer),
          faq2Question: normalizeValue(row.faq2Question),
          faq2Answer: normalizeValue(row.faq2Answer),
          faq3Question: normalizeValue(row.faq3Question),
          faq3Answer: normalizeValue(row.faq3Answer),
        });
      });

      setValidRows(nextValidRows);
      setErrors(nextErrors);
      setDryRunSummary({
        totalRecords: parsedRows.length,
        validRows: nextValidRows.length,
        duplicates,
        validationErrors: nextErrors.length,
      });

      if (nextValidRows.length) {
        toast.success(`Validated ${nextValidRows.length} valid store records ready to import!`);
      } else {
        toast.error("No valid store rows found in CSV.");
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

  function selectZipFile(file) {
    if (!file) return;

    const isZipFile =
      file.type === "application/zip" ||
      file.type === "application/x-zip-compressed" ||
      file.name.toLowerCase().endsWith(".zip");

    if (!isZipFile) {
      toast.error("Only ZIP files (.zip) are supported for store logos.");
      return;
    }

    setSelectedZipFile(file);
    toast.success(`Logos ZIP attached: ${file.name}`);
  }

  async function handleImport() {
    let rowsToImport = validRows;

    if (!rowsToImport.length && selectedFile) {
      // Auto run validation if not performed yet
      await processAndValidateFile(selectedFile, selectedFileContent);
      rowsToImport = validRows;
    }

    if (!rowsToImport.length) {
      toast.error("Please attach a valid CSV file first.");
      return;
    }

    setIsUploading(true);

    try {
      const response = await fetch("/api/stores/bulk", {
        method: "POST",
        headers: getAdminAuthHeaders(),
        body: (() => {
          const formData = new FormData();
          formData.append("rows", JSON.stringify(rowsToImport));
          if (selectedZipFile) {
            formData.append("logosZip", selectedZipFile);
          }
          return formData;
        })(),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to import stores.");
      }

      setFinalSummary(payload.data);
      setErrors(payload.data.errors || []);

      if (payload.data.successfullyImported > 0) {
        await onImported?.();
        toast.success(`🎉 ${payload.data.successfullyImported} stores imported successfully!`);
      } else {
        toast.error("Import completed, but 0 new stores were added.");
      }
    } catch (error) {
      toast.error(error.message || "Unable to import stores.");
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
                Bulk Import Stores
              </DialogTitle>
              <DialogDescription id={descriptionId} className="text-xs text-white/50">
                Upload CSV assets, review validation, and import to database instantly.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Card className="rounded-[22px] border border-white/10 bg-zinc-900/80 shadow-none">
                <CardContent className="p-4 space-y-2.5">
                  <div className="rounded-xl border border-white/8 bg-white/5 px-3.5 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Step 01</p>
                    <p className="mt-0.5 text-xs font-semibold text-white/80">Attach <code className="text-emerald-300">stores.csv</code></p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/5 px-3.5 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Step 02</p>
                    <p className="mt-0.5 text-xs font-semibold text-white/80">Optionally add <code className="text-emerald-300">logos.zip</code></p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/5 px-3.5 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Step 03</p>
                    <p className="mt-0.5 text-xs font-semibold text-white/80">Run validation & Click Import</p>
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
                      <span className="text-white/40 uppercase text-[10px] font-bold">Slug</span>
                      <span className="font-semibold text-white/80">Auto Generated</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                      <span className="text-white/40 uppercase text-[10px] font-bold">Category</span>
                      <span className="font-semibold text-white/80">Smart Matched</span>
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
                  <p className="text-xs text-white/40">Select or drop CSV file below</p>
                </div>
                {selectedFile ? (
                  <Badge className="border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                    ✓ CSV Selected ({validRows.length} Rows Ready)
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
                  "rounded-[20px] border-2 border-dashed p-5 transition-all cursor-pointer",
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      📄
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Store CSV File</p>
                      <p className="text-xs text-white/45">
                        {selectedFile ? selectedFile.name : "Drop file here or click to browse"}
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

              {/* ZIP Input Hidden */}
              <input
                ref={zipInputRef}
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                className="hidden"
                onChange={(event) => selectZipFile(event.target.files?.[0])}
              />

              {/* ZIP Dropzone */}
              <div
                className={cn(
                  "rounded-[20px] border-2 border-dashed p-4 transition-all cursor-pointer",
                  isDraggingZip
                    ? "border-emerald-500 bg-emerald-500/10"
                    : selectedZipFile
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                )}
                onClick={() => zipInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingZip(true);
                }}
                onDragLeave={() => setIsDraggingZip(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDraggingZip(false);
                  selectZipFile(event.dataTransfer.files?.[0]);
                }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                      📦
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Logos ZIP Archive (Optional)</p>
                      <p className="text-[11px] text-white/45">
                        {selectedZipFile ? selectedZipFile.name : "Optional logo images in a ZIP container"}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="min-w-[130px] rounded-xl border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      zipInputRef.current?.click();
                    }}
                  >
                    Select ZIP
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
                      Importing Stores...
                    </span>
                  ) : (
                    "🚀 Import Stores Now"
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

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 text-xs">
                    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                      <p className="text-[10px] uppercase font-bold text-white/40">Total Records</p>
                      <p className="mt-1 text-lg font-black text-white">{(finalSummary || dryRunSummary).totalRecords}</p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                      <p className="text-[10px] uppercase font-bold text-emerald-400">
                        {finalSummary ? "Imported" : "Valid Rows"}
                      </p>
                      <p className="mt-1 text-lg font-black text-emerald-400">
                        {finalSummary ? finalSummary.successfullyImported : dryRunSummary.validRows}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-white/5 p-3">
                      <p className="text-[10px] uppercase font-bold text-amber-400">Duplicates Skipped</p>
                      <p className="mt-1 text-lg font-black text-amber-400">
                        {finalSummary ? finalSummary.duplicatesSkipped : dryRunSummary.duplicates}
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
                        Done & Refresh Stores
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
