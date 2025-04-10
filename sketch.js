// Global variables section:

// Array to store star objects for background
let stars = [];
// Array to store rock objects that will fall
let rocks = [];
// Main player object with position, health, and dimensions
let rocket = {
  x: 370,
  y: 300,
  health: 3,
  width: 40,
  height: 80
};

// Game progress tracking variables
let score = 0;
let level = 0;
// Current state of the game (menu, playing, etc.)
let gameState = "menu"; 
// Variables controlling game difficulty
let rockSpeed = 2;
let rockSpawnRate = 120;

// Level configuration data - each level has different difficulty parameters
const LEVELS = [
  { target: 10, speed: 2, spawn: 40, size: 80, rockCount: 1 },  // Level 1
  { target: 40, speed: 7, spawn: 30, size: 90, rockCount: 2 },   // Level 2 (harder)
  { target: 60, speed: 9, spawn: 20, size: 95, rockCount: 3 }  // Level 3 (even harder)
];

/* 
   I tried to define the player's rocket object with just `x` and `y` values like:
  let rocket = { x: 370, y: 300 };  
  However, as soon as I tried to make the rocket interact with other objects like rocks, 
  I realized I needed the width and height properties to detect collisions and manage rocket movement. 
  Adding `width` and `height` helped later on when I had to calculate if the rocket hit a falling rock. 
*/

// Initial setup function by p5.js
function setup() {
  // Create canvas matching window dimensions
  createCanvas(windowWidth, windowHeight); 

  // Generate 300 stars at random positions for background
  for (let i = 0; i < 300; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 2)
    });
  }
}

// Main drawing loop called continuously by p5.js
function draw() {
  // Black background
  background(0);
  // Draw all stars
  drawStars();
  
  // State machine for different game screens
  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "playing") {
    updateGame();
  } else if (gameState === "gameOver") {
    drawGameOver();
  } else if (gameState === "win") {
    drawWinScreen();
  } else if (gameState === "finalWin") {
    drawFinalWinScreen();
  }

  /* 
  I first handled the game states like this:
  if (score < 100) {
    updateGame();
  } else {
    drawWinScreen();
  }
  
  But I soon realized this wouldn’t be enough since the game had a main menu, multiple levels, and multiple screens (game over, win, etc.).
  I rewrote it to use a `gameState` variable instead. This made the game much easier to handle. 
  Now, I can easily switch between states like "menu", "playing", "gameOver", and so on.
  */
}

// Function to draw all stars in the background
function drawStars() {
  fill(255);
  noStroke();
  // Loop through all stars and draw each one
  for (let star of stars) {
    ellipse(star.x, star.y, star.size, star.size);
  }
}

