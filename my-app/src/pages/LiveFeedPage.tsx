import { Add, DeleteOutlined, EditOutlined, Search } from '@mui/icons-material'
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, InputAdornment, MenuItem, TextField, Typography } from '@mui/material'
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const PLATFORM_OPTIONS = ['instagram', 'youtube'] as const
type Platform = typeof PLATFORM_OPTIONS[number]
type LiveFeed = { _id: string; platform: Platform; link: string; createdAt?: string }
type LiveFeedForm = { platform: Platform | ''; link: string }
type ApiResponse<T> = { success: boolean; message: string; data: T }
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'
const emptyForm: LiveFeedForm = { platform: '', link: '' }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api/social-live-feeds${path}`, { headers: { 'Content-Type': 'application/json', ...options?.headers }, ...options })
  const payload = await response.json() as ApiResponse<T>
  if (!response.ok || !payload.success) throw new Error(payload.message || 'Unable to complete the request.')
  return payload.data
}

export default function LiveFeedPage() {
  const [rows, setRows] = useState<LiveFeed[]>([]); const [form, setForm] = useState<LiveFeedForm>(emptyForm); const [editingFeed, setEditingFeed] = useState<LiveFeed | null>(null); const [open, setOpen] = useState(false); const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState('')
  const loadFeeds = useCallback(async () => { setLoading(true); try { setRows(await request<LiveFeed[]>('/')); setError('') } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load live feeds.') } finally { setLoading(false) } }, [])
  useEffect(() => { void loadFeeds() }, [loadFeeds])
  const closeDialog = () => { setOpen(false); setEditingFeed(null); setForm(emptyForm); setError('') }
  const openCreate = () => { setEditingFeed(null); setForm(emptyForm); setError(''); setOpen(true) }
  const openEdit = (feed: LiveFeed) => { setEditingFeed(feed); setForm({ platform: feed.platform, link: feed.link }); setError(''); setOpen(true) }
  const saveFeed = async () => { if (!form.platform || !form.link.trim()) { setError('Please select a platform and enter a link.'); return }; setSaving(true); try { if (editingFeed) await request<LiveFeed>(`/${editingFeed._id}`, { method: 'PUT', body: JSON.stringify(form) }); else await request<LiveFeed>('/', { method: 'POST', body: JSON.stringify(form) }); closeDialog(); await loadFeeds() } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save the live feed.') } finally { setSaving(false) } }
  const deleteFeed = async (id: string) => { if (!window.confirm('Delete this live feed?')) return; try { await request<LiveFeed>(`/${id}`, { method: 'DELETE' }); await loadFeeds() } catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete the live feed.') } }
  const columns: GridColDef<LiveFeed>[] = [{ field: 'platform', headerName: 'Platform', flex: 1, valueFormatter: value => String(value).replace(/^./, char => char.toUpperCase()) }, { field: 'link', headerName: 'Live link', flex: 3, renderCell: ({ value }) => <a href={String(value)} target="_blank" rel="noreferrer">{String(value)}</a> }, { field: 'createdAt', headerName: 'Created', flex: 1, valueFormatter: value => value ? new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(String(value))) : '—' }, { field: 'actions', type: 'actions', headerName: 'Actions', width: 110, getActions: ({ row }) => [<GridActionsCellItem key="edit" icon={<EditOutlined sx={{ color: 'primary.main' }} />} label="Edit" onClick={() => openEdit(row)} />, <GridActionsCellItem key="delete" icon={<DeleteOutlined sx={{ color: 'error.main' }} />} label="Delete" onClick={() => void deleteFeed(row._id)} />] }]
  const filteredRows = useMemo(() => rows.filter(row => `${row.platform} ${row.link}`.toLowerCase().includes(query.toLowerCase())), [rows, query])
  return <Box className="contentPage"><Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}><Typography variant="h4">Social Live Feed</Typography><Button variant="contained" startIcon={<Add />} onClick={openCreate}>Create Live Feed</Button></Box>{error && !open && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}<TextField size="small" placeholder="Search live feeds..." value={query} onChange={e => setQuery(e.target.value)} sx={{ mb: 2, width: { xs: '100%', sm: 360 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} /><Box sx={{ height: 430, width: '100%', bgcolor: '#fff' }}><DataGrid rows={filteredRows} getRowId={row => row._id} columns={columns} loading={loading} pageSizeOptions={[5, 10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }} disableRowSelectionOnClick /></Box><Dialog open={open} onClose={saving ? undefined : closeDialog} fullWidth maxWidth="sm"><DialogTitle>{editingFeed ? 'Update live feed' : 'Create live feed'}</DialogTitle><DialogContent>{error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}<TextField select fullWidth required label="Platform" value={form.platform} onChange={e => setForm(current => ({ ...current, platform: e.target.value as Platform }))} sx={{ mt: 2, mb: 2 }}>{PLATFORM_OPTIONS.map(platform => <MenuItem key={platform} value={platform}>{platform[0].toUpperCase() + platform.slice(1)}</MenuItem>)}</TextField><TextField fullWidth required label="Live link" placeholder="https://..." type="url" value={form.link} onChange={e => setForm(current => ({ ...current, link: e.target.value }))} /></DialogContent><DialogActions><Button onClick={closeDialog} disabled={saving}>Cancel</Button><Button variant="contained" onClick={() => void saveFeed()} disabled={saving}>{saving ? 'Saving...' : editingFeed ? 'Update' : 'Create'}</Button></DialogActions></Dialog></Box>
}
