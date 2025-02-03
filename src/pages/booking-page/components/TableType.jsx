import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getTableTypes } from '../../../libs/services/TableTypeService';

const StyledContainer = styled(Container)(({ theme }) => ({
  backgroundColor: 'transparent',
  padding: '24px',
  marginTop: '24px',
  marginBottom: '24px',
}));

const TableTypeCard = styled(Box)({
  marginBottom: '48px',
  '&:last-child': {
    marginBottom: 0,
  },
});

const ImageContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '300px',
  overflow: 'hidden',
  borderRadius: '12px',
});

const StyledImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const ContentBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const InfoList = styled(Box)({
  marginTop: '24px',
});

const InfoItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '16px',
  '&:last-child': {
    marginBottom: 0,
  },
});

const InfoLabel = styled(Typography)({
  color: '#9b51e0',
  fontSize: '0.9rem',
  fontWeight: 500,
  marginBottom: '4px',
});

const InfoValue = styled(Typography)({
  color: '#fff',
  fontSize: '0.9rem',
});

const TableType = () => {
  const [tableTypes, setTableTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTableTypes = async () => {
      try {
        const response = await getTableTypes();
        if (response.code === 200 && response.data.content) {
          setTableTypes(response.data.content);
        }
      } catch (error) {
        console.error('Error fetching table types:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTableTypes();
  }, []);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        color: '#9b51e0' 
      }}>
        Đang tải...
      </Box>
    );
  }

  if (!Array.isArray(tableTypes) || tableTypes.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        color: '#fff' 
      }}>
        Không có dữ liệu loại bàn
      </Box>
    );
  }

  return (
    <StyledContainer maxWidth="lg">
      {tableTypes.map((type, index) => (
        <TableTypeCard key={type.id || index}>
          <Typography
            variant="h4"
            sx={{
              color: '#fff',
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '1.6rem', sm: '2rem' },
              textTransform: 'uppercase'
            }}
          >
            {type.name}
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <ImageContainer>
                <StyledImage
                  src={type.image || '/default-table-image.jpg'}
                  alt={type.name}
                  loading="lazy"
                />
              </ImageContainer>
            </Grid>

            <Grid item xs={12} md={5}>
              <ContentBox>
                <Box sx={{ 
                  backgroundColor: 'rgba(20, 20, 20, 0.6)',
                  borderRadius: '12px',
                  border: '1px solid rgba(155, 81, 224, 0.2)',
                  padding: '0px 20px 20px 20px',
                }}>

                  <InfoList>
                    <InfoItem>
                      <InfoLabel>Mô tả</InfoLabel>
                      <InfoValue>{type.description} người</InfoValue>
                    </InfoItem>

                    <InfoItem>
                      <InfoLabel>Sức chứa</InfoLabel>
                      <InfoValue>{type.capacity} người</InfoValue>
                    </InfoItem>

                    <InfoItem>
                      <InfoLabel>Đặt cọc</InfoLabel>
                      <InfoValue>{type.depositAmount?.toLocaleString()} VNĐ</InfoValue>
                    </InfoItem>
                  </InfoList>
                </Box>
              </ContentBox>
            </Grid>
          </Grid>
        </TableTypeCard>
      ))}
    </StyledContainer>
  );
};

export default TableType;
