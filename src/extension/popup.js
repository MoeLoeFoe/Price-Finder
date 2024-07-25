document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let activeTab = tabs[0];
        let tabId = activeTab.id;

        if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('chrome-extension://')) {
            console.log("Cannot access a chrome:// URL");
            return;
        }

        chrome.scripting.executeScript({
            target: {tabId: tabId},
            func: () => document.title
        }, async (results) => {
            if (results && results[0]) {
                let pageTitle = results[0].result;
                let productName = await getProductName(pageTitle);
                document.getElementById('productInput').value = productName;
            }
        });
    });

    document.getElementById('searchButton').addEventListener('click', searchProduct);

    document.getElementById('productInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchProduct();
        }
    });
});

async function getProductName(title) {
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
                        content: `Extract only the name of a physical product from the following title: "${title}". Only return the name if it is a legitimate physical product that can be bought, such as phones, perfumes, laptops, etc. If no such product name is found, return an empty string. Provide only the product name without any additional text.`
                    }
                ],
                max_tokens: 50
            })
        });

        const data = await response.json();
        console.log("API response:", data);  // Log the full response

        if (data.choices && data.choices.length > 0) {
            const messageContent = data.choices[0].message?.content;
            if (messageContent) {
                return messageContent.trim();
            } else {
                return "";
            }
        } else {
            console.error("Unexpected API response structure:", data);
            return "";
        }
    } catch (error) {
        console.error("Error fetching product name:", error);
        return "";
    }
}

async function fetchStoreRating(storeQuery) {
    const response = await fetch(`http://localhost:8000/get_ratings?query=${encodeURIComponent(storeQuery)}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ratings for ${storeQuery}`);
    }
    return await response.json();
}

async function fetchLastpriceInfo(link) {
    try {
        const response = await fetch(link);
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const priceElement = doc.querySelector('div.d-inline.bold.lprice');
        if (priceElement) {
            const priceText = priceElement.textContent.trim();
            const priceMatch = priceText.match(/(\d[\d,.]*)\s*(₪)/);
            if (priceMatch) {
                return priceMatch[0]; // Return the price with currency
            }
        }
        return null;
    } catch (error) {
        console.error('Error fetching Lastprice info:', error);
        return null;
    }
}

