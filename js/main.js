let isConnected = false;
let apiCredentials = null;
let accountNumber = null;
let currentPage = 'dashboard';


const demoData = {
    account: {
        accountNumber: "123456789",
        totalValue: 250000.00,
        availableCash: 45000.00,
        dayPnL: 1250.00,
        totalPnL: 25000.00,
        marginUsed: 15000.00,
        buyingPower: 75000.00
    },
    positions: [
        { symbol: "AAPL", quantity: 500, avgCost: 145.50, currentPrice: 150.25, marketValue: 75125.00 },
        { symbol: "TSLA", quantity: 200, avgCost: 195.75, currentPrice: 205.50, marketValue: 41100.00 },
        { symbol: "MSFT", quantity: 300, avgCost: 285.30, currentPrice: 295.80, marketValue: 88740.00 },
        { symbol: "GOOGL", quantity: 100, avgCost: 2650.00, currentPrice: 2725.30, marketValue: 272530.00 },
        { symbol: "SPY", quantity: 150, avgCost: 420.15, currentPrice: 425.75, marketValue: 63862.50 }
    ],
    orders: [
        { id: "ORD12345", symbol: "AAPL", action: "BUY", quantity: 100, price: 148.50, status: "FILLED", timestamp: "2024-08-21 09:30:00" },
        { id: "ORD12346", symbol: "TSLA", action: "SELL", quantity: 50, price: 210.00, status: "PENDING", timestamp: "2024-08-21 10:15:00" },
        { id: "ORD12347", symbol: "MSFT", action: "BUY", quantity: 75, price: 290.25, status: "FILLED", timestamp: "2024-08-21 11:20:00" },
        { id: "ORD12348", symbol: "SPY", action: "BUY", quantity: 25, price: 422.50, status: "CANCELLED", timestamp: "2024-08-21 13:45:00" }
    ],
    watchlist: [
        { symbol: "AAPL", price: 150.25, change: 2.75, changePercent: 1.87, volume: 45678900 },
        { symbol: "TSLA", price: 205.50, change: -3.25, changePercent: -1.56, volume: 32145600 },
        { symbol: "MSFT", price: 295.80, change: 4.50, changePercent: 1.54, volume: 28934500 },
        { symbol: "GOOGL", price: 2725.30, change: 15.80, changePercent: 0.58, volume: 1234500 },
        { symbol: "AMZN", price: 3245.75, change: -12.50, changePercent: -0.38, volume: 2345600 },
        { symbol: "NVDA", price: 425.60, change: 8.90, changePercent: 2.14, volume: 67890100 },
        { symbol: "SPY", price: 425.75, change: 1.25, changePercent: 0.29, volume: 78901200 },
        { symbol: "QQQ", price: 365.40, change: 2.15, changePercent: 0.59, volume: 45678300 }
    ]
};


document.addEventListener('DOMContentLoaded', function() {
    updateConnectionStatus();
    setDefaultExpiryDate();
    initializeEventListeners();
});


function initializeEventListeners() {
 
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const appKey = document.getElementById('appKey').value;
            const appSecret = document.getElementById('appSecret').value;
            
            if (appKey && appSecret) {
                connectToAPI(appKey, appSecret);
            }
        });
    }

  
    const tradeForm = document.getElementById('tradeForm');
    if (tradeForm) {
        tradeForm.addEventListener('submit', function(e) {
            e.preventDefault();
            placeOrder();
        });
    }


    const advancedForm = document.getElementById('advancedTradeForm');
    if (advancedForm) {
        advancedForm.addEventListener('submit', function(e) {
            e.preventDefault();
            placeAdvancedOrder();
        });
    }

 
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    showPage('dashboard');
                    break;
                case '2':
                    e.preventDefault();
                    showPage('account-details');
                    break;
                case '3':
                    e.preventDefault();
                    showPage('market-details');
                    break;
                case '4':
                    e.preventDefault();
                    showPage('trading-details');
                    break;
                case '5':
                    e.preventDefault();
                    showPage('analysis-details');
                    break;
                case '6':
                    e.preventDefault();
                    showPage('portfolio-details');
                    break;
                case 'r':
                    e.preventDefault();
                    location.reload();
                    break;
            }
        }
    });

 
    window.addEventListener('resize', function() {
        if (window.innerWidth < 768) {
            document.querySelectorAll('.grid').forEach(grid => {
                grid.style.gridTemplateColumns = '1fr';
            });
        } else {
            document.querySelectorAll('.grid').forEach(grid => {
                grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(400px, 1fr))';
            });
        }
    });


    document.addEventListener('contextmenu', function(e) {
        if (e.target.closest('.stat-card') || e.target.closest('.quote-display')) {
            e.preventDefault();
        }
    });


    window.addEventListener('load', logPerformance);


    setTimeout(addTooltips, 1000);


    setTimeout(() => {
        showNotification('Schwab Pro Trading Platform Loaded Successfully!', 'success');
    }, 2000);
}


function showPage(pageId) {
  
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.onclick && link.onclick.toString().includes(pageId)) {
            link.classList.add('active');
        }
    });
    
    currentPage = pageId;
    loadPageData(pageId);
}

function loadPageData(pageId) {
    switch(pageId) {
        case 'account-details':
            loadDetailedAccountInfo();
            break;
        case 'market-details':
            loadMarketOverview();
            loadSectorPerformance();
            loadTopMovers();
            break;
        case 'analysis-details':
            loadEconomicIndicators();
            loadMarketSentiment();
            break;
        case 'portfolio-details':
            loadDetailedPositions();
            loadTransactionHistory();
            calculatePortfolioMetrics();
            break;
    }
}


