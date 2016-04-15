range = n => "_".repeat(n+1).split('').map((c, i) => [String.fromCharCode(65+i), i+1])

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
    return React.createElement("table", {key: "table"},
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
        ["C-", _ => changeSize( 0,-1)],
        ["C+", _ => changeSize( 0, 1)],
        ["R-", _ => changeSize(-1, 0)],
        ["R+", _ => changeSize( 1, 0)],
        ["clear", clear],
        ["reset", reset],
    ].map(([label, action], i) =>
        React.createElement("button", {key: i, onClick: action}, label)))
}

function generateRoot(data) {
  return React.createElement("div", {}, [generateButtons(), generateTable(data)]);
}

data = null;
try { data = JSON.parse(localStorage.getItem("data")); }
catch (error) { reset(); }
if (!data) { reset(); }
render();
