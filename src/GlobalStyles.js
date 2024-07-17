import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    background-color: #f7f7f7;
  }

  * {
    box-sizing: inherit;
  }
`;

export default GlobalStyles;