function setDefaultExpiryDate() {
    const today = new Date();
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7));
    const expiryInput = document.getElementById('optionsExpiry');
    if (expiryInput) {
        expiryInput.value = nextFriday.toISOString().split('T')[0];
    }
}


function updateConnectionStatus() {
    const indicator = document.getElementById('connectionStatus');
    if (indicator) {
        if (isConnected) {
            indicator.classList.add('connected');
        } else {
            indicator.classList.remove('connected');
        }
    }
}


async function connectToAPI(appKey, appSecret) {
    const messageDiv = document.getElementById('authMessage');
    messageDiv.innerHTML = '<div class="loading"><div class="spinner"></div> Connecting to Schwab API...</div>';
    
    try {
        await simulateAPICall(2000);
        
        apiCredentials = { appKey, appSecret };
        isConnected = true;
        updateConnectionStatus();
        
        messageDiv.innerHTML = '<div class="success-message">Successfully connected to Schwab API!</div>';
        
 
        setTimeout(() => {
            getAccountInfo();
            getMultipleQuotes();
        }, 1000);
        
    } catch (error) {
        messageDiv.innerHTML = `<div class="error-message">Connection failed: ${error.message}</div>`;
    }
}


function loadDemoData() {
    isConnected = true;
    updateConnectionStatus();
    document.getElementById('authMessage').innerHTML = '<div class="success-message">Demo mode activated - using sample data</div>';
    

    displayAccountInfo(demoData.account, demoData.positions);
    

    displayWatchlist(demoData.watchlist);


    setTimeout(() => {
        startRealTimeUpdates();
    }, 2000);
}


async function getAccountInfo() {
    if (!isConnected) {
        showError('accountDisplay', 'Please connect to API first');
        return;
    }
    
    const display = document.getElementById('accountDisplay');
    if (display) {
        display.innerHTML = '<div class="loading"><div class="spinner"></div> Loading account information...</div>';
        
        try {
            await simulateAPICall(1500);
            displayAccountInfo(demoData.account, demoData.positions);
        } catch (error) {
            showError('accountDisplay', 'Failed to load account information');
        }
    }
}


function displayAccountInfo(account, positions) {
    const display = document.getElementById('accountDisplay');
    if (!display) return;
    
    const html = `
        <div class="stats-grid">
            <div class="stat-card">
                <span class="stat-value">$${account.totalValue.toLocaleString()}</span>
                <div class="stat-label">Total Value</div>
            </div>
            <div class="stat-card">
                <span class="stat-value">$${account.availableCash.toLocaleString()}</span>
                <div class="stat-label">Available Cash</div>
            </div>
            <div class="stat-card">
                <span class="stat-value ${account.dayPnL >= 0 ? 'positive' : 'negative'}" style="color: ${account.dayPnL >= 0 ? 'var(--success-green)' : 'var(--danger-red)'}">
                    ${account.dayPnL >= 0 ? '+' : ''}$${account.dayPnL.toLocaleString()}
                </span>
                <div class="stat-label">Day P&L</div>
            </div>
            <div class="stat-card">
                <span class="stat-value ${account.totalPnL >= 0 ? 'positive' : 'negative'}" style="color: ${account.totalPnL >= 0 ? 'var(--success-green)' : 'var(--danger-red)'}">
                    ${account.totalPnL >= 0 ? '+' : ''}$${account.totalPnL.toLocaleString()}
                </span>
                <div class="stat-label">Total P&L</div>
            </div>
        </div>
        <div style="margin-top: 20px;">
            <h4 style="color: var(--accent-gold); margin-bottom: 15px;">Top Holdings:</h4>
            ${positions.slice(0, 3).map(pos => {
                const pnl = (pos.currentPrice - pos.avgCost) * pos.quantity;
                const pnlPercent = ((pos.currentPrice - pos.avgCost) / pos.avgCost) * 100;
                return `
                    <div style="margin: 12px 0; padding: 15px; background: var(--card-bg); border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="font-size: 1.1em; color: var(--text-primary);">${pos.symbol}</strong>
                            <div style="color: var(--text-secondary); font-size: 0.9em;">${pos.quantity} shares @ $${pos.avgCost.toFixed(2)}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.2em; font-weight: 600;">$${pos.marketValue.toLocaleString()}</div>
                            <div style="color: ${pnl >= 0 ? 'var(--success-green)' : 'var(--danger-red)'}; font-weight: 600; font-size: 0.9em;">
                                ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent.toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    display.innerHTML = html;
}


async function getMultipleQuotes() {
    const display = document.getElementById('quoteDisplay');
    if (!display) return;
    
    display.innerHTML = '<div class="loading"><div class="spinner"></div> Loading watchlist...</div>';
    
    try {
        await simulateAPICall(1500);
        displayWatchlist(demoData.watchlist);
    } catch (error) {
        showError('quoteDisplay', 'Failed to load watchlist');
    }
}


