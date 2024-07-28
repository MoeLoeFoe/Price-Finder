// StarRating.js
import React from 'react';
import styled from 'styled-components';

const StarWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Star = styled.span`
  font-size: 24px;
  color: ${({ filled }) => (filled === "true" ? '#FFD700' : '#ccc')}; // Gold color for filled stars, grey for empty stars
  margin-right: 4px;
`;

const StarRating = ({ rating }) => {
  const totalStars = 5;
  const filledStars = rating / 2;
  
  return (
    <StarWrapper>
      {[...Array(totalStars)].map((_, index) => (
        <Star key={index} filled={(index < filledStars).toString()}>
          &#9733;
        </Star>
      ))}
    </StarWrapper>
  );
};

export default StarRating;