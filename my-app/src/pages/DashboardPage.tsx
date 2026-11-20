import { ArrowUpward, MoreHoriz, TrendingUp } from '@mui/icons-material'
import { Box, Button, Chip, IconButton, Typography } from '@mui/material'

const schedule = [
  { time: '09:30', platform: 'in', title: 'Customer story: building a better workflow', state: 'LinkedIn' },
  { time: '12:00', platform: 'ig', title: 'Behind the scenes with the product team', state: 'Instagram' },
  { time: '16:45', platform: 'fb', title: 'Your weekly industry round-up', state: 'Facebook' },
]

export default function DashboardPage() {
  const now = new Date()
  const overviewDate = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now)
  const todayDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'short' }).format(now)
  return <Box className="dashboardPage simplifiedDashboard">
    <Box className="dashboardIntro"><Box><Typography className="eyebrow">Overview · {overviewDate}</Typography><Typography variant="h4">Good morning, Alex.</Typography><Typography className="dashboardSubtitle">Here’s your social engagement and publishing plan for today.</Typography></Box></Box>
    <Box className="summaryGrid singleSummary"><Box className="summaryCard"><Box className="summaryIcon coral"><TrendingUp /></Box><Box><Typography className="cardLabel">Total engagement</Typography><Typography className="metricValue">48.2K</Typography></Box><Typography className="metricTrend"><ArrowUpward />+12.8%</Typography></Box></Box>
    <Box className="dashboardContentGrid">
      <Box className="panel performancePanel"><Box className="panelHeader"><Box><Typography className="panelTitle">Engagement performance</Typography><Typography className="panelHint">Audience actions over the last 30 days</Typography></Box><Button size="small" className="ghostButton">Last 30 days</Button></Box><Box className="chartArea" aria-label="Engagement chart"><Box className="chartYAxis"><span>10k</span><span>7.5k</span><span>5k</span><span>2.5k</span><span>0</span></Box><Box className="chartCanvas"><Box className="chartGridLines" /><svg viewBox="0 0 620 190" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#3877ff" stopOpacity=".24"/><stop offset="100%" stopColor="#3877ff" stopOpacity="0"/></linearGradient></defs><path d="M0,150 C30,128 45,136 72,114 S115,122 140,88 S190,113 218,88 S257,89 283,54 S325,81 354,64 S394,40 424,58 S472,71 498,30 S545,56 620,14 L620,190 L0,190 Z" fill="url(#areaFill)"/><path d="M0,150 C30,128 45,136 72,114 S115,122 140,88 S190,113 218,88 S257,89 283,54 S325,81 354,64 S394,40 424,58 S472,71 498,30 S545,56 620,14" fill="none" stroke="#3776ff" strokeWidth="4" strokeLinecap="round"/></svg><Box className="chartLabels"><span>Oct 28</span><span>Nov 04</span><span>Nov 11</span><span>Nov 18</span><span>Nov 25</span></Box></Box></Box><Box className="chartLegend"><span><i className="blueDot" />Engagement</span><strong>48,240 <em>+12.8%</em></strong></Box></Box>
      <Box className="panel schedulePanel"><Box className="panelHeader"><Box><Typography className="panelTitle">Up next</Typography><Typography className="panelHint">Today · {todayDate}</Typography></Box><Button size="small" className="textAction" href="/content">View calendar</Button></Box><Box className="scheduleList">{schedule.map(item => <Box className="scheduleItem" key={item.time}><Typography className="scheduleTime">{item.time}</Typography><Box className="scheduleLine"><i /></Box><Box className="scheduleCopy"><Typography>{item.title}</Typography><Chip size="small" label={item.state} className={`scheduleChip ${item.platform}`} /></Box><IconButton size="small"><MoreHoriz /></IconButton></Box>)}</Box></Box>
    </Box>
  </Box>
}
