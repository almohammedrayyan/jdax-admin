import {
  Add,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  Search,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import BulkScheduleDialog from "../components/BulkScheduleDialog";
import {
  CONTENT_CATEGORIES,
  TNPSC_GROUPS,
  type ContentCategory,
  type ContentSchedule,
  type ContentScheduleForm,
  type TnpscGroup,
  useCreateContentScheduleMutation,
  useDeleteContentScheduleMutation,
  useGetContentSchedulesQuery,
  useUpdateContentScheduleMutation,
} from "../services/contentScheduleApi";

type FormValues = {
  category: ContentCategory | "";
  group: TnpscGroup | "";
  title: string;
  venue: string;
  scheduledAt: string;
};
const emptyForm: FormValues = {
  category: "",
  group: "",
  title: "",
  venue: "",
  scheduledAt: "",
};
const displayName = (value: string) =>
  value
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};
function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "message" in error.data
  )
    return String(error.data.message);
  return fallback;
}
function NoSchedulesOverlay() {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "text.secondary",
      }}
    >
      <InboxOutlined sx={{ fontSize: 48, mb: 1, color: "text.disabled" }} />
      <Typography variant="body1">No data found</Typography>
      <Typography variant="body2">
        Create a content schedule to see it here.
      </Typography>
    </Box>
  );
}

export default function ContentPage() {
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [editing, setEditing] = useState<ContentSchedule | null>(null);
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const {
    data: rows = [],
    isLoading,
    error: queryError,
  } = useGetContentSchedulesQuery();
  const [createSchedule, { isLoading: isCreating }] =
    useCreateContentScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] =
    useUpdateContentScheduleMutation();
  const [deleteSchedule] = useDeleteContentScheduleMutation();
  const saving = isCreating || isUpdating;
  const close = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setError("");
  };
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  };
  const openEdit = (schedule: ContentSchedule) => {
    setEditing(schedule);
    setForm({
      category: schedule.category,
      group: schedule.group ?? "",
      title: schedule.title,
      venue: schedule.venue ?? "",
      scheduledAt: toDateTimeLocal(schedule.scheduledAt),
    });
    setError("");
    setOpen(true);
  };
  const save = async () => {
    if (
      !form.category ||
      !form.title.trim() ||
      !form.scheduledAt ||
      (form.category === "tnpsc" && !form.group)
    ) {
      setError(
        "Select a category, enter a title and schedule time. TNPSC also requires a group.",
      );
      return;
    }
    const data: ContentScheduleForm = {
      category: form.category,
      group: form.category === "tnpsc" ? (form.group as TnpscGroup) : null,
      title: form.title.trim(),
      venue: form.venue.trim(),
      scheduledAt: new Date(form.scheduledAt).toISOString(),
    };
    try {
      if (editing) await updateSchedule({ id: editing._id, data }).unwrap();
      else await createSchedule(data).unwrap();
      close();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save the content schedule."));
    }
  };
  const remove = async (id: string) => {
    if (!window.confirm("Delete this content schedule?")) return;
    try {
      await deleteSchedule(id).unwrap();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete the content schedule."));
    }
  };
  const columns: GridColDef<ContentSchedule>[] = [
    {
      field: "scheduledAt",
      headerName: "Scheduled for",
      flex: 1.25,
      valueFormatter: (value) =>
        new Intl.DateTimeFormat("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(String(value))),
    },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      valueFormatter: (value) => displayName(String(value)),
    },
    {
      field: "group",
      headerName: "TNPSC group",
      flex: 1,
      valueFormatter: (value) => (value ? displayName(String(value)) : "—"),
    },
    { field: "title", headerName: "Title", flex: 2 },
    {
      field: "venue",
      headerName: "Venue",
      flex: 1,
      valueFormatter: (value) => value || "—",
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 110,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditOutlined sx={{ color: "primary.main" }} />}
          label="Edit"
          onClick={() => openEdit(row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteOutlined sx={{ color: "error.main" }} />}
          label="Delete"
          onClick={() => void remove(row._id)}
        />,
      ],
    },
  ];
  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        `${row.category} ${row.group ?? ""} ${row.title} ${row.venue ?? ""} ${row.scheduledAt}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [rows, query],
  );
  return (
    <Box className="contentPage">
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Content Schedule</Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}><Button variant="outlined" onClick={() => setBulkOpen(true)}>Import CSV / Excel</Button><Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Create Content
        </Button></Box>
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}
      <BulkScheduleDialog open={bulkOpen} onClose={() => setBulkOpen(false)} onSuccess={(count) => setSuccess(`${count} schedules imported successfully.`)} />
      {error && !open && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {queryError && !open && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(queryError, "Unable to load content schedules.")}
        </Alert>
      )}
      <TextField
        size="small"
        placeholder="Search content schedules..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2, width: { xs: "100%", sm: 360 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          },
        }}
      />
      <Box sx={{ height: 430, width: "100%", bgcolor: "#fff" }}>
        <DataGrid
          rows={filteredRows}
          getRowId={(row) => row._id}
          columns={columns}
          loading={isLoading}
          slots={{ noRowsOverlay: NoSchedulesOverlay }}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
          disableRowSelectionOnClick
        />
      </Box>
      <Dialog
        open={open}
        onClose={saving ? undefined : close}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editing ? "Update content schedule" : "Create content schedule"}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          <TextField
            select
            fullWidth
            required
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                category: e.target.value as ContentCategory,
                group: e.target.value === "tnpsc" ? current.group : "",
              }))
            }
            sx={{ mt: 2, mb: 2 }}
          >
            {CONTENT_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {displayName(category)}
              </MenuItem>
            ))}
          </TextField>
          {form.category === "tnpsc" && (
            <TextField
              select
              fullWidth
              required
              label="TNPSC group"
              value={form.group}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  group: e.target.value as TnpscGroup,
                }))
              }
              sx={{ mb: 2 }}
            >
              {TNPSC_GROUPS.map((group) => (
                <MenuItem key={group} value={group}>
                  {displayName(group)}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            fullWidth
            required
            label="Title"
            value={form.title}
            onChange={(e) =>
              setForm((current) => ({ ...current, title: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Venue"
            value={form.venue}
            onChange={(e) =>
              setForm((current) => ({ ...current, venue: e.target.value }))
            }
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            required
            label="Schedule date and time"
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                scheduledAt: e.target.value,
              }))
            }
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void save()}
            disabled={saving}
          >
            {saving ? "Saving..." : editing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
