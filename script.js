const N = 3; //3x3



 //PuzzleState ინახავს თამაშის კონკრეტულ მდგომარეობას.
class PuzzleState {
    constructor(board, x, y, depth, parent = null) {
        this.board = board; //დაფის მატრიცა

        this.x = x; // ცარიელი უჯრის კოორდინატები
        this.y = y; 

        this.depth = depth; //ნაბიჯების რაოდენობა (სიღრმე)
        this.parent = parent; // მშობელი მდგომარეობა (გადაწყვეტის გზის აღსადგენად)
    }
}

//მიმართულებები
const row = [-1, 1, 0, 0]; // ზევით, ქვევით
const col = [0, 0, -1, 1]; // მარცხნივ, მარჯვნივ


//ამოწმებს მივაღწიეთ თუ არა საბოლოო მდგომარეობაში
function isGoalState(board) {
    const goal = [[1, 2, 3], [4, 5, 6], [7, 8, 0]];
    return JSON.stringify(board) === JSON.stringify(goal);
}

function isValid(x, y) {
    return (x >= 0 && x < N && y >= 0 && y < N);
}

function printBoard(board) {
    for (let i = 0; i < N; i++) {
        console.log(board[i].join(" "));
    }
    console.log("----------");
}

// ფუნქცია ცარიელი უჯრის საპოვნელად
function findZero(board) {
    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            if (board[i][j] === 0) return { x: i, y: j };
        }
    }
}

//სიგანეში ძებნა
/*****************    არაინფორმირებული : BFS   ***************************************** */
async function solvePuzzleBFS(startBoard) {
    const { x, y } = findZero(startBoard); //ცარიელი უჯრის კოორდინატები

    //fifo
    const queue = [];
    const visited = new Set(); //მდგომარეობების სეტი

    const initialState = new PuzzleState(startBoard, x, y, 0, null);
    queue.push(initialState);
    visited.add(JSON.stringify(startBoard));


    let nodeCount=0; //კვანძების რაოდენობა

    while (queue.length > 0) {
        const curr = queue.shift(); //პირველი ელემენტი
        nodeCount++;
        /*if(curr.depth<30){
            console.log("Depth:"+curr.depth);
        }*/

        //საბოლოო მდგომარეობის შემოწმება
        if (isGoalState(curr.board)) {
            console.log(`Solution found in ${curr.depth} moves!`);
            console.log("შემოწმებული კვანძების რაოდენობა:"+nodeCount);


            // მშობლების ჯაჭვის გავლით გადაწყვეტის გზის აღდგენა
            const path = [];
            let node = curr;
            while (node !== null) {
                path.push(node.board);
                node = node.parent;
            }
            path.reverse(); // საწყისიდან საბოლოომდე

            //ვიზუალიზაცია
            for (const board of path) {
                render(board);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            return;
        }

        //შესაძლო მოძრაობების შემოწმება
        for (let i = 0; i < 4; i++) {
            const newX = curr.x + row[i];
            const newY = curr.y + col[i];

            if (isValid(newX, newY)) {
                const newBoard = curr.board.map(arr => [...arr]);
                [newBoard[curr.x][curr.y], newBoard[newX][newY]] =
                    [newBoard[newX][newY], newBoard[curr.x][curr.y]];

                const boardStr = JSON.stringify(newBoard);
                if (!visited.has(boardStr)) {
                    visited.add(boardStr);
                    queue.push(new PuzzleState(newBoard, newX, newY, curr.depth + 1, curr));
                }
            }
        }
    }
    console.log("Solution not found.");
}


/*****************    ინფორმირებული : A*   ***************************************** */

// მანჰეტენის დისტანცია: თითოეული ციფრის დაშორება თავის საბოლოო ადგილამდე
function getManhattanDistance(board) {
    let distance = 0;
    const goalPos = {
        1: [0, 0], 2: [0, 1], 3: [0, 2],
        4: [1, 0], 5: [1, 1], 6: [1, 2],
        7: [2, 0], 8: [2, 1], 0: [2, 2]
    };

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            let val = board[i][j];
            if (val !== 0) {
                let [targetX, targetY] = goalPos[val];
                distance += Math.abs(i - targetX) + Math.abs(j - targetY);
            }
        }
    }
    return distance;
}

// 2. A* ალგორითმის ფუნქცია (შენი BFS-ის სტილში)
async function solvePuzzleAStar(startBoard) {
    const { x, y } = findZero(startBoard);
    
    // A* იყენებს Priority Queue-ს   
    //მარტივი მასივით და სორტირებით 
    let pq = []; 
    const visited = new Set();

    let initialState = new PuzzleState(startBoard, x, y, 0, null);
    initialState.h = getManhattanDistance(startBoard); //ევრისტიკული ფასი
    initialState.f = initialState.depth + initialState.h; // f(n) = g(n) + h(n)
    
    pq.push(initialState);
    visited.add(JSON.stringify(startBoard));
    let nodeCount=0;

    while (pq.length > 0) {
        // სორტირება f მნიშვნელობით
        pq.sort((a, b) => a.f - b.f);
        const curr = pq.shift();

        nodeCount++;
        if (isGoalState(curr.board)) {
            console.log(`A* Solution found in ${curr.depth} moves!`);
            console.log("შემოწმებული კვანძების რაოდენობა:"+nodeCount);

            // გზის აღდგენა იგივეა 
            const path = [];
            let node = curr;
            while (node !== null) {
                path.push(node.board);
                node = node.parent;
            }
            path.reverse();

            for (const board of path) {
                render(board);
                await new Promise(resolve => setTimeout(resolve, 400));
            }
            return;
        }

        // მეზობლების გამოკვლევა 
        for (let i = 0; i < 4; i++) {
            const newX = curr.x + row[i];
            const newY = curr.y + col[i];

            if (isValid(newX, newY)) {
                const newBoard = curr.board.map(arr => [...arr]);
                [newBoard[curr.x][curr.y], newBoard[newX][newY]] = 
                    [newBoard[newX][newY], newBoard[curr.x][curr.y]];

                const boardStr = JSON.stringify(newBoard);
                if (!visited.has(boardStr)) {
                    visited.add(boardStr);
                    let nextState = new PuzzleState(newBoard, newX, newY, curr.depth + 1, curr);
                    
                    // A*-ისთვის დამატებითი გამოთვლა
                    nextState.h = getManhattanDistance(newBoard);
                    nextState.f = nextState.depth + nextState.h;
                    
                    pq.push(nextState);
                }
            }
        }
    }
}


// ****************************************************************


// main
const start = [
    [1, 4, 5],
    [3, 7, 2],
    [0, 8, 6]
];
function render(board) {
    const container = document.getElementById('board-container');
    if (!container) return; 

    container.innerHTML = ''; 
    board.forEach(row => {
        row.forEach(cellValue => {
            const cell = document.createElement('div');
            cell.className = 'cell' + (cellValue === 0 ? ' empty' : '');
            cell.textContent = cellValue !== 0 ? cellValue : '';
            container.appendChild(cell);
        });
    });
}
render(start);

console.log("საწყისი მდგომარეობა:");
printBoard(start);