function displayWatchlist(watchlist) {
    const display = document.getElementById('quoteDisplay');
    if (!display) return;
    
    let html = '<h4 style="color: var(--accent-gold); margin-bottom: 20px;">Market Watchlist</h4>';
    
    watchlist.slice(0, 4).forEach(quote => {
        const isPositive = quote.change >= 0;
        html += `
            <div class="quote-display" style="margin: 12px 0; padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="font-size: 1.3em; color: var(--accent-gold);">${quote.symbol}</strong>
                        <div class="quote-price" style="font-size: 1.8em; margin: 8px 0;">$${quote.price.toFixed(2)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="quote-change ${isPositive ? 'positive' : 'negative'}" style="font-size: 1.1em; font-weight: 600;">
                            ${isPositive ? '+' : ''}$${quote.change.toFixed(2)}
                        </div>
                        <div class="quote-change ${isPositive ? 'positive' : 'negative'}" style="font-size: 0.9em;">
                            (${isPositive ? '+' : ''}${quote.changePercent.toFixed(2)}%)
                        </div>
                        <div style="font-size: 0.8em; color: var(--text-secondary); margin-top: 5px;">
                            Vol: ${quote.volume.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    display.innerHTML = html;
}


async function getQuote() {
    const symbol = document.getElementById('symbolInput').value.toUpperCase();
    if (!symbol) return;
    
    const display = document.getElementById('quoteDisplay');
    if (!display) return;
    
    display.innerHTML = '<div class="loading"><div class="spinner"></div> Loading quote...</div>';
    
    try {
        await simulateAPICall(1000);
        
        let quote = demoData.watchlist.find(q => q.symbol === symbol);
        if (!quote) {
            quote = {
                symbol: symbol,
                price: Math.random() * 200 + 50,
                change: (Math.random() - 0.5) * 10,
                changePercent: (Math.random() - 0.5) * 5,
                volume: Math.floor(Math.random() * 10000000) + 1000000,
                high: Math.random() * 200 + 55,
                low: Math.random() * 200 + 45,
                open: Math.random() * 200 + 50
            };
        }
        
        displaySingleQuote(quote);
    } catch (error) {
        showError('quoteDisplay', 'Failed to load quote');
    }
}


function displaySingleQuote(quote) {
    const display = document.getElementById('quoteDisplay');
    if (!display) return;
    
    const isPositive = quote.change >= 0;
    
    const html = `
        <div class="quote-display">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h4 style="font-size: 1.8em; color: var(--accent-gold);">${quote.symbol}</h4>
                <div style="font-size: 0.9em; color: var(--text-secondary);">Volume: ${quote.volume ? quote.volume.toLocaleString() : 'N/A'}</div>
            </div>
            
            <div class="quote-price" style="margin-bottom: 15px;">$${quote.price.toFixed(2)}</div>
            
            <div class="quote-change ${isPositive ? 'positive' : 'negative'}" style="margin-bottom: 20px;">
                ${isPositive ? '+' : ''}$${quote.change.toFixed(2)} (${isPositive ? '+' : ''}${quote.changePercent.toFixed(2)}%)
            </div>
            
            ${quote.high && quote.low && quote.open ? `
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; font-size: 0.9em; color: var(--text-secondary);">
                    <div style="text-align: center; padding: 10px; background: var(--card-bg); border-radius: 8px;">
                        <div style="color: var(--text-primary); font-weight: 600;">$${quote.open.toFixed(2)}</div>
                        <div>Open</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: var(--card-bg); border-radius: 8px;">
                        <div style="color: var(--success-green); font-weight: 600;">$${quote.high.toFixed(2)}</div>
                        <div>High</div>
                    </div>
                    <div style="text-align: center; padding: 10px; background: var(--card-bg); border-radius: 8px;">
                        <div style="color: var(--danger-red); font-weight: 600;">$${quote.low.toFixed(2)}</div>
                        <div>Low</div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    display.innerHTML = html;
}


async function placeOrder() {
    if (!isConnected) {
        document.getElementById('tradeMessage').innerHTML = '<div class="error-message">Please connect to API first</div>';
        return;
    }
    
    const symbol = document.getElementById('tradeSymbol').value.toUpperCase();
    const action = document.getElementById('tradeAction').value;
    const quantity = document.getElementById('tradeQuantity').value;
    const orderType = document.getElementById('tradeType').value;
    
    if (!symbol || !quantity) {
        document.getElementById('tradeMessage').innerHTML = '<div class="error-message">Please fill in all required fields</div>';
        return;
    }
    
    const messageDiv = document.getElementById('tradeMessage');
    messageDiv.innerHTML = '<div class="loading"><div class="spinner"></div> Placing order...</div>';
    
    try {
        await simulateAPICall(2000);
        
        const orderId = 'ORD' + Math.random().toString(36).substr(2, 9);
        messageDiv.innerHTML = `
            <div class="success-message">
                Order placed successfully!<br>
                <strong>Order ID:</strong> ${orderId}<br>
                <strong>Details:</strong> ${action} ${quantity} shares of ${symbol} @ ${orderType}
            </div>
        `;
        

        document.getElementById('tradeForm').reset();
        
    } catch (error) {
        messageDiv.innerHTML = `<div class="error-message">Failed to place order: ${error.message}</div>`;
    }
}


async function placeAdvancedOrder() {
    if (!isConnected) {
        document.getElementById('advancedTradeMessage').innerHTML = '<div class="error-message">Please connect to API first</div>';
        return;
    }
    
    const messageDiv = document.getElementById('advancedTradeMessage');
    messageDiv.innerHTML = '<div class="loading"><div class="spinner"></div> Placing advanced order...</div>';
    
    try {
        await simulateAPICall(2500);
        
        const orderId = 'ADV' + Math.random().toString(36).substr(2, 9);
        messageDiv.innerHTML = `
            <div class="success-message">
                Advanced order placed successfully!<br>
                <strong>Order ID:</strong> ${orderId}<br>
                Order details logged and submitted to execution system.
            </div>
        `;
        

        document.getElementById('advancedTradeForm').reset();
        
    } catch (error) {
        messageDiv.innerHTML = `<div class="error-message">Failed to place advanced order: ${error.message}</div>`;
    }
}


function previewOrder() {
    const symbol = document.getElementById('tradeSymbol').value.toUpperCase();
    const action = document.getElementById('tradeAction').value;
    const quantity = document.getElementById('tradeQuantity').value;
    const orderType = document.getElementById('tradeType').value;
    const price = document.getElementById('tradePrice') ? document.getElementById('tradePrice').value : null;
    
    if (!symbol || !quantity) {
        document.getElementById('tradeMessage').innerHTML = '<div class="error-message">Please fill in required fields first</div>';
        return;
    }
    
    const estimatedValue = price ? (parseFloat(price) * parseInt(quantity)) : 'Market Price';
    
    document.getElementById('tradeMessage').innerHTML = `
        <div style="background: rgba(251, 191, 36, 0.1); border: 1px solid var(--accent-gold); border-radius: 12px; padding: 20px; margin-top: 15px;">
            <h4 style="color: var(--accent-gold); margin-bottom: 15px;">Order Preview</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 0.9em;">
                <div><strong>Action:</strong> ${action}</div>
                <div><strong>Symbol:</strong> ${symbol}</div>
                <div><strong>Quantity:</strong> ${quantity}</div>
                <div><strong>Order Type:</strong> ${orderType}</div>
                ${price ? `<div><strong>Price:</strong> $${price}</div>` : ''}
                <div><strong>Estimated Value:</strong> ${typeof estimatedValue === 'number' ? '$' + estimatedValue.toLocaleString() : estimatedValue}</div>
            </div>
        </div>
    `;
}


async function getOrderHistory() {
    if (!isConnected) {
        showError('orderDisplay', 'Please connect to API first');
        return;
    }
    
    const display = document.getElementById('orderDisplay');
    if (!display) return;
    
    display.innerHTML = '<div class="loading"><div class="spinner"></div> Loading order history...</div>';
    
    try {
        await simulateAPICall(1500);
        
        let html = '<h4 style="color: var(--accent-gold); margin-bottom: 15px;">Recent Orders</h4>';
        demoData.orders.slice(0, 3).forEach(order => {
            const statusColor = order.status === 'FILLED' ? 'var(--success-green)' : 
                               order.status === 'PENDING' ? 'var(--accent-gold)' : 'var(--danger-red)';
            html += `
                <div style="margin: 12px 0; padding: 18px; background: var(--card-bg); border-radius: 12px; border-left: 4px solid ${statusColor};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <div>
                            <strong style="font-size: 1.1em; color: var(--text-primary);">${order.symbol}</strong>
                            <span style="color: var(--text-secondary); margin-left: 10px;">${order.action} ${order.quantity} @ $${order.price}</span>
                        </div>
                        <div style="color: ${statusColor}; font-weight: 600; font-size: 0.9em;">${order.status}</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.8em; color: var(--text-secondary);">
                        <span>Order ID: ${order.id}</span>
                        <span>${order.timestamp}</span>
                    </div>
                </div>
            `;
        });
        
        display.innerHTML = html;
    } catch (error) {
        showError('orderDisplay', 'Failed to load order history');
    }
}


async function getPositions() {
    if (!isConnected) {
        const display = document.getElementById('orderDisplay') || document.getElementById('detailedPositions');
        if (display) showError(display.id, 'Please connect to API first');
        return;
    }
    
    const display = document.getElementById('orderDisplay') || document.getElementById('detailedPositions');
    if (!display) return;
    
    display.innerHTML = '<div class="loading"><div class="spinner"></div> Loading positions...</div>';
    
    try {
        await simulateAPICall(1000);
        
        if (display.id === 'detailedPositions') {
            loadDetailedPositions();
        } else {
            let html = '<h4 style="color: var(--accent-gold); margin-bottom: 15px;">Current Positions</h4>';
            demoData.positions.slice(0, 4).forEach(pos => {
                const pnl = (pos.currentPrice - pos.avgCost) * pos.quantity;
                const pnlPercent = ((pos.currentPrice - pos.avgCost) / pos.avgCost) * 100;
                const pnlColor = pnl >= 0 ? 'var(--success-green)' : 'var(--danger-red)';
                
                html += `
                    <div style="margin: 12px 0; padding: 18px; background: var(--card-bg); border-radius: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong style="font-size: 1.2em; color: var(--accent-gold);">${pos.symbol}</strong>
                                <div style="color: var(--text-secondary); margin-top: 4px;">${pos.quantity} shares @ $${pos.avgCost.toFixed(2)}</div>
                                <div style="font-size: 0.9em; color: var(--text-secondary); margin-top: 2px;">Current: $${pos.currentPrice.toFixed(2)}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 1.3em; font-weight: 700; color: var(--text-primary);">$${pos.marketValue.toLocaleString()}</div>
                                <div style="color: ${pnlColor}; font-weight: 600; margin-top: 4px;">
                                    ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}
                                </div>
                                <div style="color: ${pnlColor}; font-size: 0.9em; font-weight: 600;">
                                    (${pnl >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            display.innerHTML = html;
        }
    } catch (error) {
        showError(display.id, 'Failed to load positions');
    }
}


async function getOptionsChain() {
    const symbol = document.getElementById('optionsSymbol').value.toUpperCase();
    const expiry = document.getElementById('optionsExpiry').value;
    
    if (!symbol || !expiry) {
        showError('optionsDisplay', 'Please enter symbol and expiry date');
        return;
    }
    
    const display = document.getElementById('optionsDisplay');
    if (!display) return;
    
    display.innerHTML = '<div class="loading"><div class="spinner"></div> Loading options chain...</div>';
    
    try {
        await simulateAPICall(2500);
        
        const underlyingPrice = 150 + Math.random() * 100;
        let html = `
            <h4 style="color: var(--accent-gold); margin-bottom: 20px;">
                ${symbol} Options Chain - ${expiry}
            </h4>
            <div style="margin-bottom: 20px; padding: 15px; background: rgba(251, 191, 36, 0.1); border-radius: 12px; text-align: center;">
                <strong>Underlying Price: ${underlyingPrice.toFixed(2)}</strong>
            </div>
        `;
        
        const strikes = [];
        for (let i = -5; i <= 5; i++) {
            strikes.push(Math.round((underlyingPrice + i * 5) / 5) * 5);
        }
        
        html += `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h5 style="color: var(--success-green); text-align: center; margin-bottom: 15px; font-size: 1.1em;">CALLS</h5>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; font-size: 0.8em; color: var(--text-secondary); margin-bottom: 8px;">
                        <div>Strike</div>
                        <div>Premium</div>
                        <div>Volume</div>
                    </div>
        `;
        
        strikes.forEach(strike => {
            const isITM = strike < underlyingPrice;
            const premium = Math.random() * 20 + 1;
            const volume = Math.floor(Math.random() * 1000);
            
            html += `
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; padding: 10px; margin: 3px 0; 
                            background: rgba(16, 185, 129, ${isITM ? '0.2' : '0.1'}); border-radius: 8px; font-size: 0.9em;">
                    <span style="font-weight: 600;">${strike}</span>
                    <span>${premium.toFixed(2)}</span>
                    <span style="color: var(--text-secondary);">${volume}</span>
                </div>
            `;
        });
        
        html += `
                </div>
                <div>
                    <h5 style="color: var(--danger-red); text-align: center; margin-bottom: 15px; font-size: 1.1em;">PUTS</h5>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; font-size: 0.8em; color: var(--text-secondary); margin-bottom: 8px;">
                        <div>Strike</div>
                        <div>Premium</div>
                        <div>Volume</div>
                    </div>
        `;
        
        strikes.forEach(strike => {
            const isITM = strike > underlyingPrice;
            const premium = Math.random() * 15 + 0.5;
            const volume = Math.floor(Math.random() * 800);
            
            html += `
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; padding: 10px; margin: 3px 0; 
                            background: rgba(239, 68, 68, ${isITM ? '0.2' : '0.1'}); border-radius: 8px; font-size: 0.9em;">
                    <span style="font-weight: 600;">${strike}</span>
                    <span>${premium.toFixed(2)}</span>
                    <span style="color: var(--text-secondary);">${volume}</span>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        display.innerHTML = html;
    } catch (error) {
        showError('optionsDisplay', 'Failed to load options chain');
    }
}

async function getMarketData() {
    const symbol = document.getElementById('analysisSymbol') ? 
                  document.getElementById('analysisSymbol').value.toUpperCase() :
                  document.getElementById('chartSymbol') ? 
                  document.getElementById('chartSymbol').value.toUpperCase() : 'SPY';
    
    const period = document.getElementById('analysisPeriod') ? 
                  document.getElementById('analysisPeriod').value :
                  document.getElementById('chartPeriod') ? 
                  document.getElementById('chartPeriod').value : '1month';
    
    const display = document.getElementById('chartDisplay');
    if (!display) return;
    
    display.innerHTML = '<div class="loading"><div class="spinner"></div> Loading market data...</div>';
    
    try {
        await simulateAPICall(2000);
        
        const dataPoints = 30;
        const basePrice = 100 + Math.random() * 100;
        let html = `<h4 style="color: var(--accent-gold); margin-bottom: 20px;">${symbol} - ${period} Analysis</h4>`;
        
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px;">';
        
        for (let i = 0; i < Math.min(dataPoints, 20); i++) {
            const price = basePrice + (Math.random() - 0.5) * 20;
            const change = (Math.random() - 0.5) * 5;
            const changeColor = change >= 0 ? 'var(--success-green)' : 'var(--danger-red)';
            
            html += `
                <div style="padding: 12px; background: var(--card-bg); border-radius: 10px; text-align: center; border: 1px solid var(--glass-border);">
                    <div style="font-size: 0.8em; color: var(--text-secondary); margin-bottom: 5px;">Day ${i + 1}</div>
                    <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 3px;">${price.toFixed(2)}</div>
                    <div style="color: ${changeColor}; font-size: 0.8em; font-weight: 600;">
                        ${change >= 0 ? '+' : ''}${change.toFixed(2)}%
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        

        html += `
            <div style="background: rgba(251, 191, 36, 0.1); border-radius: 12px; padding: 20px; margin-top: 20px;">
                <h5 style="color: var(--accent-gold); margin-bottom: 15px;">Technical Indicators</h5>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px;">
                    <div style="text-align: center;">
                        <div style="font-size: 1.2em; font-weight: 600; color: var(--text-primary);">${(basePrice + 15).toFixed(2)}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9em;">52-Week High</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.2em; font-weight: 600; color: var(--text-primary);">${(basePrice - 15).toFixed(2)}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9em;">52-Week Low</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.2em; font-weight: 600; color: var(--text-primary);">${(Math.random() * 5000000 + 1000000).toLocaleString()}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9em;">Avg Volume</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 1.2em; font-weight: 600; color: var(--text-primary);">${(Math.random() * 30 + 10).toFixed(1)}%</div>
                        <div style="color: var(--text-secondary); font-size: 0.9em;">Volatility</div>
                    </div>
                </div>
            </div>
        `;
        
        display.innerHTML = html;
    } catch (error) {
        showError('chartDisplay', 'Failed to load market data');
    }
}


async function loadDetailedAccountInfo() {
    const display = document.getElementById('detailedAccountInfo');
    if (!display) return;
    
    display.innerHTML = '<div class="loading"><div class="spinner"></div> Loading detailed account information...</div>';
    
    try {
        await simulateAPICall(2000);
        
        const account = demoData.account;
        let html = `
            <div style="margin-bottom: 25px;">
                <h4 style="color: var(--accent-gold); margin-bottom: 15px;">Account Overview</h4>
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-value">${account.totalValue.toLocaleString()}</span>
                        <div class="stat-label">Total Portfolio Value</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${account.availableCash.toLocaleString()}</span>
                        <div class="stat-label">Available Cash</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${account.buyingPower.toLocaleString()}</span>
                        <div class="stat-label">Buying Power</div>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${account.marginUsed.toLocaleString()}</span>
                        <div class="stat-label">Margin Used</div>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="color: var(--accent-gold); margin-bottom: 15px;">Performance Summary</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                        <div style="font-size: 1.5em; font-weight: 700; color: ${account.dayPnL >= 0 ? 'var(--success-green)' : 'var(--danger-red)'};">
                            ${account.dayPnL >= 0 ? '+' : ''}${account.dayPnL.toLocaleString()}
                        </div>
                        <div style="color: var(--text-secondary); margin-top: 5px;">Today's P&L</div>
                    </div>
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
                        <div style="font-size: 1.5em; font-weight: 700; color: ${account.totalPnL >= 0 ? 'var(--success-green)' : 'var(--danger-red)'};">
                            ${account.totalPnL >= 0 ? '+' : ''}${account.totalPnL.toLocaleString()}
                        </div>
                        <div style="color: var(--text-secondary); margin-top: 5px;">Total P&L</div>
                    </div>
                </div>
            </div>
        `;
        
        display.innerHTML = html;
    } catch (error) {
        showError('detailedAccountInfo', 'Failed to load detailed account information');
    }
}

async function loadMarketOverview() {
    const display = document.getElementById('marketOverview');
    if (!display) return;
    
    display.innerHTML = '<div class="loading"><div class="spinner"></div> Loading market overview...</div>';
    
    try {
        await simulateAPICall(1500);
        
        const indices = [
            { name: "S&P 500", symbol: "SPX", price: 4275.31, change: 12.45, changePercent: 0.29 },
            { name: "Dow Jones", symbol: "DJI", price: 33985.20, change: -45.67, changePercent: -0.13 },
            { name: "NASDAQ", symbol: "IXIC", price: 13215.50, change: 85.32, changePercent: 0.65 },
            { name: "Russell 2000", symbol: "RUT", price: 1945.75, change: -8.21, changePercent: -0.42 }
        ];
        
        let html = '<h4 style="color: var(--accent-gold); margin-bottom: 20px;">Market Indices</h4>';
        
        indices.forEach(index => {
            const isPositive = index.change >= 0;
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 10px 0; background: var(--card-bg); border-radius: 12px; border: 1px solid var(--glass-border);">
                    <div>
                        <div style="font-weight: 700; color: var(--text-primary); font-size: 1.1em;">${index.name}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9em;">${index.symbol}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.2em; font-weight: 600; color: var(--text-primary);">${index.price.toLocaleString()}</div>
                        <div style="color: ${isPositive ? 'var(--success-green)' : 'var(--danger-red)'}; font-weight: 600;">
                            ${isPositive ? '+' : ''}${index.change.toFixed(2)} (${isPositive ? '+' : ''}${index.changePercent.toFixed(2)}%)
                        </div>
                    </div>
                </div>
            `;
        });
        
        display.innerHTML = html;
    } catch (error) {
        showError('marketOverview', 'Failed to load market overview');
    }
}

async function loadSectorPerformance() {
    const tableBody = document.getElementById('sectorTableBody');
    if (!tableBody) return;
    
    try {
        await simulateAPICall(1000);
        
        const sectors = [
            { name: "Technology", change: 1.45, volume: "2.3B" },
            { name: "Healthcare", change: 0.89, volume: "1.8B" },
            { name: "Financial", change: -0.34, volume: "2.1B" },
            { name: "Energy", change: 2.12, volume: "1.2B" },
            { name: "Consumer Disc.", change: 0.67, volume: "1.9B" },
            { name: "Industrials", change: -0.78, volume: "1.4B" }
        ];
        
        let html = '';
        sectors.forEach(sector => {
            const changeColor = sector.change >= 0 ? 'var(--success-green)' : 'var(--danger-red)';
            html += `
                <tr>
                    <td style="font-weight: 600;">${sector.name}</td>
                    <td style="color: ${changeColor}; font-weight: 600;">
                        ${sector.change >= 0 ? '+' : ''}${sector.change.toFixed(2)}%
                    </td>
                    <td style="color: var(--text-secondary);">${sector.volume}</td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="3">Failed to load sector data</td></tr>';
    }
}

async function loadTopMovers() {
    const tableBody = document.getElementById('moversTableBody');
    if (!tableBody) return;
    
    try {
        await simulateAPICall(1000);
        
        const movers = [
            { symbol: "NVDA", price: 425.60, changePercent: 8.94 },
            { symbol: "AMD", price: 112.45, changePercent: 6.23 },
            { symbol: "TSLA", price: 205.50, changePercent: -4.67 },
            { symbol: "META", price: 298.75, changePercent: 3.45 },
            { symbol: "AMZN", price: 3245.75, changePercent: -2.89 },
            { symbol: "GOOGL", price: 2725.30, changePercent: 2.14 }
        ];
        
        let html = '';
        movers.forEach(stock => {
            const changeColor = stock.changePercent >= 0 ? 'var(--success-green)' : 'var(--danger-red)';
            html += `
                <tr>
                    <td style="font-weight: 600; color: var(--accent-gold);">${stock.symbol}</td>
                    <td style="font-weight: 600;">${stock.price.toFixed(2)}</td>
                    <td style="color: ${changeColor}; font-weight: 600;">
                        ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="3">Failed to load movers data</td></tr>';
    }
}

async function loadEconomicIndicators() {
    const tableBody = document.getElementById('indicatorsTableBody');
    if (!tableBody) return;
    
    try {
        await simulateAPICall(1500);
        
        const indicators = [
            { name: "GDP Growth", current: "2.4%", previous: "2.1%", change: "+0.3%" },
            { name: "Unemployment", current: "3.7%", previous: "3.8%", change: "-0.1%" },
            { name: "Inflation (CPI)", current: "3.2%", previous: "3.0%", change: "+0.2%" },
            { name: "Fed Funds Rate", current: "5.25%", previous: "5.00%", change: "+0.25%" },
            { name: "10Y Treasury", current: "4.35%", previous: "4.42%", change: "-0.07%" }
        ];
        
        let html = '';
        indicators.forEach(indicator => {
            const isPositive = indicator.change.includes('+');
            const changeColor = isPositive ? 'var(--success-green)' : 'var(--danger-red)';
            html += `
                <tr>
                    <td style="font-weight: 600;">${indicator.name}</td>
                    <td style="font-weight: 600; color: var(--text-primary);">${indicator.current}</td>
                    <td style="color: var(--text-secondary);">${indicator.previous}</td>
                    <td style="color: ${changeColor}; font-weight: 600;">${indicator.change}</td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="4">Failed to load economic indicators</td></tr>';
    }
}

async function loadMarketSentiment() {
    try {
        await simulateAPICall(1000);
        
        const fearGreedEl = document.getElementById('fearGreedIndex');
        const vixEl = document.getElementById('vixLevel');
        const putCallEl = document.getElementById('putCallRatio');
        
        if (fearGreedEl) fearGreedEl.textContent = (Math.random() * 100).toFixed(0);
        if (vixEl) vixEl.textContent = (Math.random() * 30 + 15).toFixed(2);
        if (putCallEl) putCallEl.textContent = (Math.random() * 0.5 + 0.7).toFixed(3);
    } catch (error) {
        console.error('Failed to load market sentiment');
    }
}

async function loadDetailedPositions() {
    const tableBody = document.getElementById('positionsTableBody');
    if (!tableBody) return;
    
    try {
        await simulateAPICall(1500);
        
        let html = '';
        demoData.positions.forEach(pos => {
            const pnl = (pos.currentPrice - pos.avgCost) * pos.quantity;
            const pnlPercent = ((pos.currentPrice - pos.avgCost) / pos.avgCost) * 100;
            const pnlColor = pnl >= 0 ? 'var(--success-green)' : 'var(--danger-red)';
            
            html += `
                <tr>
                    <td style="font-weight: 600; color: var(--accent-gold);">${pos.symbol}</td>
                    <td style="font-weight: 600;">${pos.quantity}</td>
                    <td>${pos.avgCost.toFixed(2)}</td>
                    <td style="font-weight: 600;">${pos.currentPrice.toFixed(2)}</td>
                    <td style="font-weight: 600;">${pos.marketValue.toLocaleString()}</td>
                    <td style="color: ${pnlColor}; font-weight: 600;">
                        ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                    </td>
                    <td style="color: ${pnlColor}; font-weight: 600;">
                        ${pnl >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%
                    </td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="7">Failed to load positions</td></tr>';
    }
}

async function loadTransactionHistory() {
    const tableBody = document.getElementById('transactionTableBody');
    if (!tableBody) return;
    
    try {
        await simulateAPICall(1000);
        
        const transactions = [
            { date: "2024-08-21", symbol: "AAPL", action: "BUY", quantity: 100, price: 148.50, total: 14850.00 },
            { date: "2024-08-20", symbol: "TSLA", action: "SELL", quantity: 50, price: 210.25, total: 10512.50 },
            { date: "2024-08-19", symbol: "MSFT", action: "BUY", quantity: 75, price: 290.80, total: 21810.00 },
            { date: "2024-08-18", symbol: "GOOGL", action: "BUY", quantity: 25, price: 2680.00, total: 67000.00 },
            { date: "2024-08-17", symbol: "SPY", action: "BUY", quantity: 150, price: 420.15, total: 63022.50 },
            { date: "2024-08-16", symbol: "NVDA", action: "SELL", quantity: 100, price: 415.75, total: 41575.00 }
        ];
        
        let html = '';
        transactions.forEach(tx => {
            const actionColor = tx.action === 'BUY' ? 'var(--success-green)' : 'var(--danger-red)';
            html += `
                <tr>
                    <td style="color: var(--text-secondary);">${tx.date}</td>
                    <td style="font-weight: 600; color: var(--accent-gold);">${tx.symbol}</td>
                    <td style="color: ${actionColor}; font-weight: 600;">${tx.action}</td>
                    <td style="font-weight: 600;">${tx.quantity}</td>
                    <td>${tx.price.toFixed(2)}</td>
                    <td style="font-weight: 600;">${tx.total.toLocaleString()}</td>
                </tr>
            `;
        });
        
        tableBody.innerHTML = html;
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="6">Failed to load transaction history</td></tr>';
    }
}

async function filterTransactionHistory() {
    const filter = document.getElementById('historyFilter').value;
    const tableBody = document.getElementById('transactionTableBody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '<tr><td colspan="6">Filtering transactions...</td></tr>';
    
    try {
        await simulateAPICall(800);
        loadTransactionHistory();
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="6">Failed to filter transactions</td></tr>';
    }
}

async function calculatePortfolioMetrics() {
    try {
        await simulateAPICall(1200);
        
        const totalReturnEl = document.getElementById('totalReturn');
        const sharpeEl = document.getElementById('sharpeRatio');
        const betaEl = document.getElementById('beta');
        const drawdownEl = document.getElementById('maxDrawdown');
        
        if (totalReturnEl) totalReturnEl.textContent = (Math.random() * 30 + 5).toFixed(2) + '%';
        if (sharpeEl) sharpeEl.textContent = (Math.random() * 2 + 0.5).toFixed(2);
        if (betaEl) betaEl.textContent = (Math.random() * 0.6 + 0.7).toFixed(2);
        if (drawdownEl) drawdownEl.textContent = '-' + (Math.random() * 15 + 5).toFixed(2) + '%';
    } catch (error) {
        console.error('Failed to calculate portfolio metrics');
    }
}

async function loadActiveOrders() {
    const display = document.getElementById('activeOrdersDisplay');
    if (!display) return;
    
    display.innerHTML = '<div class="loading"><div class="spinner"></div> Loading active orders...</div>';
    
    try {
        await simulateAPICall(1500);
        
        const activeOrders = demoData.orders.filter(order => order.status === 'PENDING');
        
        if (activeOrders.length === 0) {
            display.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 30px;">No active orders found</div>';
            return;
        }
        
        let html = '<h4 style="color: var(--accent-gold); margin-bottom: 15px;">Active Orders</h4>';
        
        activeOrders.forEach(order => {
            html += `
                <div style="background: var(--card-bg); border: 1px solid var(--accent-gold); border-radius: 12px; padding: 20px; margin: 15px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <strong style="color: var(--accent-gold); font-size: 1.1em;">${order.symbol}</strong>
                            <span style="margin-left: 15px; color: var(--text-primary);">${order.action} ${order.quantity} @ ${order.price}</span>
                        </div>
                        <button onclick="cancelOrder('${order.id}')" class="btn" style="background: var(--danger-red); padding: 8px 15px; font-size: 0.8em;">
                            Cancel
                        </button>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.9em; color: var(--text-secondary);">
                        <span>Order ID: ${order.id}</span>
                        <span>${order.timestamp}</span>
                    </div>
                </div>
            `;
        });
        
        display.innerHTML = html;
    } catch (error) {
        showError('activeOrdersDisplay', 'Failed to load active orders');
    }
}

async function cancelOrder(orderId) {
    try {
        await simulateAPICall(1000);
        
        const orderIndex = demoData.orders.findIndex(order => order.id === orderId);
        if (orderIndex > -1) {
            demoData.orders[orderIndex].status = 'CANCELLED';
        }
        
        loadActiveOrders();
        
        const display = document.getElementById('activeOrdersDisplay');
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.innerHTML = `✅ Order ${orderId} cancelled successfully`;
        display.insertBefore(successMsg, display.firstChild);
        
        setTimeout(() => {
            successMsg.remove();
        }, 3000);
        
    } catch (error) {
        console.error('Failed to cancel order:', error);
    }
}

async function cancelAllOrders() {
    if (!confirm('Are you sure you want to cancel all active orders?')) {
        return;
    }
    
    try {
        await simulateAPICall(2000);
        
        demoData.orders.forEach(order => {
            if (order.status === 'PENDING') {
                order.status = 'CANCELLED';
            }
        });
        

        loadActiveOrders();
        
    } catch (error) {
        console.error('Failed to cancel all orders:', error);
    }
}

function simulateAPICall(delay = 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() < 0.95) { 
                resolve();
            } else {
                reject(new Error('Network error'));
            }
        }, delay);
    });
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatPercentage(value) {
    return (value >= 0 ? '+' : '') + value.toFixed(2) + '%';
}


function startRealTimeUpdates() {
    if (!isConnected) return;
    
    setInterval(() => {
        updateWatchlistPrices();
        updateAccountMetrics();
    }, 15000); 
}

function updateWatchlistPrices() {
    demoData.watchlist.forEach(stock => {
        const changePercent = (Math.random() - 0.5) * 0.5; 
        const change = stock.price * (changePercent / 100);
        stock.price += change;
        stock.change += change;
        stock.changePercent = (stock.change / (stock.price - stock.change)) * 100;
    });
    

    if (currentPage === 'dashboard') {
        displayWatchlist(demoData.watchlist);
    }
}

function updateAccountMetrics() {
    const changePercent = (Math.random() - 0.5) * 0.1;
    demoData.account.totalValue *= (1 + changePercent / 100);
    demoData.account.dayPnL += demoData.account.totalValue * (changePercent / 100);
    
    demoData.positions.forEach(pos => {
        const priceChange = (Math.random() - 0.5) * 0.5;
        pos.currentPrice *= (1 + priceChange / 100);
        pos.marketValue = pos.currentPrice * pos.quantity;
    });
}

function exportPortfolioData() {
    const data = {
        account: demoData.account,
        positions: demoData.positions,
        orders: demoData.orders,
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'schwab_portfolio_' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function addTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.dataset.tooltip;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--dark-bg);
        color: var(--text-primary);
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        z-index: 1000;
        border: 1px solid var(--glass-border);
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    
    e.target._tooltip = tooltip;
}

function hideTooltip(e) {
    if (e.target._tooltip) {
        e.target._tooltip.remove();
        delete e.target._tooltip;
    }
}

function logPerformance() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('Page load time:', loadTime + 'ms');
    }
}

function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 400px;
        font-weight: 500;
        backdrop-filter: blur(10px);
        border: 1px solid var(--glass-border);
        animation: slideInRight 0.3s ease;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = 'rgba(16, 185, 129, 0.9)';
            notification.style.color = 'white';
            break;
        case 'error':
            notification.style.background = 'rgba(239, 68, 68, 0.9)';
            notification.style.color = 'white';
            break;
        case 'warning':
            notification.style.background = 'rgba(251, 191, 36, 0.9)';
            notification.style.color = 'white';
            break;
        default:
            notification.style.background = 'var(--card-bg)';
            notification.style.color = 'var(--text-primary)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(animationStyles);
            setTimeout(() => {
                showNotification('🚀 Schwab Pro Trading Platform Loaded Successfully!', 'success');
            }, 2000);
            
            
       