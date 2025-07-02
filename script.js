const stockInput = document.getElementById('stock-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const tvIframe = document.getElementById('tv-iframe');
const predictionResult = document.getElementById('prediction-result');

// --- Chart ---
function loadChart(symbol) {
    tvIframe.src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}&interval=D&theme=light&style=1&toolbarbg=161a25&withdateranges=1&hide_side_toolbar=0&allow_symbol_change=1&studies=MACD%40tv-basicstudies,RSI%40tv-basicstudies,MAExp%40tv-basicstudies&hideideas=1&saveimage=0&calendar=1&hotlist=0&showpopupbutton=0&locale=en#`;
}

// --- Prediction ---
const TWELVE_DATA_API_KEY = '5f5fd072a53b4935a0aeab909f72d4d8'; // Register from Twelve Data API key
// 5f5fd072a53b4935a0aeab909f72d4d8

async function predictPrice(symbol) {
    try {
        predictionResult.textContent = 'Predicting...';
        let apiSymbol = symbol.toUpperCase();
        // supports stocks, crypto, forex
        const url = `https://api.twelvedata.com/time_series?symbol=${apiSymbol}&interval=1day&outputsize=30&apikey=${TWELVE_DATA_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data.values || !Array.isArray(data.values)) {
            predictionResult.textContent = 'Prediction unavailable (API limit or invalid/unsupported symbol)';
            return;
        }
        // Get last 30 closes, oldest first (Twelve Data: newest first, so reverse)
        const closes = data.values.reverse().map(item => parseFloat(item.close));
        if (closes.length < 2) {
            predictionResult.textContent = 'Not enough data for prediction.';
            return;
        }
        // Linear regression y = a + bx
        let n = closes.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += closes[i];
            sumXY += i * closes[i];
            sumXX += i * i;
        }
        const b = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const a = (sumY - b * sumX) / n;
        const nextX = n;
        const nextPrice = a + b * nextX;

        const today = closes[n-1];
        const change = ((nextPrice - today) / today * 100).toFixed(2);

        predictionResult.innerHTML = `
            <b>Next day predicted CLOSING price:</b><br>
            <span style="font-family:monospace">
                y = mx + c<br>
                y = ${b.toFixed(4)} x ${nextX} + ${a.toFixed(4)}<br>
                = <b>$ ${nextPrice.toFixed(2)}</b> 
                <span style="color:${change>=0 ? '#42f554':'#ff5555'}">
                (${change >= 0 ? '+' : ''}${change}% vs last close)
                </span>
            </span>
        `;
    } catch (err) {
        predictionResult.textContent = 'Prediction failed. Try again.';
    }
}

// Example symbol quick search
document.querySelectorAll('.example-symbol').forEach(span => {
    span.onclick = () => {
        stockInput.value = span.textContent;
        searchBtn.click();
    };
});

// --- Main Event ---
searchBtn.onclick = () => {
    const symbol = stockInput.value.trim().toUpperCase();
    if (!symbol.match(/^[A-Z0-9.]{1,12}$/)) {
        errorMessage.textContent = "Please enter a valid symbol (e.g., AAPL, TSLA, BTCUSD).";
        return;
    }
    errorMessage.textContent = "";
    loadChart(symbol);
    predictPrice(symbol);
};

window.onload = () => {
    stockInput.value = 'TSLA';
    loadChart('TSLA');
    predictPrice('TSLA');
};
