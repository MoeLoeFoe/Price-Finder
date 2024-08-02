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

function createSearchButton(productName) {
    const button = document.createElement('button');
    button.textContent = 'Search Product';
    button.className = 'search-product-button';

    button.addEventListener('click', async () => {
        button.textContent = 'Loading Results...';
        button.disabled = true;
        document.querySelectorAll('button').forEach(btn => btn.disabled = true);

        await searchProduct(productName, false);

        button.textContent = 'Search Product';
        button.disabled = false;
        document.querySelectorAll('button').forEach(btn => btn.disabled = false);
    });

    return button;
}

let currentSortCriteria = 'combined'; // Default sorting criteria

function createApp() {
    const appWrapper = document.createElement('div');
    appWrapper.style.display = 'flex';
    appWrapper.style.flexDirection = 'column';
    appWrapper.style.alignItems = 'center';
    appWrapper.style.fontFamily = 'Assistant, Arial, Monaco, Monospace';
    appWrapper.style.fontSize = '16px';

    const header = document.createElement('header');
    header.style.backgroundColor = '#E2F6FF';
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
    logo.style.width = '200px';
    logo.style.height = '200px';
    logo.style.marginLeft = '700px';

    const title = document.createElement('h1');
    title.style.fontFamily = 'Assistant, Arial, Monaco, Monospace';
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
    main.style.width = '85%';
    main.style.marginTop = '25px';

    appWrapper.appendChild(main);

    const sortContainer = document.createElement('div');
    sortContainer.classList.add('sort-container');

    const sortByLabel = document.createElement('span');
    sortByLabel.textContent = 'Sort by:';
    sortByLabel.style.marginRight = '10px';
    sortByLabel.style.fontFamily = 'Assistant, Arial, Monaco, Monospace';
    sortByLabel.style.fontSize = '16px';
    sortContainer.appendChild(sortByLabel);

    // Create the dropdown for sorting
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    const dropdownButton = document.createElement('button');
    dropdownButton.textContent = 'Combined Score (low price and high rating)';
    dropdownButton.style.fontSize = '16px';
    dropdownButton.style.backgroundColor = 'white';
    dropdownButton.style.color = 'black';
    dropdownButton.style.border = '1px solid #ccc';
    dropdownButton.style.padding = '5px 10px';
    dropdownButton.style.cursor = 'pointer';
    dropdownButton.style.borderRadius = '8px';
    dropdownButton.style.transition = 'background-color 0.3s ease';
    dropdown.appendChild(dropdownButton);

    const dropdownContent = document.createElement('div');
    dropdownContent.className = 'dropdown-content';
    const sortByPriceAscButton = document.createElement('button');
    sortByPriceAscButton.textContent = 'Price (low to high)';
    sortByPriceAscButton.addEventListener('click', () => sortProducts('priceAsc', dropdownButton));

    const sortByPriceDescButton = document.createElement('button');
    sortByPriceDescButton.textContent = 'Price (high to low)';
    sortByPriceDescButton.addEventListener('click', () => sortProducts('priceDesc', dropdownButton));

    const sortByRatingButton = document.createElement('button');
    sortByRatingButton.textContent = 'Rating (high to low)';
    sortByRatingButton.addEventListener('click', () => sortProducts('rating', dropdownButton));

    const sortByCombinedButton = document.createElement('button');
    sortByCombinedButton.textContent = 'Combined Score (low price and high rating)';
    sortByCombinedButton.addEventListener('click', () => sortProducts('combined', dropdownButton));

    dropdownContent.appendChild(sortByPriceAscButton);
    dropdownContent.appendChild(sortByPriceDescButton);
    dropdownContent.appendChild(sortByRatingButton);
    dropdownContent.appendChild(sortByCombinedButton);
    dropdown.appendChild(dropdownContent);
    sortContainer.appendChild(dropdown);

    const priceFilterContainer = document.createElement('div');
    priceFilterContainer.style.marginTop = '20px';

    const minPriceInput = document.createElement('input');
    minPriceInput.type = 'number';
    minPriceInput.placeholder = 'Min Price';
    minPriceInput.style.marginRight = '10px';

    const maxPriceInput = document.createElement('input');
    maxPriceInput.type = 'number';
    maxPriceInput.placeholder = 'Max Price';
    maxPriceInput.style.marginRight = '10px';

    const filterButton = document.createElement('button');
    filterButton.textContent = 'Filter by Price';
    filterButton.className = 'filter-button';
    filterButton.style.fontFamily = 'Assistant, Arial, Monaco, Monospace';
    filterButton.style.fontSize = '14px';
    filterButton.style.backgroundColor = '#009DE6';
    filterButton.style.color = 'white';
    filterButton.style.border = 'none';
    filterButton.style.padding = '2px 10px';
    filterButton.style.cursor = 'pointer';
    filterButton.style.borderRadius = '8px';
    filterButton.style.transition = 'background-color 0.3s ease';
    filterButton.addEventListener('mouseover', () => {
        filterButton.style.backgroundColor = '#0070A4';
    });
    filterButton.addEventListener('mouseout', () => {
        filterButton.style.backgroundColor = '#009DE6';
    });
    filterButton.addEventListener('click', () => filterByPrice(minPriceInput.value, maxPriceInput.value));

    const removeFilterButton = document.createElement('button');
    removeFilterButton.textContent = 'Remove Filter';
    removeFilterButton.style.fontFamily = 'Assistant, Arial, Monaco, Monospace';
    removeFilterButton.style.fontSize = '14px';
    removeFilterButton.style.backgroundColor = '#FF5733';
    removeFilterButton.style.color = 'white';
    removeFilterButton.style.border = 'none';
    removeFilterButton.style.padding = '2px 10px';
    removeFilterButton.style.cursor = 'pointer';
    removeFilterButton.style.borderRadius = '8px';
    removeFilterButton.style.transition = 'background-color 0.3s ease';
    removeFilterButton.style.marginLeft = '10px';
    removeFilterButton.addEventListener('mouseover', () => {
        removeFilterButton.style.backgroundColor = '#D52626';
    });
    removeFilterButton.addEventListener('mouseout', () => {
        removeFilterButton.style.backgroundColor = '#FF5733';
    });
    removeFilterButton.addEventListener('click', () => {
        const originalResults = localStorage.getItem("originalResults");
        if (originalResults) {
            localStorage.setItem('searchResults', originalResults);
            sortProducts(currentSortCriteria, dropdownButton); // Reapply current sorting
        }
    });

    priceFilterContainer.appendChild(minPriceInput);
    priceFilterContainer.appendChild(maxPriceInput);
    priceFilterContainer.appendChild(filterButton);
    priceFilterContainer.appendChild(removeFilterButton);

    sortContainer.appendChild(priceFilterContainer);

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

    const headers = ['', 'Price', 'Description', 'Store', 'Store Rating', '',''];
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

    document.body.appendChild(appWrapper);

    performSearch();
}

