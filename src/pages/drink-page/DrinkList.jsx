import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, CircularProgress, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel, IconButton, Button } from '@mui/material';
import { getDrinks } from '../../libs/services/DrinkService';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';

// Copy các styled components từ BarDetail.jsx
const DrinkCard = styled(Box)({
  backgroundColor: 'white',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  height: '200px',
  display: 'flex',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '30%',
    height: '100%',
    background: 'linear-gradient(to left, #9b51e0, transparent)',
    borderTopRightRadius: '20px',
    borderBottomRightRadius: '20px',
  },
});

const DrinkImage = styled('img')({
  width: '150px',
  height: '150px',
  objectFit: 'contain',
  marginLeft: '-30px',
  transform: 'rotate(-15deg)',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'rotate(-5deg) scale(1.1)',
  },
});

const DrinkContent = styled(Box)({
  padding: '20px',
  color: '#1a1a1a',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
});

const DrinkCategory = styled(Typography)({
  color: '#666',
  fontSize: '0.9rem',
  marginBottom: '4px',
});

const DrinkIngredients = styled(Typography)({
  color: '#666',
  fontSize: '0.85rem',
  marginTop: '8px',
  display: '-webkit-box',
  WebkitLineClamp: 3,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flex: 1,
});

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: '2rem',
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  }
}));

const SearchField = styled(TextField)({
  flex: 2,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: '10px',
    '& fieldset': {
      borderColor: '#9b51e0',
    },
    '&:hover fieldset': {
      borderColor: '#9b51e0',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9b51e0',
    },
    '& input': {
      padding: '12px 14px',
    },
    '& .MuiInputAdornment-root': {
      marginLeft: '8px',
    }
  },
});

const FilterSelect = styled(FormControl)(({ theme }) => ({
  flex: 1,
  minWidth: 180,
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    borderRadius: '10px',
    height: '45px',
    '& fieldset': {
      borderColor: '#9b51e0',
    },
    '&:hover fieldset': {
      borderColor: '#9b51e0',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#9b51e0',
    },
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '100%',
  }
}));

const NoResultsBox = styled(Box)({
  textAlign: 'center',
  padding: '2rem',
  color: '#666',
});

const SearchButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#9b51e0',
  color: 'white',
  height: '45px',
  padding: '0 30px',
  '&:hover': {
    backgroundColor: '#7b3dad',
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
  }
}));

