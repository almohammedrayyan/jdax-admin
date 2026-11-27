import { Add, Search } from "@mui/icons-material";
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
  type GridColDef,
} from "@mui/x-data-grid";
import { useMemo, useState } from "react";
import {
  PLATFORM_OPTIONS,
  type LiveFeed,
  type LiveFeedForm,
  type Platform,
  useCreateLiveFeedMutation,
  useGetLiveFeedsQuery,
} from "../services/liveFeedApi";

type LiveFeedFormValues = Omit<LiveFeedForm, "platform"> & {
  platform: Platform | "";
};
const emptyForm: LiveFeedFormValues = { platform: "", accountId: "" };

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "message" in error.data
  ) {
    return String(error.data.message);
  }
  return fallback;
}

export default function LiveFeedPage() {
  const [form, setForm] = useState<LiveFeedFormValues>(emptyForm);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const {
    data: rows = [],
    isLoading,
    error: queryError,
  } = useGetLiveFeedsQuery();
  const [createLiveFeed, { isLoading: isCreating }] =
    useCreateLiveFeedMutation();
  const saving = isCreating;
  const closeDialog = () => {
    setOpen(false);
    setForm(emptyForm);
    setError("");
  };
  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setOpen(true);
  };
  const saveFeed = async () => {
    if (!form.platform || !form.accountId.trim()) {
      setError("Please select a platform and enter an account ID.");
      return;
    }
    try {
      await createLiveFeed(form as LiveFeedForm).unwrap();
      closeDialog();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save the live feed."));
    }
  };
  const columns: GridColDef<LiveFeed>[] = [
    {
      field: "platform",
      headerName: "Platform",
      flex: 1,
      valueFormatter: (value) =>
        String(value).replace(/^./, (char) => char.toUpperCase()),
    },
    {
      field: "accountId",
      headerName: "Account ID",
      flex: 3,
    },
    {
      field: "createdAt",
      headerName: "Created",
      flex: 1,
      valueFormatter: (value) =>
        value
          ? new Intl.DateTimeFormat("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(String(value)))
          : "—",
    },
  ];
  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        `${row.platform} ${row.accountId ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [rows, query],
  );
  return (
    <Box className="contentPage">
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Social Live Feed</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Create Live Feed
        </Button>
      </Box>
      {error && !open && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {queryError && !open && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getErrorMessage(queryError, "Unable to load live feeds.")}
        </Alert>
      )}
      <TextField
        size="small"
        placeholder="Search live feeds..."
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
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
          disableRowSelectionOnClick
        />
      </Box>
      <Dialog
        open={open}
        onClose={saving ? undefined : closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Create live feed
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
            label="Platform"
            value={form.platform}
            onChange={(e) =>
              setForm((current) => ({
                ...current,
                platform: e.target.value as Platform,
              }))
            }
            sx={{ mt: 2, mb: 2 }}
          >
            {PLATFORM_OPTIONS.map((platform) => (
              <MenuItem key={platform} value={platform}>
                {platform[0].toUpperCase() + platform.slice(1)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            required
            label="Account ID"
            placeholder="Enter the account ID"
            value={form.accountId}
            onChange={(e) =>
              setForm((current) => ({ ...current, accountId: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void saveFeed()}
            disabled={saving}
          >
            {saving ? "Saving..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