function filterByPrice(minPrice, maxPrice) {
    const results = localStorage.getItem("originalResults");
    if (!results) return;

    const data = JSON.parse(results);
    const filteredProducts = data.filter(item => {
        const price = parseFloat(item.price.replace(/[^\d.-]/g, ''));
        return (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
    });

    localStorage.setItem('searchResults', JSON.stringify(filteredProducts));
    sortProducts(currentSortCriteria, null); // Reapply current sorting
}

function normalize(value, min, max) {
    return (value - min) / (max - min);
}

function calculateCombinedScore(price, rating, minPrice, maxPrice, minRating, maxRating) {
    const normalizedPrice = normalize(price, minPrice, maxPrice);
    const normalizedRating = normalize(rating, minRating, maxRating);
    return normalizedRating - normalizedPrice;
}

function sortProducts(criteria, dropdownButton) {
    currentSortCriteria = criteria; // Update current sort criteria

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

        if (criteria === 'priceAsc') {
            return priceA - priceB;
        } else if (criteria === 'priceDesc') {
            return priceB - priceA;
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
    if (dropdownButton) {
        dropdownButton.textContent = {
            'priceAsc': 'Price (low to high)',
            'priceDesc': 'Price (high to low)',
            'rating': 'Rating (high to low)',
            'combined': 'Combined Score (low price and high rating)'
        }[criteria];
    }

    renderProducts();
}

function renderProducts() {
    const section = document.getElementById('search-results');
    const table = section.querySelector('table');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing rows

    const results = localStorage.getItem('searchResults');
    if (results) {
        const sortedProducts = JSON.parse(results);
        sortedProducts.forEach(item => {
            const row = document.createElement('tr');
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
            tdPrice.textContent = item.price.replace('ILS', '₪').replace('NIS', '₪');
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
            storeButton.style.fontFamily = 'Assistant, Arial, sans-serif';
            storeButton.style.backgroundColor = '#009DE6';
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
                chrome.tabs.create({ url: (item.link) });
            });
            storeButton.addEventListener('mouseover', () => {
                storeButton.style.backgroundColor = '#0070A4';
            });
            storeButton.addEventListener('mouseout', () => {
                storeButton.style.backgroundColor = '#009DE6';
            });
            tdStoreButton.appendChild(storeButton);
            row.appendChild(tdStoreButton);

            const tdSearchButton = document.createElement('td');
            row.appendChild(tdSearchButton);

            tbody.appendChild(row);
        });
    } else {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = 'No search results found.';
        section.appendChild(noResultsMessage);
    }
}

