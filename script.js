const rows = 15;
const cols = 25;
let grid = Array.from({ length: rows }, () => Array(cols).fill(0));
let mode = "wall";
let startCell = null;
let endCell = null;

function createGrid() {
    const gridDiv = document.getElementById("grid");
    gridDiv.innerHTML = "";
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.onclick = handleCellClick;
            gridDiv.appendChild(cell);
        }
    }
}

function setMode(m) { mode = m; }

function handleCellClick(e) {
    let cell = e.target;
    let r = parseInt(cell.dataset.row);
    let c = parseInt(cell.dataset.col);

    if (mode === "wall") {
        grid[r][c] = 1;
        cell.className = "cell wall";
    } 
    else if (mode === "removeWall") {
        grid[r][c] = 0;
        cell.className = "cell";
    } 
    else if (mode === "start") {
        if (startCell) startCell.classList.remove("start");
        startCell = cell;
        cell.className = "cell start";
    } 
    else if (mode === "end") {
        if (endCell) endCell.classList.remove("end");
        endCell = cell;
        cell.className = "cell end";
    }
}

function getCoords(cell) {
    return [parseInt(cell.dataset.row), parseInt(cell.dataset.col)];
}

function getNeighbors([r, c]) {
    let dirs = [[1,0], [-1,0], [0,1], [0,-1]];
    let neighbors = [];
    for (let [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] !== 1) {
            neighbors.push([nr, nc]);
        }
    }
    return neighbors;
}

function visualizePath(path) {
    for (let i = 0; i < path.length; i++) {
        setTimeout(() => {
            let [r, c] = path[i];
            let cell = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
            if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
                cell.classList.add("path");
            }
        }, 50 * i);
    }
}

function visualizeVisited(visited) {
    visited.forEach(([r, c], i) => {
        setTimeout(() => {
            let cell = document.querySelector(`[data-row='${r}'][data-col='${c}']`);
            if (!cell.classList.contains("start") && !cell.classList.contains("end")) {
                cell.classList.add("visited");
            }
        }, 20 * i);
    });
}

function bfs(start, end) {
    let queue = [start];
    let visited = new Set();
    let parent = {};
    visited.add(start.toString());
    let visitedOrder = [];

    while (queue.length) {
        let node = queue.shift();
        visitedOrder.push(node);
        if (node.toString() === end.toString()) break;

        for (let nb of getNeighbors(node)) {
            if (!visited.has(nb.toString())) {
                visited.add(nb.toString());
                parent[nb] = node;
                queue.push(nb);
            }
        }
    }
    return { parent, visitedOrder };
}

function dfs(start, end) {
    let stack = [start];
    let visited = new Set();
    let parent = {};
    let visitedOrder = [];

    while (stack.length) {
        let node = stack.pop();
        if (visited.has(node.toString())) continue;
        visited.add(node.toString());
        visitedOrder.push(node);
        if (node.toString() === end.toString()) break;

        for (let nb of getNeighbors(node)) {
            if (!visited.has(nb.toString())) {
                parent[nb] = node;
                stack.push(nb);
            }
        }
    }
    return { parent, visitedOrder };
}

function dijkstra(start, end) {
    let dist = {};
    let parent = {};
    let visitedOrder = [];
    let pq = [[0, start]];

    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
            dist[[r,c]] = Infinity;

    dist[start] = 0;

    while (pq.length) {
        pq.sort((a,b) => a[0] - b[0]);
        let [d, node] = pq.shift();
        visitedOrder.push(node);

        if (node.toString() === end.toString()) break;

        for (let nb of getNeighbors(node)) {
            let nd = d + 1;
            if (nd < dist[nb]) {
                dist[nb] = nd;
                parent[nb] = node;
                pq.push([nd, nb]);
            }
        }
    }
    return { parent, visitedOrder };
}

function aStar(start, end) {
    let g = {};
    let f = {};
    let parent = {};
    let visitedOrder = [];

    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            g[[r,c]] = Infinity;
            f[[r,c]] = Infinity;
        }

    g[start] = 0;
    f[start] = heuristic(start, end);

    let openSet = [start];

    while (openSet.length) {
        openSet.sort((a,b) => f[a] - f[b]);
        let node = openSet.shift();
        visitedOrder.push(node);

        if (node.toString() === end.toString()) break;

        for (let nb of getNeighbors(node)) {
            let tentativeG = g[node] + 1;
            if (tentativeG < g[nb]) {
                parent[nb] = node;
                g[nb] = tentativeG;
                f[nb] = g[nb] + heuristic(nb, end);
                if (!openSet.some(n => n.toString() === nb.toString())) {
                    openSet.push(nb);
                }
            }
        }
    }
    return { parent, visitedOrder };
}

function heuristic(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function reconstructPath(parent, start, end) {
    let path = [];
    let curr = end;
    while (curr && curr.toString() !== start.toString()) {
        path.unshift(curr);
        curr = parent[curr];
    }
    return path;
}

function runBFS() {
    if (!startCell || !endCell) return alert("Set start and end first!");
    let start = getCoords(startCell);
    let end = getCoords(endCell);
    let { parent, visitedOrder } = bfs(start, end);
    visualizeVisited(visitedOrder);
    setTimeout(() => visualizePath(reconstructPath(parent, start, end)), visitedOrder.length * 20);
}

function runDFS() {
    if (!startCell || !endCell) return alert("Set start and end first!");
    let start = getCoords(startCell);
    let end = getCoords(endCell);
    let { parent, visitedOrder } = dfs(start, end);
    visualizeVisited(visitedOrder);
    setTimeout(() => visualizePath(reconstructPath(parent, start, end)), visitedOrder.length * 20);
}

function runDijkstra() {
    if (!startCell || !endCell) return alert("Set start and end first!");
    let start = getCoords(startCell);
    let end = getCoords(endCell);
    let { parent, visitedOrder } = dijkstra(start, end);
    visualizeVisited(visitedOrder);
    setTimeout(() => visualizePath(reconstructPath(parent, start, end)), visitedOrder.length * 20);
}

function runAStar() {
    if (!startCell || !endCell) return alert("Set start and end first!");
    let start = getCoords(startCell);
    let end = getCoords(endCell);
    let { parent, visitedOrder } = aStar(start, end);
    visualizeVisited(visitedOrder);
    setTimeout(() => visualizePath(reconstructPath(parent, start, end)), visitedOrder.length * 20);
}

function resetGrid() {
    grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    startCell = null;
    endCell = null;
    createGrid();
}

createGrid();