const DrinkList = () => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [attribute, setAttribute] = useState('name');
  const [sort, setSort] = useState('');
  const [sortAttribute, setSortAttribute] = useState('');
  const [pageIndex, setPageIndex] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [tempAttribute, setTempAttribute] = useState('name');
  const [tempSort, setTempSort] = useState('');
  const [tempSortAttribute, setTempSortAttribute] = useState('');
  const pageSize = 10;

  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
    setAttribute(tempAttribute);
    setSort(tempSort);
    setSortAttribute(tempSortAttribute);
    setPageIndex(0);
  };

  const handleResetFilters = () => {
    setTempSearchQuery('');
    setTempAttribute('name');
    setTempSort('');
    setTempSortAttribute('');
    setSearchQuery('');
    setAttribute('name');
    setSort('');
    setSortAttribute('');
    setPageIndex(0);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const fetchDrinks = async () => {
      try {
        setLoading(true);
        const response = await getDrinks(
          pageIndex + 1,
          pageSize,
          searchQuery,
          sortAttribute || attribute,
          sort
        );
        
        if (isSubscribed && response?.code === 200 && response.data) {
          setDrinks(response.data.content);
          setTotalItems(response.data.totalElements);
        }
      } catch (error) {
        console.error('Error fetching drinks:', error);
        if (isSubscribed) {
          setDrinks([]);
          setTotalItems(0);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchDrinks();

    return () => {
      isSubscribed = false;
    };
  }, [searchQuery, attribute, sort, sortAttribute, pageIndex]);

  const handleSortChange = (event) => {
    const value = event.target.value;
    if (!value) {
      setTempSort('');
      setTempSortAttribute('');
    } else {
      const [attr, sortType] = value.split(',');
      setTempSortAttribute(attr);
      setTempSort(sortType);
    }
  };

  return (
    <Box sx={{ 
      backgroundColor: '#1a1a1a', 
      minHeight: '100vh',
      pt: { xs: '100px', sm: '120px' },
      pb: { xs: 4, sm: 6 } 
    }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          sx={{
            color: '#9b51e0',
            fontWeight: 700,
            mb: 4,
            textAlign: 'center',
            fontSize: { xs: '1.8rem', sm: '2.5rem' }
          }}
        >
          THỨC UỐNG
        </Typography>

        <SearchContainer>
          <SearchField
            fullWidth
            placeholder="Tìm kiếm thức uống..."
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#9b51e0' }} />
                </InputAdornment>
              ),
              endAdornment: tempSearchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setTempSearchQuery('')}
                    sx={{ color: '#666' }}
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <FilterSelect size="small">
            <InputLabel>Tìm kiếm theo</InputLabel>
            <Select
              value={tempAttribute}
              label="Tìm kiếm theo"
              onChange={(e) => setTempAttribute(e.target.value)}
            >
              <MenuItem value="name">Tên đồ uống</MenuItem>
              <MenuItem value="description">Mô tả</MenuItem>
              <MenuItem value="price">Giá</MenuItem>
              <MenuItem value="category">Danh mục</MenuItem>
            </Select>
          </FilterSelect>

          <FilterSelect size="small">
            <InputLabel>Sắp xếp</InputLabel>
            <Select
              value={tempSortAttribute ? `${tempSortAttribute},${tempSort}` : ''}
              label="Sắp xếp"
              onChange={handleSortChange}
            >
              <MenuItem value="">Mặc định</MenuItem>
              <MenuItem value="name,asc">Tên A-Z</MenuItem>
              <MenuItem value="name,desc">Tên Z-A</MenuItem>
              <MenuItem value="price,asc">Giá thấp đến cao</MenuItem>
              <MenuItem value="price,desc">Giá cao đến thấp</MenuItem>
            </Select>
          </FilterSelect>

          <SearchButton
            variant="contained"
            onClick={handleSearch}
            startIcon={<SearchIcon />}
          >
            Tìm kiếm
          </SearchButton>

          {(searchQuery || attribute !== 'name' || sort) && (
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              startIcon={<FilterListOffIcon />}
              sx={{
                borderColor: '#9b51e0',
                color: '#9b51e0',
                height: '45px',
                '&:hover': {
                  borderColor: '#7b3dad',
                  backgroundColor: 'rgba(155, 81, 224, 0.04)',
                }
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </SearchContainer>

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px' 
          }}>
            <CircularProgress sx={{ color: '#9b51e0' }} />
          </Box>
        ) : drinks.length > 0 ? (
          <>
            <Typography 
              sx={{ 
                color: '#666',
                mb: 2,
                textAlign: 'right',
                fontSize: '0.9rem'
              }}
            >
              Hiển thị {drinks.length} / {totalItems} kết quả
            </Typography>
            <Grid container spacing={4}>
              {drinks.map((drink) => (
                <Grid item xs={12} md={6} key={drink.id}>
                  <DrinkCard>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      width: '100%',
                      height: '100%'
                    }}>
                      <DrinkImage 
                        src={drink.image || '/default-drink-image.jpg'} 
                        alt={drink.name}
                        onError={(e) => {
                          e.target.src = '/default-drink-image.jpg';
                        }}
                      />
                      <DrinkContent>
                        <DrinkCategory>
                          {drink.drinkCategory?.name || 'Uncategorized'}
                        </DrinkCategory>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            fontSize: '1.1rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {drink.name}
                        </Typography>
                        <DrinkIngredients>
                          {drink.description}
                        </DrinkIngredients>
                        <Typography 
                          sx={{ 
                            color: '#9b51e0', 
                            fontWeight: 600,
                            fontSize: '1rem',
                            marginTop: 'auto'
                          }}
                        >
                          {drink.price?.toLocaleString()}đ
                        </Typography>
                      </DrinkContent>
                    </Box>
                  </DrinkCard>
                </Grid>
              ))}
            </Grid>
          </>
        ) : (
          <NoResultsBox>
            <Typography variant="h6" sx={{ color: '#9b51e0', mb: 1 }}>
              Không tìm thấy kết quả
            </Typography>
            <Typography>
              Vui lòng thử tìm kiếm với từ khóa khác
            </Typography>
          </NoResultsBox>
        )}
      </Container>
    </Box>
  );
};

export default DrinkList;
