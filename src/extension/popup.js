document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    let activeTab = tabs[0];
    let tabId = activeTab.id;

    if (activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('chrome-extension://')) {
      console.log("Cannot access a chrome:// URL");
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => document.title
    }, (results) => {
      if (results && results[0]) {
        let pageTitle = results[0].result;
        document.getElementById('productInput').value = pageTitle;
      }
    });
  });

  document.getElementById('searchButton').addEventListener('click', searchProduct);

  document.getElementById('productInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      searchProduct();
    }
  });
});


async function fetchStoreRating(storeQuery) {
  const response = await fetch(`http://localhost:8000/get_ratings?query=${encodeURIComponent(storeQuery)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ratings for ${storeQuery}`);
  }
  return await response.json();
}

async function searchProduct() {
  const product = document.getElementById('productInput').value;
  if (product) {
    const API_KEY = "AIzaSyDaQTMMKeI_vuknRVOXvbDmuFdOenz1cSA";
    //AIzaSyCuLbEgu2BkGnKvcOlGL7_vfms0jq5WQlk
    //AIzaSyBL9BKBBR5l9vl4PlH6UQ0mu26nYhtQNLY
    //AIzaSyDYJ5HgZsS69C_bNe5_N-2NI0PB-hllnDU
    //AIzaSyBE9yzCgdWJEFtaiQhYnpKIzY9wR2gmCM8
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
        num: 10,
        fields: "items(title,link,pagemap)"
      });
      return fetch(`${searchUrl}?${params.toString()}`)
          .then(response => response.json());
    }

    function extractProductInfo(item) {
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
          for (const offer of pagemap.offer) {
            if (offer.availability === "https://schema.org/OutOfStock") {
              return null;
            }
            price = offer.price + offer.pricecurrency;
            if (price) break;
          }
        }
        if (pagemap.metatags) {
          for (const metatag of pagemap.metatags) {
            if (metatag['og:description'] && metatag['og:description'].includes('אזל מהמלאי')) {
              return null;
            }
          }
        }
        if (pagemap.product) {
          for (const product_p of pagemap.product) {
            if (product_p.image && product_p.name) {
              image_url = product_p.image;
              title = product_p.name;
              break;
            }
          }
        }
      } else if (link.startsWith("https://www.payngo")) {
        store_name = "מחסני חשמל";
        store_logo = "https://d2d22nphq0yz8t.cloudfront.net/6cbcadef-96e0-49e9-b3bd-9921afe362db/www.payngo.co.il/media/logo/stores/1/logo.png";
        if (pagemap.metatags) {
          for (const metatag of pagemap.metatags) {
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
              break;
            }
          }
        }
      }
      else if (link.startsWith("https://www.anakshop")) {
        store_name = "ענק המחשבים";
        store_logo = "https://d3m9l0v76dty0.cloudfront.net/system/logos/3608/original/4ab31cfa2989f80ace02636ebc3916ac.png";
        if (pagemap.offer) {
          for (const offer of pagemap.offer) {
            price = offer.price + offer.pricecurrency;
            if (price) break;
          }
        }
        if (pagemap.metatags) {
          for (const metatag of pagemap.metatags) {
            image_url = metatag["og:image"];
            if (image_url) break;
          }
        }
      }
      else if (link.startsWith("https://www.semicom")) {
        store_name = "Semicom";
        store_logo = "https://www.semicom.co.il/static/version1720584178/frontend/Betanet/semicom/he_IL/images/logo.svg";
        if (pagemap.offer) {
          for (const offer of pagemap.offer) {
            price = offer.price + offer.pricecurrency;
            if (price) break;
          }
        }
        if (pagemap.metatags) {
          for (const metatag of pagemap.metatags) {
            image_url = metatag["og:image"];
            if (image_url) break;
          }
        }
        if (pagemap.product) {
          for (const product_p of pagemap.product) {
            if (product_p.name) {
              title = product_p.name;
              break;
            }
          }
        }
      }
      if (price == null || image_url == null) {
        return null;
      }
      return [title, link, price, image_url, store_name, store_logo];
    }

    try {
      const [kspRating, payngoRating, anakshopRating, semicomRating] = await Promise.all([
        fetchStoreRating("ksp"),
        fetchStoreRating("מחסני חשמל"),
        fetchStoreRating("ענק המחשבים"),
        fetchStoreRating("Semicom")
      ]);

      const ratingMap = {
        "KSP": kspRating,
        "מחסני חשמל": payngoRating,
        "ענק המחשבים": anakshopRating,
        "Semicom": semicomRating
      };

      const results = await Promise.all([
        googleProductSearch(product, "ksp.co.il"),
        googleProductSearch(product, "www.payngo.co.il", "תיאור המוצר,תיאור מוצר"),
        googleProductSearch(product, "www.anakshop.co.il/items/*"),
        googleProductSearch(product, "www.semicom.co.il/*-*")
      ]);

      const [productsKsp, productsPayngo, productsAnakshop, productsSemicom] = results;
      const itemsKsp = productsKsp.items || [];
      const itemsPayngo = productsPayngo.items || [];
      const itemsAnakshop = productsAnakshop.items || [];
      const itemsSemicom = productsSemicom.items || [];
      const items = [...itemsKsp, ...itemsPayngo, ...itemsAnakshop, ...itemsSemicom];

      const extractedData = items
          .map(item => extractProductInfo(item))
          .filter(item => item !== null)
          .map(item => {
            const storeRating = ratingMap[item[4]];
            return [...item, storeRating];
          });

      const jsonResults = encodeURIComponent(JSON.stringify(extractedData));
      const newTabUrl = `results.html?results=${jsonResults}`;
      chrome.tabs.create({ url: newTabUrl });
    }
    catch (error) {
      console.error('Error:', error);
    }
  }
}