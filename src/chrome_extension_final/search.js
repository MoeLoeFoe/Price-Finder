async function isProductRelevant(productName, searchedTerm) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer sk-proj-pC1w17SsGCGxNsQD2vlyT3BlbkFJurphcYHzZDzxraTy7Dzg`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: `Is the product described in "${productName}" relevant to my search?, I am searching for "${searchedTerm}". Provide a simple "yes" or "no" answer. For example, if I'm looking for an iPhone, I want you to answer "yes" only if it is an iPhone, not a case for iPhone or anything like that.`
                    }
                ],
                max_tokens: 50
            })
        });

        const data = await response.json();
        const messageContent = data.choices[0].message.content.trim().toLowerCase();
        console.log("Product name:", productName, "Response:", messageContent);
        return messageContent === "yes";
    } catch (error) {
        console.error("Error querying OpenAI API:", error);
        return false;
    }
}

async function getSimilarProducts(productName) {
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer sk-proj-pC1w17SsGCGxNsQD2vlyT3BlbkFJurphcYHzZDzxraTy7Dzg`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: `Give me the names of 6 similar products to "${productName}". Return only the names, seperated by comma.`
                    }
                ],
                max_tokens: 50
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response for similar products:", data);

        const messageContent = data.choices[0].message.content.trim();
        console.log("Extracted message content:", messageContent);

        return messageContent;
    } catch (error) {
        console.error("Error fetching similar products:", error);
        return null;
    }
}

async function fetchStoreRating(storeQuery) {
    const response = await fetch(`http://localhost:8000/get_ratings?query=${encodeURIComponent(storeQuery)}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ratings for ${storeQuery}`);
    }
    return await response.json();
}

async function checkAvailability(link, store) {
    const response = await fetch(link);
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    if (store === "חשמל נטו") {
        const outOfStockElement = doc.querySelector('div.inventory-stock-info .stock.unavailable span');
        return !(outOfStockElement && outOfStockElement.textContent.includes("אזל מהמלאי"));
    } else if (store === "Mashbir") {
        const outOfStockElement = doc.querySelector('span[class*="אזל מהמלאי"]');
        return !outOfStockElement;
    } else if (store === "מחסני חשמל") {
        const outOfStockElement = doc.querySelector('div.outOfStock');
        return !(outOfStockElement && outOfStockElement.textContent.includes("אזל מהמלאי"));
    }
}

async function fetchPriceFromHtml(link, store) {
    try {
        const response = await fetch(link);
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        if (store === "Ivory") {
            // Check for out-of-stock message
            const outOfStockElement = doc.querySelector('div#cancelproduct.row.justify-content-center span[style*="font-size:22px;"]');
            if (outOfStockElement && outOfStockElement.textContent.includes("מוצר זה לא זמין")) {
                return null;
            }
            const priceElement = doc.querySelector('span.print-actual-price');
            if (priceElement) {
                const priceText = priceElement.textContent.trim();
                const currencyText = "₪";
                return `${priceText}${currencyText}`;
            }
            return null;

        } else if (store === "Lastprice") {
            const priceElement = doc.querySelector('div.d-inline.bold.lprice');
            if (priceElement) {
                const priceText = priceElement.textContent.trim();
                const priceMatch = priceText.match(/(\d[\d,.]*)\s*(₪)/);
                if (priceMatch) {
                    return priceMatch[0];
                }
            }
            return null;

        } else if (store === "Bug") {
            const addToCartElement = doc.querySelector('span[onclick^="addToCart"]');
            if (!addToCartElement) {
                return null;
            }
            const priceElement = doc.querySelector('div#product-price-container ins');
            if (priceElement) {
                return priceElement.textContent.trim();
            }
            return null;
        }
        else if (store === "KSP") {
            const priceDiv = document.querySelector('.current-0-3-208.redPrice-0-3-209');
            const priceText = priceDiv.textContent.trim();
            console.error(priceText);
            if (priceText) {
                return priceText;
            }
            return null;
        }

    } catch (error) {
        console.error('Error fetching price info:', error);
        return null;
    }
}

function getPriceFromMetatags(pagemap, field) {
    let price = null;
    let currency = null;
    if (pagemap.metatags) {
        const metatag = pagemap.metatags[0];
        if (field === "og") {
            price = metatag['og:price:amount'];
            currency = metatag['og:price:currency'];
        }
        else if (field === "product") {
            price = metatag['product:price:amount'];
            currency = metatag['product:price:currency'];
        }}
    if (price && currency) {
        price = price + currency;
    }
    return price;
}

