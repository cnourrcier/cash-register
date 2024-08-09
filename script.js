let cash = document.getElementById('cash');
let changeDue = document.getElementById('change-due');
let cashInDrawer = document.getElementById('cash-in-drawer');
const purchaseBtn = document.getElementById('purchase-btn');

let price = 1.87;

let cid = [
    ['PENNY', 1.01],
    ['NICKEL', 2.05],
    ['DIME', 3.1],
    ['QUARTER', 4.25],
    ['ONE', 90],
    ['FIVE', 55],
    ['TEN', 20],
    ['TWENTY', 60],
    ['ONE HUNDRED', 100]
];

const denominationValues = {
    'PENNY': 0.01,
    'NICKEL': 0.05,
    'DIME': 0.10,
    'QUARTER': 0.25,
    'ONE': 1.00,
    'FIVE': 5.00,
    'TEN': 10.00,
    'TWENTY': 20.00,
    'ONE HUNDRED': 100.00
};

function updateCashInDrawer() {
    cashInDrawer.innerHTML = ''; // Clear previous content
    cid.forEach(([money, amount]) => {
        cashInDrawer.innerHTML += `<div>${money}: $${amount.toFixed(2)}</div>`;
    });
};

function displayResults(drawerStatus, totalAmountPerValue) {
    changeDue.innerHTML = ''; // Clear previous results
    changeDue.innerHTML += `<div>${drawerStatus}</div>`;
    totalAmountPerValue.forEach(value => {
        changeDue.innerHTML += `<div>${value}</div>`;
    })

    updateCashInDrawer();
}

function getTotalCashInDrawer() {
    return roundToTwoDecimalPlaces(cid.reduce((sum, [_, amount]) => sum + amount, 0));
};

function calculateChangeForDenomination(change, denomination, denominationValue, cidCopy) {
    let changeAvailable = 0;
    while (cidCopy[denomination][1] > 0 && change >= denominationValue) {
        changeAvailable = roundToTwoDecimalPlaces(changeAvailable + denominationValue);
        change = roundToTwoDecimalPlaces(change - denominationValue);
        cidCopy[denomination][1] = roundToTwoDecimalPlaces(cidCopy[denomination][1] - denominationValue);
    }

    return { change, changeAvailable };
}

function checkStatus(change) {
    if (change === 0) {
        return 'No change due - customer paid with exact cash';
    }

    const totalCashInDrawer = getTotalCashInDrawer();

    if (totalCashInDrawer < change) {
        return 'Status: INSUFFICIENT_FUNDS';
    } else if (change < 0) {
        alert('Customer does not have enough money to purchase the item');
        return 'Status: INSUFFICIENT_FUNDS';
    } else if (totalCashInDrawer === change) {
        return 'Status: CLOSED';
    }

    // Check if it is possible to return the exact change
    let tempChange = change;
    let cidCopy = JSON.parse(JSON.stringify(cid)); // Create a copy of cid
    for (let i = cidCopy.length - 1; i >= 0; i--) {
        let denominationValue = denominationValues[cid[i][0]];
        let result = calculateChangeForDenomination(tempChange, i, denominationValue, cidCopy);
        tempChange = result.change;
    }

    if (tempChange > 0) {
        return 'Status: INSUFFICIENT_FUNDS';
    }
    else {
        return 'Status: OPEN';
    }
};

function roundToTwoDecimalPlaces(value) {
    return Math.round(value * 100) / 100;
}

function processTransaction(price, cash) {
    let change = roundToTwoDecimalPlaces(cash - price);
    let drawerStatus = checkStatus(change);
    let totalAmountPerValue = [];

    if (drawerStatus !== 'Status: OPEN' && drawerStatus !== 'Status: CLOSED') {
        return { drawerStatus, totalAmountPerValue: [] };
    }

    for (let i = cid.length - 1; i >= 0; i--) {
        let denominationValue = denominationValues[cid[i][0]];
        let result = calculateChangeForDenomination(change, i, denominationValue, cid);
        change = result.change;
        if (result.changeAvailable > 0) {
            totalAmountPerValue.push(`${cid[i][0]}: $${result.changeAvailable.toFixed(2)} `)
        }
    }

    if (change > 0) {
        return { drawerStatus: 'Status: INSUFFICIENT_FUNDS', totalAmountPerValue: [] };
    }

    return { drawerStatus, totalAmountPerValue };
}

purchaseBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const cashValue = parseFloat(cash.value);
    if (isNaN(cashValue)) {
        console.error('Invalid input');
        return;
    }

    const { drawerStatus, totalAmountPerValue } = processTransaction(price, cashValue);
    displayResults(drawerStatus, totalAmountPerValue);
    cash.value = '';
});

updateCashInDrawer();