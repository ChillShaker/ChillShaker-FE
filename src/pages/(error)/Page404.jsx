import React from 'react';
import Button from '@mui/material/Button'; // Import MUI Button component

const Page404 = () => {
  return (
    <section className="page_404 py-10 bg-white font-serif select-none">
      <div className="container mx-auto">
        <div className="row">
          <div className="col-sm-12">
            <div className="col-sm-10 mx-auto text-center">
              <div 
                className="four_zero_four_bg bg-center bg-cover h-96 mb-10"
                style={{
                  backgroundImage: "url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')"
                }}
              >
                <h1 className="text-center text-6xl">404</h1>
              </div>
              <div className="contant_box_404 mt-10">
                <h3 className="text-4xl">Look like you're lost</h3>
                <p className="text-lg">The page you are looking for is not available!</p>
                <Button 
                  variant="contained" 
                  href="/home" 
                  sx={{ 
                    backgroundColor: '#39ac31', // Set background color to match the original
                    '&:hover': {
                      backgroundColor: '#2e8b28', // Darker green on hover
                    },
                    mt: 2,
                  }}
                >
                  Go to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Page404;