function createSimilarProductsSection() {
    const similarProductsResult = localStorage.getItem('similarProductsResult');
    if (!similarProductsResult) return;

    const similarProducts = JSON.parse(similarProductsResult);
    if (similarProducts.length === 0) return;

    const similarProductsSection = document.createElement('section');
    similarProductsSection.id = 'similar-products';
    similarProductsSection.style.width = '100%';
    similarProductsSection.style.marginTop = '60px';

    const similarProductsTitle = document.createElement('h2');
    similarProductsTitle.textContent = 'Similar Products';
    similarProductsTitle.style.textAlign = 'center';
    similarProductsSection.appendChild(similarProductsTitle);

    const similarProductsContainer = document.createElement('div');
    similarProductsContainer.style.display = 'flex';
    similarProductsContainer.style.flexWrap = 'wrap';
    similarProductsContainer.style.justifyContent = 'center';
    similarProductsSection.appendChild(similarProductsContainer);

    similarProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.style.border = '1px solid #ddd';
        productCard.style.borderRadius = '8px';
        productCard.style.padding = '10px';
        productCard.style.margin = '10px';
        productCard.style.width = '160px'; // Increased width
        productCard.style.textAlign = 'center';

        const productImage = document.createElement('img');
        productImage.src = product.image;
        productImage.style.width = '140px'; // Increased width
        productImage.style.height = '140px'; // Increased height
        productImage.style.objectFit = 'contain';
        productCard.appendChild(productImage);

        const productName = document.createElement('p');
        productName.textContent = product.productName;
        productName.style.fontSize = '14px';
        productName.style.marginTop = '10px'; // Add margin to separate the text from the image
        productCard.appendChild(productName);

        const searchButton = createSearchButton(product.productName);
        productCard.appendChild(searchButton);

        similarProductsContainer.appendChild(productCard);
    });

    document.querySelector('main').appendChild(similarProductsSection);
}

function performSearch(searchTerm = '') {
    const originalResults = localStorage.getItem("originalResults");
    if (!originalResults) return;

    const data = JSON.parse(originalResults);
    let searchResults;

    if (searchTerm) {
        searchResults = data.filter(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    } else {
        searchResults = data;
    }

    localStorage.setItem('searchResults', JSON.stringify(searchResults));
    sortProducts(currentSortCriteria, null); // Reapply current sorting
}

document.addEventListener('DOMContentLoaded', () => {
    createApp();
    createSimilarProductsSection();
});
