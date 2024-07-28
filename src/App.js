import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import data from './data.json'; // Importing the JSON file
import logo from './assets/easyCompare.png'

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Monaco, Monospace;
  font-size: 22px;
`;

const Header = styled.header`
  background-color: #6666ff;
  padding: 20px;
  width: 100%;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #ffffff; 
`;
const Logo= styled.img`
  width: 135px;
  height: 135px;
  margin-left:700px;
`;
const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;


const Title = styled.h1`
   display: flex;
    font-family: 'Marcellus SC', serif;
    font-size:3rem;
    margin-right:700px;
    width:100%;
    display: inline-block;
    color:#ffffff;
    position:relative;   
`;

const Main = styled.main`
  width: 80%;
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0px;
  background-color: #ffffff;
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  background-color: #f1f1f1;
`;

const Td = styled.td`
  padding: 20px;
  text-align: left;
  border-bottom: 1px solid #ddd;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f5f5f5;
  }
`;

const Image = styled.img`
  width: 125px;
  height: 125px;
  object-fit: cover;
`;

const Description = styled.div`
  max-width: 500px;
  white-space: wrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Price = styled(Td)`
  white-space: nowrap;
  width: 100px;
`;

const Store = styled(Td)`
  width: 150px;
`;

const StoreButton = styled.button`
  background-color: #6666ff;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;
const SortButton = styled.button`
  background-color: #ffffff;
  color: #6666ff;
  border: 2px solid #6666ff;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #6666ff;
    color: white;
  }
`;

function App() {
  const [products, setProducts] = useState([]);
  const [sortPreference, setSortPreference] = useState('price');

  useEffect(() => {
    const sortedProducts = data.sort((a, b) => {
      const priceA = parseFloat(a.price.replace(/[^\d.-]/g, ''));
      const priceB = parseFloat(b.price.replace(/[^\d.-]/g, ''));

      if (sortPreference === 'price') {
        if (priceA !== priceB) {
          return priceA - priceB;
        } else {
          const rateA = parseFloat(a.rating);
          const rateB = parseFloat(b.rating);
          return rateA - rateB;
        }
      } else {
        const rateA = parseFloat(a.rating);
        const rateB = parseFloat(b.rating);

        if (rateA !== rateB) {
          return rateA - rateB;
        } else {
          return priceA - priceB;
        }
      }
    });

    setProducts(sortedProducts);
  }, [sortPreference]);

  return (
    <AppWrapper>
      <Header>     
      <TitleWrapper>
          <Logo src={logo} alt="Logo" />
          <Title>easyCompare</Title>
        </TitleWrapper>
      </Header>
      <Main>
      <div>
          <SortButton onClick={() => setSortPreference('price')}>Sort by Price</SortButton>
          <SortButton onClick={() => setSortPreference('rating')}>Sort by Rating</SortButton>
        </div>
        <section id="search-results">
          <Table>
            <thead>
              <tr>
                <Th></Th>
                <Th>Price ₪ </Th>
                <Th></Th>
                <Th></Th>
                <Th></Th>
                <Th></Th>
                <Th>Description</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, index) => (
                <TableRow key={index}>
                  <Td><Image src={item[3]} alt={item[0]} /></Td>
                  <Price>{item[2]}</Price>
                  <Td></Td>
                  <Td></Td>
                  <Td></Td>
                  <Td></Td>
                  <Td><Description>{item[0]}</Description></Td>
                  <Store>
                    <StoreButton onClick={() => window.location.href = item[1]}>
                      Go to Store
                    </StoreButton>
                  </Store>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </section>
      </Main>
    </AppWrapper>
  );
}

export default App;
