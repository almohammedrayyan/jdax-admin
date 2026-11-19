import { Box, Typography } from '@mui/material'; import LiveFeedPage from './LiveFeedPage'; import ContentPage from './ContentPage'
export default function DashboardPage(){return <Box className="contentPage"><Typography variant="h4" sx={{mb:3}}>Social Dashboard</Typography><Box className="dashboardGrid"><LiveFeedPage/><ContentPage/></Box></Box>}
