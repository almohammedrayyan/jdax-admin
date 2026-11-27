import { CalendarMonthOutlined, ChevronLeft, ChevronRight, LocationOnOutlined, VideocamOutlined } from "@mui/icons-material";
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGetContentSchedulesQuery, type ContentSchedule } from "../services/contentScheduleApi";

const timezone = "Asia/Kolkata";
const dateKey = (date: Date) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};
const formatTime = (value: string) => new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: timezone }).format(new Date(value));
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: timezone }).format(new Date(value));
const formatKey = (date: Date) => date.toISOString().slice(0, 10);
const displayKey = (key: string) => new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${key}T00:00:00Z`));

export default function ScheduleCalendarPage() {
  const { data: schedules = [], isLoading, isError, refetch } = useGetContentSchedulesQuery(undefined, { refetchOnMountOrArgChange: true });
  const [month, setMonth] = useState(() => `${dateKey(new Date()).slice(0, 7)}-01`);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ContentSchedule | null>(null);
  const monthDate = new Date(`${month}T00:00:00Z`);
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(monthDate);
  const today = dateKey(new Date());

  const byDay = useMemo(() => {
    const result = new Map<string, ContentSchedule[]>();
    schedules.forEach((item) => {
      const date = new Date(item.scheduledAt);
      if (Number.isNaN(date.getTime())) return;
      const key = dateKey(date);
      result.set(key, [...(result.get(key) || []), item]);
    });
    result.forEach((items) => items.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()));
    return result;
  }, [schedules]);

  const grid = useMemo(() => {
    const first = new Date(`${month}T00:00:00Z`);
    const start = new Date(first);
    start.setUTCDate(1 - first.getUTCDay());
    const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    const count = Math.ceil((first.getUTCDay() + lastDay) / 7) * 7;
    return Array.from({ length: count }, (_, index) => {
      const day = new Date(start); day.setUTCDate(start.getUTCDate() + index); return day;
    });
  }, [month]);

  const moveMonth = (offset: number) => {
    const date = new Date(`${month}T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + offset);
    setMonth(formatKey(date));
  };
  const dayEvents = selectedDay ? byDay.get(selectedDay) || [] : [];

  return <Box className="contentPage" sx={{ maxWidth: "100%" }}>
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 3 }}><Box><Typography variant="h4">Schedule calendar</Typography><Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>Content schedules · Indian Standard Time</Typography></Box><Button component={Link} to="/content" variant="outlined">Manage schedules</Button></Box>
    <Box sx={{ border: "1px solid", borderColor: "#e4eaf4", borderRadius: 3, bgcolor: "#fff", overflow: "hidden", boxShadow: "0 10px 28px #153d7810" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 1, p: { xs: 1.5, sm: 2.5 } }}><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CalendarMonthOutlined color="primary" /><Typography variant="h6" sx={{ fontWeight: 800 }}>{monthLabel}</Typography></Box><Box sx={{ display: "flex", alignItems: "center" }}><Button size="small" onClick={() => setMonth(`${dateKey(new Date()).slice(0, 7)}-01`)}>Today</Button><IconButton aria-label="Previous month" onClick={() => moveMonth(-1)}><ChevronLeft /></IconButton><IconButton aria-label="Next month" onClick={() => moveMonth(1)}><ChevronRight /></IconButton></Box></Box>
      {isLoading ? <Box sx={{ p: 6, textAlign: "center" }}><CircularProgress size={28} aria-label="Loading schedules" /></Box> : isError ? <Alert severity="error" action={<Button color="inherit" onClick={() => void refetch()}>Retry</Button>}>Unable to load schedules.</Alert> : <><Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", bgcolor: "#f6f9ff", borderTop: "1px solid #e4eaf4" }}>{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <Typography key={day} sx={{ py: 1, textAlign: "center", fontSize: { xs: "0.65rem", sm: "0.78rem" }, fontWeight: 700, color: "text.secondary" }}>{day}</Typography>)}</Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", borderTop: "1px solid #e4eaf4" }}>{grid.map((date) => {
          const key = formatKey(date);
          const entries = byDay.get(key) || [];
          const currentMonth = key.slice(0, 7) === month.slice(0, 7);
          return <Box key={key} sx={{ minWidth: 0, minHeight: { xs: 64, sm: 112 }, borderRight: "1px solid #edf1f7", borderBottom: "1px solid #edf1f7", bgcolor: currentMonth ? "#fff" : "#f9fafc", p: { xs: 0.4, sm: 0.8 } }}><Box component="button" type="button" onClick={() => setSelectedDay(key)} aria-label={`${displayKey(key)}, ${entries.length} ${entries.length === 1 ? "event" : "events"}`} sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: 30, height: 30, border: 0, borderRadius: "50%", cursor: "pointer", bgcolor: key === today ? "primary.main" : "transparent", color: key === today ? "#fff" : currentMonth ? "text.primary" : "text.disabled", fontWeight: key === today ? 800 : 500 }}>{date.getUTCDate()}</Box><Box sx={{ display: { xs: "block", sm: "none" }, textAlign: "center", color: "primary.main", fontSize: "0.7rem", fontWeight: 700 }}>{entries.length > 0 ? `${entries.length} ${entries.length === 1 ? "event" : "events"}` : ""}</Box><Box sx={{ display: { xs: "none", sm: "grid" }, gap: 0.4 }}>{entries.slice(0, 2).map((item) => <Box component="button" type="button" key={item._id} onClick={() => setSelectedEvent(item)} sx={{ border: 0, borderRadius: 1, bgcolor: "#eaf1ff", color: "#2357aa", textAlign: "left", px: 0.7, py: 0.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer", fontSize: "0.7rem", fontWeight: 600 }}>{formatTime(item.scheduledAt)} {item.title}</Box>)}{entries.length > 2 && <Button size="small" onClick={() => setSelectedDay(key)} sx={{ textTransform: "none", justifyContent: "flex-start", fontSize: "0.7rem", py: 0 }}>+{entries.length - 2} more</Button>}</Box></Box>;
        })}</Box></>}
    </Box>
    <Dialog open={Boolean(selectedDay)} onClose={() => setSelectedDay(null)} fullWidth maxWidth="xs"><DialogTitle>{selectedDay ? displayKey(selectedDay) : ""}</DialogTitle><DialogContent>{dayEvents.length ? dayEvents.map((item) => <Button key={item._id} fullWidth onClick={() => { setSelectedDay(null); setSelectedEvent(item); }} sx={{ justifyContent: "flex-start", textAlign: "left", textTransform: "none", mb: 1, bgcolor: "#f4f7ff", gap: 1 }}><strong>{formatTime(item.scheduledAt)}</strong> {item.title}</Button>) : <Typography color="text.secondary">No events scheduled for this day.</Typography>}</DialogContent><DialogActions><Button onClick={() => setSelectedDay(null)}>Close</Button></DialogActions></Dialog>
    <Dialog open={Boolean(selectedEvent)} onClose={() => setSelectedEvent(null)} fullWidth maxWidth="xs"><DialogTitle>{selectedEvent?.title}</DialogTitle><DialogContent>{selectedEvent && <Box sx={{ display: "grid", gap: 1.5, pt: 1 }}><Box><Chip size="small" label={`${selectedEvent.category.toUpperCase()}${selectedEvent.group ? ` · ${selectedEvent.group.replace("group-", "G")}` : ""}`} color="primary" variant="outlined" /></Box><Typography variant="body2">{formatDate(selectedEvent.scheduledAt)} at {formatTime(selectedEvent.scheduledAt)} IST</Typography>{selectedEvent.venue && <Box sx={{ display: "flex", gap: 1, alignItems: "center", color: "text.secondary" }}>{/\bonline\b/i.test(selectedEvent.venue) ? <VideocamOutlined fontSize="small" /> : <LocationOnOutlined fontSize="small" />}<Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{selectedEvent.venue}</Typography></Box>}</Box>}</DialogContent><DialogActions><Button onClick={() => setSelectedEvent(null)}>Close</Button></DialogActions></Dialog>
  </Box>;
}
