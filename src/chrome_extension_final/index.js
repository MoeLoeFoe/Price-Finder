function createStarRating(rating) {
    const totalStars = 5;
    const filledStars = rating / 2;
    const starWrapper = document.createElement('div');
    starWrapper.style.display = 'flex';
    starWrapper.style.alignItems = 'center';

    for (let i = 0; i < totalStars; i++) {
        const star = document.createElement('span');
        star.style.fontSize = '24px';
        star.style.marginRight = '4px';
        star.style.color = i < filledStars ? '#FFD700' : '#ccc';
        star.innerHTML = '&#9733;';
        starWrapper.appendChild(star);
    }

    return starWrapper;
}

function createApp() {
    const appWrapper = document.createElement('div');
    appWrapper.style.display = 'flex';
    appWrapper.style.flexDirection = 'column';
    appWrapper.style.alignItems = 'center';
    appWrapper.style.fontFamily = 'Monaco, Monospace';
    appWrapper.style.fontSize = '22px';

    const header = document.createElement('header');
    header.style.backgroundColor = '#6666ff';
    header.style.padding = '10px';
    header.style.width = '100%';
    header.style.textAlign = 'center';
    header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    header.style.color = '#ffffff';

    const titleWrapper = document.createElement('div');
    titleWrapper.style.display = 'flex';
    titleWrapper.style.alignItems = 'center';

    const logo = document.createElement('img');
    logo.src = './assets/easyCompare.png';
    logo.style.width = '135px';
    logo.style.height = '135px';
    logo.style.marginLeft = '700px';

    const title = document.createElement('h1');
    title.textContent = 'easyCompare';
    title.style.fontFamily = '\'Marcellus SC\', serif';
    title.style.fontSize = '3rem';
    title.style.marginRight = '700px';
    title.style.width = '100%';
    title.style.display = 'inline-block';
    title.style.color = '#ffffff';
    title.style.position = 'relative';

    titleWrapper.appendChild(logo);
    titleWrapper.appendChild(title);
    header.appendChild(titleWrapper);
    appWrapper.appendChild(header);

    const main = document.createElement('main');
    main.style.width = '80%';
    main.style.marginTop = '20px';
    appWrapper.appendChild(main);

    const sortContainer = document.createElement('div');

    const sortByPriceButton = document.createElement('button');
    sortByPriceButton.textContent = 'Sort by Price';
    sortByPriceButton.style.backgroundColor = '#6666ff';
    sortByPriceButton.style.color = 'white';
    sortByPriceButton.style.border = 'none';
    sortByPriceButton.style.padding = '10px 20px';
    sortByPriceButton.style.margin = '4px 2px';
    sortByPriceButton.style.cursor = 'pointer';
    sortByPriceButton.style.borderRadius = '8px';
    sortByPriceButton.style.transition = 'background-color 0.3s ease';
    sortByPriceButton.addEventListener('click', () => sortProducts('price'));

    const sortByRatingButton = document.createElement('button');
    sortByRatingButton.textContent = 'Sort by Rating';
    sortByRatingButton.style.backgroundColor = '#6666ff';
    sortByRatingButton.style.color = 'white';
    sortByRatingButton.style.border = 'none';
    sortByRatingButton.style.padding = '10px 20px';
    sortByRatingButton.style.margin = '4px 2px';
    sortByRatingButton.style.cursor = 'pointer';
    sortByRatingButton.style.borderRadius = '8px';
    sortByRatingButton.style.transition = 'background-color 0.3s ease';
    sortByRatingButton.addEventListener('click', () => sortProducts('rating'));

    const sortByCombinedButton = document.createElement('button');
    sortByCombinedButton.textContent = 'Sort by Combined Score';
    sortByCombinedButton.style.backgroundColor = '#6666ff';
    sortByCombinedButton.style.color = 'white';
    sortByCombinedButton.style.border = 'none';
    sortByCombinedButton.style.padding = '10px 20px';
    sortByCombinedButton.style.margin = '4px 2px';
    sortByCombinedButton.style.cursor = 'pointer';
    sortByCombinedButton.style.borderRadius = '8px';
    sortByCombinedButton.style.transition = 'background-color 0.3s ease';
    sortByCombinedButton.addEventListener('click', () => sortProducts('combined'));

    sortContainer.appendChild(sortByPriceButton);
    sortContainer.appendChild(sortByRatingButton);
    sortContainer.appendChild(sortByCombinedButton);

    main.appendChild(sortContainer);

    const section = document.createElement('section');
    section.id = 'search-results';
    main.appendChild(section);

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '0px';
    table.style.backgroundColor = '#ffffff';
    section.appendChild(table);

    const thead = document.createElement('thead');
    table.appendChild(thead);

    const headerRow = document.createElement('tr');
    thead.appendChild(headerRow);

    const headers = ['', 'Price ₪', 'Description', 'Store', '', 'Rating', '', ''];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '10px';
        th.style.textAlign = 'left';
        th.style.borderBottom = '1px solid #ddd';
        th.style.backgroundColor = '#f1f1f1';
        headerRow.appendChild(th);
    });

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    const results = localStorage.getItem('searchResults');
    if (results) {
        const sortedProducts = JSON.parse(results);
        sortedProducts.forEach(item => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.addEventListener('mouseover', () => {
                row.style.backgroundColor = '#f5f5f5';
            });
            row.addEventListener('mouseout', () => {
                row.style.backgroundColor = '';
            });

            const tdImage = document.createElement('td');
            const image = document.createElement('img');
            image.src = item.image;
            image.style.width = '100px';
            image.style.height = '100px';
            image.style.objectFit = 'contain';
            tdImage.appendChild(image);
            row.appendChild(tdImage);

            const tdPrice = document.createElement('td');
            tdPrice.textContent = item.price.replace('ILS', '₪');
            tdPrice.style.whiteSpace = 'nowrap';
            tdPrice.style.width = '100px';
            row.appendChild(tdPrice);

            const tdDescription = document.createElement('td');
            tdDescription.textContent = item.productName;
            tdDescription.style.maxWidth = '500px';
            tdDescription.style.whiteSpace = 'nowrap';
            tdDescription.style.overflow = 'hidden';
            tdDescription.style.textOverflow = 'ellipsis';
            row.appendChild(tdDescription);

            const tdStore = document.createElement('td');
            tdStore.textContent = item.storeName;
            row.appendChild(tdStore);

            const tdStoreLogo = document.createElement('td');
            if (item.logo) {
                const storeLogo = document.createElement('img');
                storeLogo.src = item.logo;
                storeLogo.style.width = '100px';
                storeLogo.style.height = '100px';
                storeLogo.style.objectFit = 'contain';
                tdStoreLogo.appendChild(storeLogo);
            }
            row.appendChild(tdStoreLogo);

            const tdRating = document.createElement('td');
            tdRating.appendChild(createStarRating(item.rating));
            row.appendChild(tdRating);

            const tdStoreButton = document.createElement('td');
            const storeButton = document.createElement('button');
            storeButton.textContent = 'Go to Store';
            storeButton.style.backgroundColor = '#6666ff';
            storeButton.style.color = 'white';
            storeButton.style.border = 'none';
            storeButton.style.padding = '10px 20px';
            storeButton.style.textAlign = 'center';
            storeButton.style.textDecoration = 'none';
            storeButton.style.display = 'inline-block';
            storeButton.style.fontSize = '16px';
            storeButton.style.margin = '4px 2px';
            storeButton.style.cursor = 'pointer';
            storeButton.style.borderRadius = '8px';
            storeButton.style.transition = 'background-color 0.3s ease';
            storeButton.addEventListener('click', () => {
                window.location.href = item.link;
            });
            storeButton.addEventListener('mouseover', () => {
                storeButton.style.backgroundColor = '#0056b3';
            });
            storeButton.addEventListener('mouseout', () => {
                storeButton.style.backgroundColor = '#6666ff';
            });
            tdStoreButton.appendChild(storeButton);
            row.appendChild(tdStoreButton);

            tbody.appendChild(row);
        });
    } else {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'No search results found.';
        section.appendChild(noResultsMessage);
    }

    document.body.appendChild(appWrapper);
}

