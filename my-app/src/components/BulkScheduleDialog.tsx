import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useState, type ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { CONTENT_CATEGORIES, TNPSC_GROUPS, type ContentScheduleForm, type ContentCategory, type TnpscGroup, useCreateBulkContentSchedulesMutation } from "../services/contentScheduleApi";

const columns = ["category", "group", "title", "venue", "scheduledAt"];
const maxRows = 500;

function scheduleTime(value: unknown): string {
  let text = String(value ?? "").trim();
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (!date) throw new Error("Invalid Excel date and time.");
    const pad = (number: number) => String(number).padStart(2, "0");
    text = `${date.y}-${pad(date.m)}-${pad(date.d)} ${pad(date.H)}:${pad(date.M)}:${pad(Math.floor(date.S))}`;
  }
  const local = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(text);
  if (local) {
    const [, year, month, day, hour, minute, second = "00"] = local;
    const utc = new Date(Date.UTC(+year, +month - 1, +day, +hour, +minute, +second));
    if (utc.getUTCFullYear() !== +year || utc.getUTCMonth() !== +month - 1 || utc.getUTCDate() !== +day || +hour > 23 || +minute > 59 || +second > 59) throw new Error("Invalid date or time.");
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+05:30`).toISOString();
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i.test(text)) throw new Error("Use YYYY-MM-DD HH:mm (IST) or an ISO timestamp with timezone.");
  const timestamp = new Date(text);
  if (Number.isNaN(timestamp.getTime())) throw new Error("Invalid date or time.");
  return timestamp.toISOString();
}

function parseRows(buffer: ArrayBuffer): ContentScheduleForm[] {
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false, sheetRows: maxRows + 2 });
  if (!workbook.SheetNames.length) throw new Error("The file has no worksheet.");
  const table = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: true, defval: "", blankrows: true });
  const headers = (table[0] || []).map((value) => String(value).trim().toLowerCase());
  const indices = columns.map((column) => headers.indexOf(column.toLowerCase()));
  if (indices.some((index) => index < 0)) throw new Error(`The first row must contain these columns: ${columns.join(", ")}.`);
  const data = table.slice(1).map((values, index) => ({ values, row: index + 2 })).filter(({ values }) => values.some((value) => String(value ?? "").trim() !== ""));
  if (!data.length) throw new Error("The file contains no schedules.");
  if (data.length > maxRows || table.length > maxRows + 1) throw new Error(`The file must contain at most ${maxRows} rows.`);
  const errors: string[] = [];
  const rows = data.map(({ values, row }) => {
    try {
      const [categoryValue, groupValue, titleValue, venueValue, timeValue] = indices.map((index) => values[index]);
      const category = String(categoryValue ?? "").trim().toLowerCase() as ContentCategory;
      const group = String(groupValue ?? "").trim().toLowerCase() as TnpscGroup;
      const title = String(titleValue ?? "").trim();
      if (!CONTENT_CATEGORIES.includes(category)) throw new Error("Invalid category.");
      if (category === "tnpsc" && !TNPSC_GROUPS.includes(group)) throw new Error("TNPSC requires group-1, group-2, or group-4.");
      if (category !== "tnpsc" && group) throw new Error("Group must be empty for non-TNPSC categories.");
      if (!title) throw new Error("Title is required.");
      return { category, group: category === "tnpsc" ? group : null, title, venue: String(venueValue ?? "").trim(), scheduledAt: scheduleTime(timeValue) };
    } catch (error) {
      errors.push(`Row ${row}: ${error instanceof Error ? error.message : "Invalid row."}`);
      return null;
    }
  });
  if (errors.length) throw new Error(errors.join("\n"));
  return rows as ContentScheduleForm[];
}

function downloadTemplate() {
  const csv = "category,group,title,venue,scheduledAt\r\ntnpsc,group-1,Indian Polity,JDAX Campus,2026-12-01 10:00\r\nupsc,,Current Affairs,Online,2026-12-01 14:00\r\n";
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = "content-schedule-template.csv"; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function BulkScheduleDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: (count: number) => void }) {
  const [rows, setRows] = useState<ContentScheduleForm[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [createBulk, { isLoading }] = useCreateBulkContentSchedulesMutation();
  const close = () => { setRows([]); setFileName(""); setError(""); onClose(); };
  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    setRows([]); setFileName(""); setError("");
    if (!file) return;
    if (!/\.(csv|xls|xlsx)$/i.test(file.name)) { setError("Choose a CSV, XLS, or XLSX file."); return; }
    if (file.size > 2 * 1024 * 1024) { setError("The file must be 2 MB or smaller."); return; }
    try { setRows(parseRows(await file.arrayBuffer())); setFileName(file.name); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to read the file."); }
  };
  const submit = async () => {
    setError("");
    try { const created = await createBulk(rows).unwrap(); close(); onSuccess(created.length); }
    catch (err) { setError(err && typeof err === "object" && "data" in err && err.data && typeof err.data === "object" && "message" in err.data ? String(err.data.message) : "Unable to import schedules. Please check the server and try again."); }
  };
  return <Dialog open={open} onClose={isLoading ? undefined : close} fullWidth maxWidth="sm"><DialogTitle>Import content schedules</DialogTitle><DialogContent>
    <Typography variant="body2" sx={{ mb: 1 }}>Upload a CSV, XLS, or XLSX file with up to 500 schedules. The first worksheet is used.</Typography>
    <Typography variant="body2" sx={{ mb: 1 }}>Columns: category, group, title, venue, scheduledAt. Use YYYY-MM-DD HH:mm for date and time in IST; venue is optional and group is required only for TNPSC.</Typography>
    <Typography variant="body2" sx={{ mb: 2 }}>Categories: {CONTENT_CATEGORIES.join(", ")}. TNPSC groups: {TNPSC_GROUPS.join(", ")}.</Typography>
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}><Button variant="outlined" onClick={downloadTemplate}>Download CSV template</Button><Button component="label" variant="contained" disabled={isLoading}>Choose file<input hidden type="file" accept=".csv,.xls,.xlsx" onChange={selectFile} /></Button></Box>
    {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto" }}>{error}</Alert>}
    {rows.length > 0 && <Alert severity="success">{fileName}: {rows.length} valid {rows.length === 1 ? "schedule" : "schedules"} ready to import. Review the file before importing.</Alert>}
  </DialogContent><DialogActions><Button onClick={close} disabled={isLoading}>Cancel</Button><Button variant="contained" onClick={() => void submit()} disabled={!rows.length || isLoading}>{isLoading ? "Importing..." : `Import ${rows.length || ""}`}</Button></DialogActions></Dialog>;
}