// Function to draw the main menu screen
function drawMenu() {
  // Draw game title
  fill(255, 255, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("SPACE ROCKET", width / 2, 150);

  // Draw level selection buttons
  drawMenuButton("LEVEL 1", 250, 1);
  
  // Only show level 2 button if player has unlocked it
  if (score >= LEVELS[0].target || level > 1) drawMenuButton("LEVEL 2", 350, 2);
  
  // Only show level 3 button if player has unlocked it
  if (score >= LEVELS[1].target || level > 2) drawMenuButton("LEVEL 3", 450, 3);

  // Draw controls instruction
  fill(255);
  textSize(20);
  text("Use Arrow Keys to Move", width / 2, height - 50);

}

// Helper function to draw menu buttons
function drawMenuButton(label, y, lvl) {
  // Button background
  fill(100, 200, 255);
  rect(width / 2 - 100, y, 200, 60, 20);
  
  // Button text
  fill(0);
  textSize(32);
  text(label, width / 2, y + 30);
}

// Mouse click handler for menu interactions
function mousePressed() {
  // Only handle clicks when in menu state
  if (gameState === "menu") {
    // Check if click is within button area
    if (mouseX > width / 2 - 100 && mouseX < width / 2 + 100) {
      // Check which button was clicked and start appropriate level
      if (mouseY > 250 && mouseY < 310) startLevel(1);
      else if (mouseY > 350 && mouseY < 410 && (score >= LEVELS[0].target || level > 1)) startLevel(2);
      else if (mouseY > 450 && mouseY < 510 && (score >= LEVELS[1].target || level > 2)) startLevel(3);
    }
  }
}

// Function to initialize a level
function startLevel(lvl) {
  level = lvl;
  gameState = "playing";
  
  // Reset rocket position and health
  rocket = { x: width / 2, y: height / 2, health: 3, width: 40, height: 80 };

  // Clear existing rocks
  rocks = [];
  
  // Set difficulty parameters from LEVELS array
  rockSpeed = LEVELS[lvl - 1].speed;
  rockSpawnRate = LEVELS[lvl - 1].spawn;

  // Reset score for this level
  score = 0;

  /* 
 My first attempt at starting the level looked like this:
  if (lvl === 1) {
    rockSpeed = 2;
    rockSpawnRate = 40;
  }

  But this wasn’t scalable. As the number of levels increased, it became hard to manage multiple `if` statements. 
  I switched to using the `LEVELS` array to handle the difficulty parameters dynamically. 
  This was a big improvement because now the code can handle any number of levels and I don’t need to manually update values every time.
  */
}


// Main game update function
function updateGame() {
  updateRocket();
  updateRocks();
  checkWinCondition();
  drawHUD();
}

// Function to handle rocket movement and drawing

  /* 
  I was focused on handling the rocket's movement. I wanted the rocket to be able to move in all directions (left, right, up, and down) using the arrow keys. 
  At first, I wasn’t thinking about boundaries or how the rocket would interact with the edge of the screen, so my first version simply looked like this:
  if (keyIsDown(LEFT_ARROW)) rocket.x -= 5;
if (keyIsDown(RIGHT_ARROW)) rocket.x += 5;
if (keyIsDown(UP_ARROW)) rocket.y -= 5;
if (keyIsDown(DOWN_ARROW)) rocket.y += 5;

This worked fine at first, and the rocket moved around just as expected. But then I realized the rocket could easily fly off the screen, which would break the game. 
That’s when I realized I needed to add boundary checking, so the rocket wouldn’t move past the screen edges.
To fix this, I added boundary checks using max() and min().
  */

function updateRocket() {
  // Handle keyboard controls with boundary checking
  if (keyIsDown(LEFT_ARROW)) rocket.x = max(rocket.x - 5, 0);
  if (keyIsDown(RIGHT_ARROW)) rocket.x = min(rocket.x + 5, width - rocket.width);
  if (keyIsDown(UP_ARROW)) rocket.y = max(rocket.y - 5, 0);
  if (keyIsDown(DOWN_ARROW)) rocket.y = min(rocket.y + 5, height - rocket.height);
  //Now, the rocket would stop at the edges of the screen and wouldn’t fly off

  // Draw the rocket
  drawRocket();
}

// Detailed rocket drawing function
function drawRocket() {
  noStroke();
  // Main rocket body
  fill(180);
  rect(rocket.x, rocket.y, rocket.width, rocket.height, 8);
  
  // Rocket details
  fill(200);
  rect(rocket.x + rocket.width/4, rocket.y, rocket.width/2, rocket.height, 8);
  fill(100);
  rect(rocket.x, rocket.y, rocket.width/4, rocket.height, 8);
  
  // Rocket nose cone
  fill(255, 0, 0);
  triangle(rocket.x, rocket.y, 
           rocket.x + rocket.width, rocket.y, 
           rocket.x + rocket.width/2, rocket.y - rocket.width/2);
  
  // Nose cone detail
  fill(200, 0, 0);
  triangle(rocket.x + rocket.width/4, rocket.y, 
           rocket.x + rocket.width*0.75, rocket.y, 
           rocket.x + rocket.width/2, rocket.y - rocket.width/3);
  
  // Rocket window
  fill(0, 150, 255);
  ellipse(rocket.x + rocket.width/2, rocket.y + rocket.height/4, 15, 15);
  
  // Window highlight
  fill(255);
  ellipse(rocket.x + rocket.width/2 + 3, rocket.y + rocket.height/4 - 3, 6, 6);
  
  // Rocket engines
  fill(255, 100, 0);
  triangle(rocket.x, rocket.y + rocket.height, 
           rocket.x - rocket.width/2, rocket.y + rocket.height*1.2, 
           rocket.x, rocket.y + rocket.height*1.2);
  triangle(rocket.x + rocket.width, rocket.y + rocket.height, 
           rocket.x + rocket.width*1.5, rocket.y + rocket.height*1.2, 
           rocket.x + rocket.width, rocket.y + rocket.height*1.2);
  
  // Engine glow
  fill(255, 200, 0);
  ellipse(rocket.x + rocket.width/2, rocket.y + rocket.height*1.1, 25, 40);
}

function updateRocks() {
  // Spawn new rocks at regular intervals
  if (frameCount % rockSpawnRate === 0) {
    // Spawn multiple rocks based on level difficulty
    for (let i = 0; i < LEVELS[level - 1].rockCount; i++) {
      rocks.push({
        x: random(width - LEVELS[level - 1].size),
        y: -LEVELS[level - 1].size,
        size: LEVELS[level - 1].size,
        speed: rockSpeed
      });
    }
  }
  
  // Process all rocks
  for (let i = rocks.length - 1; i >= 0; i--) {
    // Move rock downward
    rocks[i].y += rocks[i].speed;
    
    noStroke();
    // Draw rock 
    fill(60, 60, 70);
    ellipse(rocks[i].x + rocks[i].size/2, rocks[i].y + rocks[i].size/2, rocks[i].size, rocks[i].size);
    
    fill(90, 90, 100);
    beginShape();
    vertex(rocks[i].x + rocks[i].size*0.3, rocks[i].y + rocks[i].size*0.2);
    vertex(rocks[i].x + rocks[i].size*0.7, rocks[i].y + rocks[i].size*0.3);
    vertex(rocks[i].x + rocks[i].size*0.8, rocks[i].y + rocks[i].size*0.6);
    vertex(rocks[i].x + rocks[i].size*0.4, rocks[i].y + rocks[i].size*0.7);
    vertex(rocks[i].x + rocks[i].size*0.2, rocks[i].y + rocks[i].size*0.5);
    endShape(CLOSE);
    
    fill(140, 140, 150);
    quad(
      rocks[i].x + rocks[i].size*0.4, rocks[i].y + rocks[i].size*0.3,
      rocks[i].x + rocks[i].size*0.6, rocks[i].y + rocks[i].size*0.4, 
      rocks[i].x + rocks[i].size*0.5, rocks[i].y + rocks[i].size*0.6,
      rocks[i].x + rocks[i].size*0.3, rocks[i].y + rocks[i].size*0.5
    );
    
    // Rock highlight
    fill(255, 150, 50, 180); 
    ellipse(
      rocks[i].x + rocks[i].size*0.65, 
      rocks[i].y + rocks[i].size*0.65, 
      rocks[i].size/4, 
      rocks[i].size/4
    );
    
    // Check for collision with rocket
    if (collides(rocket, rocks[i])) {
      rocks.splice(i, 1);
      rocket.health--;
      // Game over if health reaches 0
      if (rocket.health <= 0) gameState = "gameOver";
    } else if (rocks[i].y > height) {
      // Remove rock if it goes off bottom of screen and increment score
      rocks.splice(i, 1);
      score++;
    }
  }
}
/* When I was first working on detecting collisions between the rocket and the rocks, my goal was to make the game feel interactive,
so if a rock touches the rocket, something needs to happen. I started with a very basic idea: “If the x and y positions match, that must mean they're touching.” 
So my first try at a collision function was something like this:

js
Copy
Edit
function collides(obj1, obj2) {
  return obj1.x === obj2.x && obj1.y === obj2.y;
}
But the problem was it almost never worked. Even when the rocket and the rock clearly overlapped on the screen, the function returned false. 
I realized that in real games, collision detection isn’t about exact positions, it's about overlapping areas.

So I started researching and testing. I learned about AABB collision detection which is a common method to detect overlap between two rectangles. 
Even though the rocks are squares (they use size), and the rocket is a rectangle (width and height), I could still compare their edges using simple inequalities.

That’s when I rewrote the collides() function into what it is now: */

// Collision detection between two objects
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.size &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.size &&
         obj1.y + obj1.height > obj2.y;
}

