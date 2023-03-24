

//create a maze

let gridSize;

let shift = 0;

let gridLengthX;

const gridLengthY = 20;


function setup() {
  createCanvas(windowWidth, windowHeight);

  //gridSize = min((width - 50) / gridLengthX, (height - 50) / gridLengthY);
  gridSize = height / (gridLengthY);
  gridLengthX = Math.ceil(width / gridSize) + 2;

  mazeGenerator = new ScrollingMazeGenerator(gridLengthX, gridLengthY);
  
  while(mazeGenerator.guarenteedCompleted < gridLengthX){
    mazeGenerator.step();
  }
}

function draw() {
  background(0);

  shift -= 0.6;
  if(shift < -gridSize){
    shift = 0;
    mazeGenerator.removeRow();

    while(mazeGenerator.guarenteedCompleted < gridLengthX){
      mazeGenerator.step();
    }
  }

  if(mazeGenerator.guarenteedCompleted < gridLengthX * 2){
    mazeGenerator.step();
  }

  //draw the first gridLengthX rows of the maze
  for(let i = 0; i < gridLengthX; i++){
    for(let j = 0; j < mazeGenerator.maze[0].length; j++){
      drawShiftMazeCell(mazeGenerator.maze, i, j);
    }
  }

  function drawShiftMazeCell(maze, i, j){
    //draw the maze cell at the shifted position
    //the cell should be centered based on gridLengthX
    //dont draw the very top or very bottom walls of the maze

    let x = i * gridSize + width / 2 - gridLengthX * gridSize / 2 + shift;
    let y = j * gridSize + height / 2 - maze[0].length * gridSize / 2;

    stroke(200);
    strokeWeight(2);
    if (maze[i][j][2] == 1 && j != 0) {
      //top wall
      line(x, y, x + gridSize, y);
    }
    if (maze[i][j][1] == 1) {
      //right wall
      line(x + gridSize, y, x + gridSize, y + gridSize);
    }
    if (maze[i][j][0] == 1 && j != maze[0].length - 1) {
      //bottomaze wall
      line(x + gridSize, y + gridSize, x, y + gridSize);
    }
    if (maze[i][j][3] == 1) {
      //left wall
      line(x, y + gridSize, x, y);
    }


  }
}

class ScrollingMazeGenerator{

  constructor(gridLengthX, gridLengthY){
    this.gridLengthX = gridLengthX;
    this.gridLengthY = gridLengthY;
    
    this.maze = [];
    for (let i = 0; i < gridLengthX; i++) {
      this.maze.push([]);
      for (let j = 0; j < gridLengthY; j++) {
        this.maze[i].push([1, 1, 1, 1]);
      }
    }
    
    this.visited = [];
    for (let i = 0; i < gridLengthX; i++) {
      this.visited.push([]);
      for (let j = 0; j < gridLengthY; j++) {
        this.visited[i].push(false);
      }
    }
    
    this.stack = [];
    
    //start at a random cell
    //let currentX = Math.floor(Math.random() * gridLengthX);
    //let currentY = Math.floor(Math.random() * gridLengthY);
    let currentX = 0;
    let currentY = 0;

    this.stack.push([currentX, currentY]);
    this.visited[currentX][currentY] = true;

    this.guarenteedCompleted = -1;

  }

  appendRow(){
    this.maze.push([]);
    this.visited.push([]);
    for (let i = 0; i < this.gridLengthY; i++) {
      this.maze[this.gridLengthX].push([1, 1, 1, 1]);
      this.visited[this.gridLengthX].push(false);
    }
    this.gridLengthX++;
  }

  removeRow(){
    this.maze.splice(0, 1);
    this.visited.splice(0, 1);
    this.gridLengthX--;
    this.guarenteedCompleted--;

    //shift the stack
    for(let i = 0; i < this.stack.length; i++){
      this.stack[i][0]--;
    }

    //shift the current cell
    this.currentX--;

  }

  step(returnBack = false){


    if(this.stack.length == 0)return;


    let index = this.stack.length - 1;
    if(Math.random() < 0.1 || returnBack){
      //find the cell that is the farthest to the left
      index = 0;
      for(let i = 1; i < this.stack.length; i++){
        if(this.stack[i][0] < this.stack[index][0]){
          index = i;
        }
      }

      //set guaranteed completed to the farthest to the left cell - 1
      this.guarenteedCompleted = this.stack[index][0] - 1;
    }

    let current = this.stack[index];
    


    this.stack.splice(index, 1);

    //if the current cell is on the edge of the maze, add a row
    if(current[0] == this.maze.length - 1){
      this.appendRow();
    }

    

    let directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    //shuffle
    for (let i = 0; i < directions.length; i++) {
      let temp = directions[i];
      let index = Math.floor(Math.random() * directions.length);
      directions[i] = directions[index];
      directions[index] = temp;
    }

    let found = false;
    for(let i = 0; i < directions.length; i++){
      let newX = current[0] + directions[i][0];
      let newY = current[1] + directions[i][1];

      

      if(newX >= 0 && newX < this.maze.length && newY >= 0 && newY < this.maze[0].length && !this.visited[newX][newY]){

        //remove the wall between the two cells
        this.maze[current[0]][current[1]][getMapIndexFromDirection(directions[i])] = 0;
        this.maze[newX][newY][getMapIndexFromDirection(directions[i].map(x => -x))] = 0;

        //add this cell to the stack to be returned to later
        this.stack.push(current);

        this.visited[newX][newY] = true;
        this.stack.push([newX, newY]);

        found = true;

        break;

      }
    }

    if(!found){
      this.step(true);
    }
  }
  
}


function getMapIndexFromDirection(direction){
  if(direction[0] == 1 && direction[1] == 0){
    return 1;
  }else if(direction[0] == 0 && direction[1] == 1){
    return 0;
  }else if(direction[0] == -1 && direction[1] == 0){
    return 3;
  }else if(direction[0] == 0 && direction[1] == -1){
    return 2;
  }
}

function getOppositeMapIndex(index){
  if(index == 1){
    return 3;
  }else if(index == 2){
    return 0;
  }else if(index == 3){
    return 1;
  }else if(index == 0){
    return 2;
  }
}

function getDirectionFromMapIndex(index){
  if(index == 1){
    return [1, 0];
  }else if(index == 2){
    return [0, -1];
  }else if(index == 3){
    return [-1, 0];
  }else if(index == 0){
    return [0, 1];
  }
}