function normalize(value, min, max) {
    return (value - min) / (max - min);
}

function calculateCombinedScore(price, rating, minPrice, maxPrice, minRating, maxRating) {
    const normalizedPrice = normalize(price, minPrice, maxPrice);
    const normalizedRating = normalize(rating, minRating, maxRating);
    return normalizedRating - normalizedPrice;
}

function sortProducts(criteria) {
    const results = localStorage.getItem('searchResults');
    if (!results) return;

    const data = JSON.parse(results);
    const prices = data.map(item => parseFloat(item.price.replace(/[^\d.-]/g, '')));
    const ratings = data.map(item => parseFloat(item.rating));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);

    const sortedProducts = [...data].sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^\d.-]/g, ''));
        const priceB = parseFloat(b.price.replace(/[^\d.-]/g, ''));
        const rateA = parseFloat(a.rating);
        const rateB = parseFloat(b.rating);

        if (criteria === 'price') {
            return priceA - priceB;
        } else if (criteria === 'rating') {
            return rateB - rateA;
        } else if (criteria === 'combined') {
            const scoreA = calculateCombinedScore(priceA, rateA, minPrice, maxPrice, minRating, maxRating);
            const scoreB = calculateCombinedScore(priceB, rateB, minPrice, maxPrice, minRating, maxRating);
            return scoreB - scoreA;
        }
        return 0; // default return if no sorting criteria matches
    });

    localStorage.setItem('searchResults', JSON.stringify(sortedProducts));
    location.reload();
}

document.addEventListener('DOMContentLoaded', createApp);