function getPriceFromOffer(pagemap) {
    let price = null;
    if (pagemap.offer) {
        const offer = pagemap.offer[0];
        if (offer.availability === "https://schema.org/OutOfStock") {
            return null;
        }
        price = offer.price + offer.pricecurrency;
    }
    return price;
}
function getImageAndNameFromProduct(pagemap, field) {
    let image_url = null;
    let productName = null;
    if (pagemap.product) {
        const product_p = pagemap.product[0];
        image_url = product_p.image;
        productName = product_p.name;
    }
    return [productName, image_url];
}

function getInfoFromPagemap(pagemap, site) {
    let price = null;
    let image_url = null;
    let productName = null;
    let currency = null;

    if (site === "Mashbir" || site === "חשמל נטו" || site === "אמירים הפצה") {
        if (pagemap.metatags) {
            const metatag = pagemap.metatags[0];
            price = metatag['product:price:amount'];
            currency = metatag['product:price:currency'];
            if (!price && !currency) {
                price = metatag['og:price:amount'];
                currency = metatag['og:price:currency'];
            }
            image_url = metatag["og:image"];
            productName = metatag["og:title"];
        }
        if (site === "אמירים הפצה") {
            if (pagemap.thumbnail) {
                image_url = pagemap.thumbnail[0]["src"];
            }
        }

    } else if (site === "שופרסל" || site === "KSP") {
        if (pagemap.offer) {
            const offer = pagemap.offer[0];
            if (offer.availability === "https://schema.org/OutOfStock") {
                return [null, null, null];
            }
            price = offer.price + offer.pricecurrency;
        }
        if (pagemap.product) {
            const product_p = pagemap.product[0];
            image_url = product_p.image;
            productName = product_p.name;
        }
    } else if (site === "Bug") {
        if (pagemap.cse_thumbnail) {
            image_url = pagemap.cse_thumbnail[0]["src"];
        }
    }

    if (price && currency) {
        price = price + currency;
    }
    return [productName, price, image_url];
}

async function checkImageExistence(image_url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = image_url;
    });
}

function setButtonLoadingState(isLoading) {
    const searchButton = document.getElementById('searchButton');
    if (isLoading) {
        searchButton.textContent = 'Loading results...';
        searchButton.disabled = true;
    } else {
        searchButton.textContent = 'Search';
        searchButton.disabled = false;
    }
}

