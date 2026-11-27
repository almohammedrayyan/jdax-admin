import { ArrowUpward, CalendarMonthOutlined, LocationOnOutlined, TrendingUp, VideocamOutlined } from "@mui/icons-material";
import { Box, Button, Chip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useGetDashboardVisitorsQuery } from "../services/dashboardVisitorApi";
import { useGetContentSchedulesQuery } from "../services/contentScheduleApi";

export default function DashboardPage() {
  const { data: visitors } = useGetDashboardVisitorsQuery();
  const { data: schedules = [], isLoading: schedulesLoading, isError: schedulesError } = useGetContentSchedulesQuery(undefined, { pollingInterval: 60000, refetchOnMountOrArgChange: true });
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const upcoming = schedules
    .filter((item) => Number.isFinite(new Date(item.scheduledAt).getTime()) && new Date(item.scheduledAt).getTime() >= currentTime)
    .slice().sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()).slice(0, 5);

  const now = new Date();
  const overviewDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(now);
  const totalViews = visitors?.totalViews ?? 0;
  const snapshotDate = visitors?.snapshotDate
    ? new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(visitors.snapshotDate))
    : "No saved data yet";
  const formattedTotalViews = totalViews.toLocaleString();
  return (
    <Box className="dashboardPage simplifiedDashboard">
      <Box className="dashboardIntro">
        <Box>
          <Typography className="eyebrow">Overview · {overviewDate}</Typography>
          <Typography variant="h4">Good morning, Alex.</Typography>
          <Typography className="dashboardSubtitle">
            Here’s your social engagement and publishing plan for today.
          </Typography>
        </Box>
      </Box>
      <Box className="summaryGrid singleSummary">
        <Box className="summaryCard">
          <Box className="summaryIcon coral">
            <TrendingUp />
          </Box>
          <Box>
            <Typography className="cardLabel">Total views</Typography>
            <Typography className="metricValue">
              {formattedTotalViews}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Saved {snapshotDate}
            </Typography>
          </Box>
          <Typography className="metricTrend">
            <ArrowUpward />
            Live snapshot
          </Typography>
        </Box>
      </Box>
      <Box className="dashboardContentGrid">
        <Box className="panel performancePanel">
          <Box className="panelHeader">
            <Box>
              <Typography className="panelTitle">
                Engagement performance
              </Typography>
              <Typography className="panelHint">
                Total views saved from Google Analytics
              </Typography>
            </Box>
            <Button size="small" className="ghostButton">
              {snapshotDate}
            </Button>
          </Box>
          <Box className="chartArea" aria-label="Engagement chart">
            <Box className="chartYAxis">
              <span>10k</span>
              <span>7.5k</span>
              <span>5k</span>
              <span>2.5k</span>
              <span>0</span>
            </Box>
            <Box className="chartCanvas">
              <Box className="chartGridLines" />
              <svg
                viewBox="0 0 620 190"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3877ff" stopOpacity=".24" />
                    <stop offset="100%" stopColor="#3877ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,150 C30,128 45,136 72,114 S115,122 140,88 S190,113 218,88 S257,89 283,54 S325,81 354,64 S394,40 424,58 S472,71 498,30 S545,56 620,14 L620,190 L0,190 Z"
                  fill="url(#areaFill)"
                />
                <path
                  d="M0,150 C30,128 45,136 72,114 S115,122 140,88 S190,113 218,88 S257,89 283,54 S325,81 354,64 S394,40 424,58 S472,71 498,30 S545,56 620,14"
                  fill="none"
                  stroke="#3776ff"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
              <Box className="chartLabels">
                <span>Oct 28</span>
                <span>Nov 04</span>
                <span>Nov 11</span>
                <span>Nov 18</span>
                <span>Nov 25</span>
              </Box>
            </Box>
          </Box>
          <Box className="chartLegend">
            <span>
              <i className="blueDot" />
              Total views
            </span>
            <strong>{formattedTotalViews}</strong>
          </Box>
        </Box>
        <Box className="panel schedulePanel">
          <Box className="panelHeader">
            <Box>
              <Typography className="panelTitle">Content schedule</Typography>
              <Typography className="panelHint">Next five upcoming events · IST</Typography>
            </Box>
            <Button size="small" className="textAction" component={Link} to="/calendar" startIcon={<CalendarMonthOutlined />}>
              View calendar
            </Button>
          </Box>
          <Box className="scheduleList">
            {schedulesLoading ? <Typography color="text.secondary" variant="body2">Loading upcoming events...</Typography> : schedulesError ? <Typography color="error" variant="body2">Unable to load upcoming events.</Typography> : upcoming.length === 0 ? <Typography color="text.secondary" variant="body2">No upcoming events scheduled.</Typography> : upcoming.map((item) => (
              <Box className="scheduleItem" key={item._id} sx={{ gridTemplateColumns: "4.8rem 0.75rem minmax(0, 1fr) !important", columnGap: { xs: "0.35rem", sm: "0.65rem" } }}>
                <Box className="scheduleTime"><Typography component="span" sx={{ display: "block", fontSize: "inherit", fontWeight: "inherit", whiteSpace: "nowrap" }}>{new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).format(new Date(item.scheduledAt))}</Typography><Typography component="span" sx={{ display: "block", fontSize: "0.65rem", fontWeight: 400, whiteSpace: "nowrap" }}>{new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date(item.scheduledAt))}</Typography></Box>
                <Box className="scheduleLine">
                  <i />
                </Box>
                <Box className="scheduleCopy">
                  <Typography>{item.title}</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mt: 0.5 }}><Chip
                    size="small"
                    label={`${item.category.toUpperCase()}${item.group ? ` · ${item.group.replace("group-", "G")}` : ""}`}
                    className="scheduleChip in"
                    sx={{ marginTop: "0 !important" }}
                  />
                  {item.venue && <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, minWidth: 0, color: "text.secondary" }}>{/\bonline\b/i.test(item.venue) ? <VideocamOutlined sx={{ fontSize: 15, flexShrink: 0 }} /> : <LocationOnOutlined sx={{ fontSize: 15, flexShrink: 0 }} />}<Typography variant="caption" sx={{ overflowWrap: "anywhere" }}>{item.venue}</Typography></Box>}</Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
