let rocket; 

function setup() {
  createCanvas(400, 500); 
  rocket = new Rocket(); 
}

function draw() {
  background(20); 
  rocket.display();
  rocket.move();
}


class Rocket {
  constructor() {
    this.x = 170; 
    this.y = 180; 
    this.speed = 5; 
  }

  display() {
    noStroke();
    fill(180);
    rect(this.x, this.y, 60, 150, 10);

    fill(200);
    rect(this.x + 15, this.y, 30, 150, 10);
    fill(100);
    rect(this.x, this.y, 15, 150, 10);

    fill(255, 0, 0);
    triangle(this.x, this.y, this.x + 60, this.y, this.x + 30, this.y - 50);

    fill(200, 0, 0);
    triangle(this.x + 10, this.y, this.x + 50, this.y, this.x + 30, this.y - 40);

    fill(0, 150, 255);
    ellipse(this.x + 30, this.y + 30, 25, 25);

    fill(255);
    ellipse(this.x + 35, this.y + 25, 10, 10);

    fill(255, 100, 0);
    triangle(this.x, this.y + 150, this.x - 40, this.y + 190, this.x, this.y + 190);
    triangle(this.x + 60, this.y + 150, this.x + 100, this.y + 190, this.x + 60, this.y + 190);

    fill(200, 80, 0);
    triangle(this.x + 2, this.y + 150, this.x - 30, this.y + 185, this.x, this.y + 185);
    triangle(this.x + 58, this.y + 150, this.x + 90, this.y + 185, this.x + 60, this.y + 185);

    fill(255, 200, 0);
    ellipse(this.x + 30, this.y + 210, 40, 60);

    fill(255, 100, 0);
    ellipse(this.x + 30, this.y + 240, 30, 50);

    fill(255, 50, 0);
    ellipse(this.x + 30, this.y + 260, 20, 40);

    fill(255, 255, 0, 80);
    ellipse(this.x + 30, this.y + 280, 60, 20);
  }

  move() {
    if (keyIsDown(LEFT_ARROW)) { 
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW)) { 
      this.x += this.speed;
    }

    this.x = constrain(this.x, 0, width - 60); 
  }
}