async function fetchIvoryPriceInfo(link) {
    try {
        const response = await fetch(link);
        const htmlText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');

        const priceElement = doc.querySelector('span.print-actual-price');
        const currencyElement = doc.querySelector('span.shekel-sign-rep');
        if (priceElement && currencyElement) {
            const priceText = priceElement.textContent.trim();
            const currencyText = currencyElement.textContent.trim();
            return `${priceText} ${currencyText}`;
        }
        return null;
    } catch (error) {
        console.error('Error fetching Ivory price info:', error);
        return null;
    }
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

async function searchProduct() {
    setButtonLoadingState(true);  // Set button to loading state
    const product = document.getElementById('productInput').value;
    if (product) {
        const API_KEY = "AIzaSyDaQTMMKeI_vuknRVOXvbDmuFdOenz1cSA";
        //AIzaSyBE9yzCgdWJEFtaiQhYnpKIzY9wR2gmCM8
        //AIzaSyDaQTMMKeI_vuknRVOXvbDmuFdOenz1cSA
        //AIzaSyCuLbEgu2BkGnKvcOlGL7_vfms0jq5WQlk
        //AIzaSyBL9BKBBR5l9vl4PlH6UQ0mu26nYhtQNLY
        //AIzaSyDYJ5HgZsS69C_bNe5_N-2NI0PB-hllnDU
        const CSE_ID = "b3595db64cc714862";

        function googleProductSearch(query, site, orTerms = "") {
            const searchUrl = "https://customsearch.googleapis.com/customsearch/v1";
            const params = new URLSearchParams({
                q: query,
                key: API_KEY,
                cx: CSE_ID,
                orTerms: orTerms,
                siteSearch: site,
                siteSearchFilter: "i",
                num: 5,
                fields: "items(title,link,pagemap)"
            });
            return fetch(`${searchUrl}?${params.toString()}`)
                .then(response => response.json());
        }

        async function extractProductInfo(item) {
            const pagemap = item.pagemap || {};
            let title = item.title;
            const link = item.link;
            let price = null;
            let image_url = null;
            let store_logo = null;
            let store_name = null;

            if (link.startsWith("https://ksp")) {
                store_name = "KSP";
                store_logo = "https://ksp.co.il/meNew/img/logos/KSP.png";
                if (pagemap.offer) {
                    const offer = pagemap.offer[0];
                    if (offer.availability === "https://schema.org/OutOfStock") {
                        return null;
                    }
                    price = offer.price + offer.pricecurrency;
                }
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    if (metatag['og:description'] && metatag['og:description'].includes('אזל מהמלאי')) {
                        return null;
                    }
                }
                if (pagemap.product) {
                    const product_p = pagemap.product[0];
                    if (product_p.image && product_p.name) {
                        image_url = product_p.image;
                        title = product_p.name;
                    }
                }
            } else if (link.startsWith("https://www.payngo")) {
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

            } else if (link.startsWith("https://www.semicom")) {
                store_name = "Semicom";
                store_logo = "https://www.semicom.co.il/static/version1720584178/frontend/Betanet/semicom/he_IL/images/logo.svg";
                if (pagemap.offer) {
                    for (const offer of pagemap.offer) {
                        price = await offer.price + offer.pricecurrency;
                        if (price) break;
                    }
                }
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                }
                if (pagemap.product) {
                    const product_p = pagemap.product[0];
                    if (product_p.name) {
                        title = product_p.name;
                    }
                }
            } else if (link.startsWith("https://www.lastprice")) {
                store_name = "Lastprice";
                store_logo = "https://www.lastprice.co.il/img/logo.svg";
                price = await fetchLastpriceInfo(link);
                console.log("Price:", price);
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                    title = metatag['og:title'];
                }
            } else if (link.startsWith("https://www.ivory")) {
                store_name = "Ivory";
                store_logo = "https://www.ivory.co.il/files/misc/1679917728s28Sg.svg";
                price = await fetchIvoryPriceInfo(link);
                console.log("Price:", price);
                if (pagemap.metatags) {
                    const metatag = pagemap.metatags[0];
                    image_url = metatag["og:image"];
                    title = metatag["og:title"];
                }
            }

            if (price == null || image_url == null) {
                return null;
            }
            return [title, link, price, image_url, store_name, store_logo];
        }

        try {
            const [kspRating, payngoRating, anakshopRating, semicomRating, LastpriceRating, ivoryRating] = await Promise.all([
                fetchStoreRating("ksp"),
                fetchStoreRating("מחסני חשמל"),
                fetchStoreRating("ענק המחשבים"),
                fetchStoreRating("Semicom"),
                fetchStoreRating("Lastprice"),
                fetchStoreRating("ivory")
            ]);

            const ratingMap = {
                "KSP": kspRating,
                "מחסני חשמל": payngoRating,
                "ענק המחשבים": anakshopRating,
                "Semicom": semicomRating,
                "Lastprice": LastpriceRating,
                "Ivory": ivoryRating
            };

            const results = await Promise.all([
                googleProductSearch(product, "ksp.co.il"),
                googleProductSearch(product, "www.payngo.co.il", "תיאור המוצר,תיאור מוצר"),
                googleProductSearch(product, "www.anakshop.co.il/items/*"),
                googleProductSearch(product, "www.semicom.co.il/*-*"),
                googleProductSearch(product, "www.lastprice.co.il/p/*"),
                googleProductSearch(product, "www.ivory.co.il/catalog.php?id=*")
            ]);

            const [productsKsp, productsPayngo, productsAnakshop, productsSemicom, productsLastprice, productsIvory] = results;
            const itemsKsp = productsKsp.items || [];
            const itemsPayngo = productsPayngo.items || [];
            const itemsAnakshop = productsAnakshop.items || [];
            const itemsSemicom = productsSemicom.items || [];
            const itemsLastprice = productsLastprice.items || [];
            const itemsIvory = productsIvory.items || [];
            const items = [...itemsKsp, ...itemsPayngo, ...itemsAnakshop, ...itemsSemicom, ...itemsLastprice, ...itemsIvory];

            const extractedData = await Promise.all(items.map(async item => {
                const productInfo = await extractProductInfo(item);
                if (productInfo !== null) {
                    const storeRating = ratingMap[productInfo[4]];
                    return [...productInfo, storeRating];
                } else {
                    return null;
                }
            }));

            const filteredData = extractedData.filter(item => item !== null); // Filter out null values
            const jsonResults = encodeURIComponent(JSON.stringify(filteredData));
            const newTabUrl = `results.html?results=${jsonResults}`;
            chrome.tabs.create({url: newTabUrl});
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setButtonLoadingState(false);  // Reset button state after search completes
        }
    } else {
        setButtonLoadingState(false);  // Reset button state if no product is entered
    }
}
