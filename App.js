import "./style.css"
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Unstable_Grid2'

function App() {
  return (
    <div className="App">
        <body>
      <Box sx={{ width: '100%', maxWidth: 500 }}>
        <Typography variant="h1" gutterBottom>
          panda.
        </Typography>
        <Typography variant="h3" gutterBottom>
          ReFi for the your farm.
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid xs={8}>
            <Typography variant="h1" gutterBottom>
              Map. W
            </Typography>
          </Grid>
          <Grid xs={4}>
            <Typography variant="h1" gutterBottom>
              Stats.
            </Typography>
          </Grid>
        </Grid>
      </Box>
      </body>
    </div>
  )
}

export default App