// Check if player has completed the level
function checkWinCondition() {
  if (score >= LEVELS[level - 1].target) {
    // Special case for final level
    if (level === 3) gameState = "finalWin";
    else gameState = "win";
  }
}

// Draw heads-up display with game info
function drawHUD() {
  fill(255);
  textSize(24);
  text(`Score: ${score}/${LEVELS[level - 1].target}`, 100, 30); 
  text(`Level: ${level}`, 100, 60); 
  text("Health: ", 100, 90);  
  for (let i = 0; i < rocket.health; i++) {
    fill(255, 0, 0);
    rect(180 + i * 25, 75, 20, 20);  
  }
}
// Game over screen
function drawGameOver() {
  fill(255, 0, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2 - 50);
  textSize(24);
  text("Press SPACE to continue", width / 2, height / 2 + 100);
}

// Level complete screen
function drawWinScreen() {
  fill(0, 255, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("LEVEL COMPLETE!", width / 2, height / 2 - 50);
  textSize(24);
  text("Press SPACE to continue", width / 2, height / 2 + 100);
}

// Final victory screen!!!
function drawFinalWinScreen() {
  fill(0, 255, 0);
  textSize(64);
  textAlign(CENTER, CENTER);
  text("CONGRATULATIONS!", width / 2, height / 2 - 100);
  text("YOU'VE WON THE GAME!", width / 2, height / 2);
  textSize(24);
  text("Press SPACE to return to menu", width / 2, height / 2 + 100);
}

// Keyboard input handler
function keyPressed() {
  // Handle spacebar press on game over/win screens
  if (key === ' ' && (gameState === "gameOver" || gameState === "win" || gameState === "finalWin")) {
    gameState = "menu";
  }
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      