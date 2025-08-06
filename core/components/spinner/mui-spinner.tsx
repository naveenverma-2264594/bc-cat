import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export default function MuiSpinner() {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
}