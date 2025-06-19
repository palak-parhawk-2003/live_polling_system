// src/pages/Landing.jsx
import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material'
import StarsIcon from '@mui/icons-material/Stars'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState(null)

  const handleContinue = () => {
    if (selectedRole === 'student') navigate('/student')
    if (selectedRole === 'teacher') navigate('/teacher')
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="background.default"
      px={2}
    >
      <Button
        startIcon={<StarsIcon />}
        variant="contained"
        color="secondary"
        sx={{ mb: 2, borderRadius: 8, textTransform: 'none' }}
      >
        Intervue Poll
      </Button>

      <Typography variant="h4" textAlign="center" mb={1}>
        Welcome to the <b>Live Polling System</b>
      </Typography>

      <Typography variant="body2" textAlign="center" mb={4} maxWidth={480}>
        Please select the role that best describes you to begin using the live polling system
      </Typography>

      <Grid container spacing={2} justifyContent="center" maxWidth={600}>
        <Grid item xs={12} md={5}>
          <Card
            variant="outlined"
            sx={{
              borderColor: selectedRole === 'student' ? 'primary.main' : 'divider',
              borderWidth: 2,
              cursor: 'pointer',
            }}
            onClick={() => setSelectedRole('student')}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                I’m a Student
              </Typography>
              <Typography variant="body2">
                Submit answers to polls!
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card
            variant="outlined"
            sx={{
              borderColor: selectedRole === 'teacher' ? 'primary.main' : 'divider',
              borderWidth: 2,
              cursor: 'pointer',
            }}
            onClick={() => setSelectedRole('teacher')}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                I’m a Teacher
              </Typography>
              <Typography variant="body2">
                Generate poll and view live poll results in real-time.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        size="large"
        sx={{ mt: 4, px: 5, borderRadius: 8 }}
        onClick={handleContinue}
        disabled={!selectedRole}
      >
        Continue
      </Button>
    </Box>
  )
}