async function searchProduct(product, fromPopup) {
    if (fromPopup) {
        setButtonLoadingState(true);
    }
    const similarItems = await getSimilarProducts(product);
    const similarProductsArray = similarItems.split(',').map(name => name.trim());

    if (product) {
        const API_KEY = "AIzaSyASWi3gBfUE9X9aMPFl7a8Li9e0INTVKB8";

        function googleProductSearch(query, site, orTerms = "", numOfResults = 5, CSE_ID = "b3595db64cc714862") {
            const searchUrl = "https://customsearch.googleapis.com/customsearch/v1";
            const params = new URLSearchParams({
                q: query,
                key: API_KEY,
                cx: CSE_ID,
                orTerms: orTerms,
                siteSearch: site,
                siteSearchFilter: "i",
                num: numOfResults,
                fields: "items(title,link,pagemap)"
            });
            return fetch(`${searchUrl}?${params.toString()}`)
                .then(response => response.json());
        }

        async function extractProductInfo(item) {
            const pagemap = item.pagemap || {};
            const link = item.link;
            let title = item.title;
            let price = null;
            let image_url = null;
            let store_logo = null;
            let store_name = null;

            if (!await isProductRelevant(title, product)) {
                return null;
            }

            if (link.startsWith("https://ksp")) {
                store_name = "KSP";
                store_logo = "https://ksp.co.il/meNew/img/logos/KSP.png";
                [title, price, image_url] = getInfoFromPagemap(pagemap, "KSP");
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    if (metatag['og:description'] && metatag['og:description'].includes('אזל מהמלאי')) {
                        return null;
                    }
                }

            } else if (link.startsWith("https://www.payngo")) {
                const available = await checkAvailability(link, "מחסני חשמל");
                if (!available) {
                    return null;
                }
                store_name = "מחסני חשמל";
                store_logo = "https://d2d22nphq0yz8t.cloudfront.net/6cbcadef-96e0-49e9-b3bd-9921afe362db/www.payngo.co.il/media/logo/stores/1/logo.png";
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    price = metatag['product:price:amount'];
                    const currency = metatag['product:price:currency'];
                    if (price && currency) {
                        price = price + currency;
                    }
                    image_url = metatag["og:image"];
                    if (image_url) {
                        const suffix = "/w_800,h_265,r_contain";
                        if (image_url.endsWith(suffix)) {
                            image_url = image_url.slice(0, -suffix.length);
                        }
                    }
                }

            } else if (link.startsWith("https://www.anakshop")) {
                store_name = "ענק המחשבים";
                store_logo = "https://d3m9l0v76dty0.cloudfront.net/system/logos/3608/original/4ab31cfa2989f80ace02636ebc3916ac.png";
                if (pagemap.offer) {
                    const offer = pagemap.offer[0];
                    price = offer.price;
                }
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                }

            } else if (link.startsWith("https://www.bug")) {
                store_name = "Bug";
                store_logo = "https://www.bug.co.il/images/logoBug.png";
                price = await fetchPriceFromHtml(link, "Bug");
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    title = metatag['og:title'];
                }
                if (pagemap.cse_thumbnail) {
                    image_url = pagemap.cse_thumbnail[0]['src'];
                }

            } else if (link.startsWith("https://www.lastprice")) {
                store_name = "Lastprice";
                store_logo = "https://www.jemix.co.il/wp-content/uploads/2020/11/logo_LP300.jpg";
                price = await fetchPriceFromHtml(link, "Lastprice");
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                    title = metatag['og:title'];
                }

            } else if (link.startsWith("https://www.ivory")) {
                store_name = "Ivory";
                store_logo = "https://www.ivory.co.il/files/misc/1679917728s28Sg.svg";
                price = await fetchPriceFromHtml(link, "Ivory");
                console.log("Price:", price);
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                    title = metatag["og:title"];
                }

            } else if (link.startsWith("https://www.adcs")) {
                store_name = "אמירים הפצה";
                store_logo = "https://media.licdn.com/dms/image/C4D0BAQFCQkmpr7Ok1A/company-logo_200_200/0/1631315286863?e=2147483647&v=beta&t=YLytMbLhjWexg_88zSD2_5LRqCCIpH-hKPTOXfE7aWw";
                [title, price, image_url] = getInfoFromPagemap(pagemap, "אמירים הפצה");
                const isImageValid = await checkImageExistence(image_url);
                if (!isImageValid) {
                    image_url = null;
                }

            } else if (link.startsWith("https://www.netoneto")) {
                const available = await checkAvailability(link, "חשמל נטו");
                if (!available) {
                    return null;
                }
                store_name = "חשמל נטו";
                store_logo = "https://www.netoneto.co.il/media/logo/stores/1/dc796d22-6da7-498e-97f0-44e44ee511c6.jpeg";
                [title, price, image_url] = getInfoFromPagemap(pagemap, "חשמל נטו");

            } else if (link.startsWith("https://www.shufersal")) {
                store_name = "שופרסל";
                store_logo = "https://go5.co.il/storage/22/conversions/shufersal-online-logo-image.png";
                [title, price, image_url] = getInfoFromPagemap(pagemap, "שופרסל");

            } else if (link.startsWith("https://365mashbir")) {
                const available = await checkAvailability(link, "Mashbir");
                if (!available) {
                    return null;
                }
                store_name = "Mashbir";
                store_logo = "https://365mashbir.co.il/cdn/shop/files/Artboard_1_copy_2.jpg";
                [title, price, image_url] = getInfoFromPagemap(pagemap, "Mashbir");
            }

            if (!title) {
                title = item.title;
            }

            if (!price || !image_url) {
                return null;
            }

            return [title, link, price.replace(/[,\s]/g, ''), image_url, store_name, store_logo];
        }

        async function extractInfoForSimilarItems(item, similarProductName) {
            const pagemap = item.pagemap || {};
            const link = item.link;
            const title = item.title;
            let image_url = null;

            if (!await isProductRelevant(title, similarProductName)) {
                return null;
            }

            if (link.startsWith("https://ksp")) {
                if (pagemap.product) {
                    const product_p = pagemap.product[0];
                    image_url = product_p.image;
                }

            } else if (link.startsWith("https://www.anakshop")) {
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                }

            } else if (link.startsWith("https://www.bug")) {
                if (pagemap.cse_thumbnail) {
                    image_url = pagemap.cse_thumbnail[0]['src'];
                }

            } else if (link.startsWith("https://www.lastprice")) {
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                }

            } else if (link.startsWith("https://www.ivory")) {
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                }

            } else if (link.startsWith("https://www.netoneto")) {
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                }

            } else if (link.startsWith("https://www.shufersal")) {
                if (pagemap.product) {
                    const product_p = pagemap.product[0];
                    image_url = product_p.image;
                }

            } else if (link.startsWith("https://365mashbir")) {
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                }
            } else {
                return null;
            }

            if (!image_url) {
                return null;
            }

            return [similarProductName, image_url];
        }
        try {
            const results = await Promise.all([
                googleProductSearch(product, "ksp.co.il"),
                googleProductSearch(product, "www.payngo.co.il", "תיאור המוצר,תיאור מוצר"),
                googleProductSearch(product, "www.anakshop.co.il/items/*"),
                googleProductSearch(product, "www.Bug.co.il/"),
                googleProductSearch(product, "www.lastprice.co.il/p/*"),
                googleProductSearch(product, "www.ivory.co.il/catalog.php?id=*"),
                googleProductSearch(product, "www.adcs.co.il/"),
                googleProductSearch(product, "www.netoneto.co.il/product/"),
                googleProductSearch(product, "www.shufersal.co.il/"),
                googleProductSearch(product, "365mashbir.co.il")
            ]);

            const allSimilarProductResults = [];
            for (const similarProduct of similarProductsArray) {
                const similarProductResults = await Promise.all([
                    googleProductSearch(similarProduct, "", "", 1, "f09f34405e3b94332"),
                ]);

                const similarItems = similarProductResults[0].items || [];
                const similarExtractedData = await Promise.all(similarItems.map(async item => {
                    const productInfo = await extractInfoForSimilarItems(item, similarProduct);
                    if (productInfo !== null) {
                        return productInfo;
                    } else {
                        return null;
                    }
                }));

                const similarFilteredData = similarExtractedData.filter(item => item !== null);
                allSimilarProductResults.push(...similarFilteredData);
            }

            const similarTransformedResults = allSimilarProductResults.map(item => ({
                productName: item[0],
                image: item[1],
            }));

            localStorage.setItem('similarProductsResult', JSON.stringify(similarTransformedResults));

            const [productsKsp, productsPayngo, productsAnakshop, productsBug, productsLastprice, productsIvory, productsAmirim, productHashmalneto, productsShufersal, productsMashbir] = results;
            const itemsKsp = productsKsp.items || [];
            const itemsPayngo = productsPayngo.items || [];
            const itemsAnakshop = productsAnakshop.items || [];
            const itemsBug = productsBug.items || [];
            const itemsLastprice = productsLastprice.items || [];
            const itemsIvory = productsIvory.items || [];
            const itemsAmirim = productsAmirim.items || [];
            const itemsHashmalneto = productHashmalneto.items || [];
            const itemsShufersal = productsShufersal.items || [];
            const itemsMashbir = productsMashbir.items || [];
            const items = [...itemsKsp, ...itemsPayngo, ...itemsAnakshop, ...itemsBug, ...itemsLastprice, ...itemsIvory, ...itemsAmirim, ...itemsHashmalneto, ...itemsShufersal, ...itemsMashbir];

            const extractedData = await Promise.all(items.map(async item => {
                const productInfo = await extractProductInfo(item);
                if (productInfo !== null) {
                    return productInfo;
                } else {
                    return null;
                }
            }));

            const filteredData = extractedData.filter(item => item !== null);

            const storeNames = [...new Set(filteredData.map(item => item[4]))];
            let ratingMap = {};
            await Promise.all(storeNames.map(async storeName => {
                ratingMap[storeName] = await fetchStoreRating(storeName);
            }));

            const transformedResults = filteredData.map(item => ({
                productName: item[0],
                link: item[1],
                price: item[2],
                image: item[3],
                storeName: item[4],
                logo: item[5],
                rating: ratingMap[item[4]]
            }));
            localStorage.setItem('similarProducts', similarItems);
            const jsonResults = JSON.stringify(transformedResults);
            localStorage.setItem('searchResults', jsonResults); // Store results in localStorage
            localStorage.setItem('originalResults', jsonResults);

            chrome.tabs.create({url: chrome.runtime.getURL('searchResults.html')});

        } catch (error) {
            console.error('Error:', error);
        } finally {
            if (fromPopup) {
                setButtonLoadingState(false);  // Reset button state after search completes
            }
        }
    } else {
        if (fromPopup) {
            setButtonLoadingState(false);  // Reset button state if no product is entered
        }
    }
}
