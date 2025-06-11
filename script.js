const stockInput = document.getElementById('stock-input');
const searchBtn = document.getElementById('search-btn');
const errorMessage = document.getElementById('error-message');
const tvIframe = document.getElementById('tv-iframe');

function getTradingViewURL(symbol) {
    // Widget doc: https://www.tradingview.com/widget/advanced-chart/
    symbol = symbol.trim().toUpperCase();
    if (!symbol) symbol = 'AAPL';
    // US stocks: use NASDAQ:SYMBOL or NYSE:SYMBOL, but 'AAPL' works for big caps
    // Crypto: BTCUSD, ETHUSD, etc.
    // Forex: EURUSD, USDJPY, etc.
    // Fallback: just use symbol as-is (works for most)
    return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(symbol)}&theme=dark`;
}

// Loads the TradingView chart for the given symbol
function loadChart(symbol) {
    // Use TradingView's "Advanced Chart" widget
    // For assignments, this loads with most features enabled (drawing tools, indicators, candlestick by default, dark theme)
    tvIframe.src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(symbol)}&interval=D&theme=dark&style=1&toolbarbg=161a25&withdateranges=1&hide_side_toolbar=0&allow_symbol_change=1&studies=MACD%40tv-basicstudies,RSI%40tv-basicstudies,MAExp%40tv-basicstudies&hideideas=1&saveimage=1&calendar=1&hotlist=1&showpopupbutton=1&locale=en#`;
}

// Search button handler
searchBtn.onclick = () => {
    const symbol = stockInput.value.trim().toUpperCase();
    if (!symbol.match(/^[A-Z0-9.]{1,12}$/)) {
        errorMessage.textContent = "Please enter a valid symbol (e.g., AAPL, TSLA, BTCUSD).";
        return;
    }
    errorMessage.textContent = "";
    loadChart(symbol);
};

// Load default chart on page load
window.onload = () => {
    stockInput.value = 'AAPL';
    loadChart('AAPL');
};
