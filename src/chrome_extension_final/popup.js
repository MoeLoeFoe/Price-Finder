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
                document.getElementById('productInput').value = await getProductName(pageTitle);
            }
        });
    });

    document.getElementById('searchButton').addEventListener('click', () => {
        const product = document.getElementById('productInput').value;
        searchProduct(product, true);
    });

    document.getElementById('productInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const product = document.getElementById('productInput').value;
            searchProduct(product, true);
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
        console.log("API response:", data);

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
