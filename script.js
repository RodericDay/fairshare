// javascript is hilarious
range = n => "_".repeat(n+1).split('').map((c, i) => [String.fromCharCode(65+i), i+1]);
roundTo = (n, d) => Math.round(n * Math.pow(10, d)) * Math.pow(10, -d);

function changeSize(dnrow, dncol, cell) {
    data.nrow = Math.max(0, data.nrow+dnrow);
    data.ncol = Math.max(0, data.ncol+dncol);
    if (cell) { data.data[cell] = document.getElementById(cell).value }
    render();
    save();
}

function save() {
    localStorage.setItem("data", JSON.stringify(data));
}

function clear() {
    data.data = {};
    save();
    window.location = window.location;
}

function reset() {
    data = {nrow: 5, ncol: 5, data: {
        "A2": "Beef", "B2": "Dan", "C2": 200,
        "D1": "Dan", "E1": "Carly", "F1":"Harold", "D2": "1", "E2": "2", "F2": "3"}};
    save();
    window.location = window.location;
}

function render() {
    var newRootElement = generateRoot(data);
    ReactDOM.render(newRootElement, app);
}

function generateTable(data) {
    return React.createElement("table", {id: "table", key: "table"},
        React.createElement("tbody", {},
        range(data.nrow).map(([_,r]) => React.createElement("tr", {key: r},
        range(data.ncol).map(([c,_]) => React.createElement("td", {key: c},
        React.createElement("input", {id: c+r, className: "cell",
                            defaultValue: data.data[c+r],
                            onChange: _ => changeSize(0, 0, c+r)})
    ))))))
}

function generateButtons() {
    return React.createElement("div", {key: "buttonBar"}, [
        ["R-", _ => changeSize(-1, 0)],
        ["R+", _ => changeSize( 1, 0)],
        ["C-", _ => changeSize( 0,-1)],
        ["C+", _ => changeSize( 0, 1)],
        ["report", report],
        ["clear", clear],
        ["reset", reset],
    ].map(([label, action], i) =>
        React.createElement("button", {key: i, onClick: action}, label)))
}

function generateRoot(data) {
    return React.createElement("div", {}, [generateButtons(), generateTable(data)]);
}

function report() {
    // operate on visual data... just... cause...
    var names = Array.from(table.rows[0].cells).slice(3).map(cell => cell.firstChild.value);
    // set balances to zero for all participants
    var netBalances = {};
    names.forEach(name => netBalances[name] = 0);
    // extract the data that matters from the table
    var transactions = Array.from(table.rows)
        .slice(1) // skip first row
        .map(row => Array.from(row.cells)
            .map(cell => cell.firstChild.value) // get data
            .map((value, i) => i > 1 && value ? parseFloat(value) : value)
            .slice(1)) // skip description
        .filter(row => row[1]); // ignore transactions without debtor
    // obtain net balances of debt
    var tally = transactions.map(([person, amount, ...shares]) => shares.reduce((a, b)=>a+b));
    transactions.map(([person, amount, ...shares], i) => netBalances[person] += amount);
    transactions.map(([person, amount, ...shares], i) => shares.map((share, j) =>
        netBalances[names[j]] -= amount*share/tally[i]));
    // figure out payments required by clashing most indebted vs. most owed until resolution
    // we should at most need N-1 clashes, otherwise something went wrong
    var payments = [], N = names.length;
    for (i=0; i<N; i++) {
        names = names.filter(name => Math.abs(netBalances[name]) > 0.1)
                     .sort((a, b) => netBalances[a] > netBalances[b]);
        // success condition
        if (names.length==0) {
            alert(payments.join('\n'));
            return
        }
        var [A, B] = [names[0], names[names.length-1]];
        var exchange = Math.min(-netBalances[A], netBalances[B]);
        netBalances[A] += exchange;
        netBalances[B] -= exchange;
        payments.push(`${A} owes ${B} $${roundTo(exchange, 2)}`);
    }
    // error condition
    alert("There was an error.");
    throw JSON.stringify(netBalances);
}

data = null;
try { data = JSON.parse(localStorage.getItem("data")); }
catch (error) { reset(); }
if (!data) { reset(); }
render();
