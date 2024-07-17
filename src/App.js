import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import data from './data.json'; // Importing the JSON file

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Arial, sans-serif;
`;

const Header = styled.header`
  background-color: #282c34;
  padding: 20px;
  width: 100%;
  text-align: center;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
`;

const Main = styled.main`
  width: 80%;
  margin-top: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  background-color: #f1f1f1;
`;

const Td = styled.td`
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: #f5f5f5;
  }
`;

const Image = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
`;

const Description = styled.div`
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(data); // Setting the imported data to state
  }, []);

  return (
    <AppWrapper>
      <Header>
        <Title>Best Price Finder</Title>
      </Header>
      <Main>
        <section id="search-results">
          <Table>
            <thead>
              <tr>
                <Th>Ranking</Th>
                <Th>Store</Th>
                <Th>Price (ILS)</Th>
                <Th>Image</Th>
                <Th>Description</Th>
              </tr>
            </thead>
            <tbody>
              {products.map((item, index) => (
                <TableRow key={index}>
                  <Td>{index + 1}</Td>
                  <Td><a href={item[1]} target="_blank" rel="noopener noreferrer">{item[1]}</a></Td>
                  <Td>{item[2]}</Td>
                  <Td><Image src={item[3]} alt={item[0]} /></Td>
                  <Td><Description>{item[0]}</Description></Td>
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