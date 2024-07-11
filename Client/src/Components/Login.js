import React from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
 
const Login = () => {
    const navigate = useNavigate();
  return (
    <div style={{ backgroundColor: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container maxWidth="xs">
        <Box sx={{
          backgroundColor: '#111',
          padding: '40px',
          border: '1px solid #fff',
          borderRadius: '10px',
          boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
        }}>
          <Typography variant="h4" sx={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
            Login to Your Account
          </Typography>
 
          <form>
            <TextField
              type="email"
              variant="outlined"
              fullWidth
              placeholder="Enter Email ID"
              sx={{
                marginBottom: '20px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#fff',
                    borderRadius: '10px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#fff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#fff',
                  },
                },
              }}
              InputProps={{
                sx: { color: '#fff' },
              }}
              InputLabelProps={{ sx: { color: '#fff' } }}
            />
 
            <TextField
              type="password"
              variant="outlined"
              fullWidth
              placeholder="Enter Password"
              sx={{
                marginBottom: '20px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#fff',
                    borderRadius: '10px',
                  },
                  '&:hover fieldset': {
                    borderColor: '#fff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#fff',
                  },
                },
              }}
              InputProps={{
                sx: { color: '#fff' },
              }}
              InputLabelProps={{ sx: { color: '#fff' } }}
            />
 
            <Button
              onClick={()=>navigate("/dashboard")}
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{
                backgroundColor: '#fff',
                color: '#111',
                '&:hover': { backgroundColor: '#f2f2f2' },
                marginBottom: '20px',
              }}
            >
              Login
            </Button>
          </form>
 
          <Typography variant="body2" sx={{ color: '#fff', textAlign: 'center' }}>
            By using this app, you agree to our
            <span style={{ color: '#2196f3', paddingLeft: '4px' }}>
              Terms & Conditions
            </span>
          </Typography>
        </Box>
      </Container>
    </div>
  );
};
 
export default Login;