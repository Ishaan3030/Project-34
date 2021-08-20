
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Body = Matter.Body;

var backgroundImg, templeImage;
var backgroundMusic, gunshotSound, gameoverSound;
var angle, temple, ground, hunter, gun, bullet;
var bullets = [];
var deers = [];
var score = 0;

var deerAnimation=[];
var deerSpritedata, deerSpritesheet;

var diedeerAnimation=[];
var diedeerSpritedata, diedeerSpritesheet;

var isGameOver = false;
var isSound = false;

function preload(){
  backgroundImg = loadImage("background.jpg");
  templeImage = loadImage("temple.png");

  deerSpritedata = loadJSON("deer.json");
  deerSpritesheet = loadAnimation("deer1.png", "deer2.png");
  diedeerSpritedata = loadJSON("diedeer.json");
  diedeerSpritesheet = loadAnimation("deer3.png", "deer4.png");
  backgroundMusic = loadSound("backgroundMusic.mp3");
  gunshotSound = loadSound("gunshot.mp3");
  gameoverSound = loadSound("gameover.mp3");
}

function setup() {
  createCanvas(1200,800);
  ground = new Ground(0, height-1, width*2, 1);
  temple = new Temple(180, 450, 160, 200);
  hunter = new Hunter(160, 400, 130, 100);
  gun = new Gun(hunter.position.x-5, hunter.position.y, 90, 50);

  engine = Engine.create();
  world = engine.world;
  
  var deerFrames = deerSpritedata.frames;
  for (var i = 0; i < deerFrames.length; i++) {
    var pos = deerFrames[i].position;
    var img = deerSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    deerAnimation.push(img);
  }

  var diedeerFrames = diedeerSpritedata.frames;
  for (var i = 0; i < diedeerFrames.length; i++) {
    var pos = diedeerFrames[i].position;
    var img = diedeerSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    diedeerAnimation.push(img);
  }
}

  


function draw() 
{
  background(51);
  image(backgroundImg, 0, 0, width, height);
  Engine.update(engine);

  if (!backgroundMusic.isPlaying()) {
    backgroundMusic.play();
    backgroundMusic.setVolume(0.1);
  }

 ground.display();

  showDeers();

  for (var i = 0; i < bullets.length; i++) {
    showBullets(bullets[i], i);
    for (var j = 0; j < deers.length; j++) {
      if (bullets[i] !== undefined && deers[j] !== undefined) {
        var collision = Matter.SAT.collides(bullets[i].body, deers[j].body);
        if (collision.collided) {
          if (!deers[j].isBroken && !bullets[i].isSink) {
            score += 5;
            deers[j].remove(j);
            j--;
          }

          Matter.World.remove(world, bullets[i].body);
          bullets.splice(i, 1);
          i--;
        }
      }
    }
  }

  hunter.display();
  gun.display();
  temple.display();

  fill("yellow");
  textSize(40);
  text(`Score:${score}`, width - 200, 50);
  textAlign(CENTER, CENTER);
  
}

function keyPressed() {
  if (keyCode === DOWN_ARROW) {
    var bullet = new Bullet(gun.x, gun.y);
    bullet.trajectory = [];
    Matter.Body.setAngle(bullet.body, gun.angle);
    bullets.push(bullet);
  }
}

function showBullets(bullet, index) {
  bullet.display();
  bullet.animate();
  if (bullet.body.position.x >= width || bullet.body.position.y >= height - 50) {
    if (!bullet.isSink) {
      bullet.remove(index);
    }
  }
}

function showDeers() {  
  if (deers.length > 0) {
    if (
      deers.length < 4 &&
      deers[deers.length - 1].body.position.x < width - 300
    ) {
      var positions = [-40, -60, -70, -20];
      var position = random(positions);
      var deer = new Deer(
        width,
        height - 100,
        170,
        170,
        position,
        deerAnimation
      );
      deers.push(deer);
    }

    for (var i = 0; i < deers.length; i++) {
      Matter.Body.setVelocity(deers[i].body, {
        x: -0.9,
        y: 0
      });

      deers[i].display();
      deers[i].animate();
      var collision = Matter.SAT.collides(temple.body, deers[i].body);
      if (collision.collided && !deers[i].isBroken) {
         if(!isSound && !gameoverSound.isPlaying()){
          gameoverSound.play();
          isSound = true;
        }
        isGameOver = true;
        gameOver();
      }
    }
  } else {
    var deer = new Deer(width, height - 60, 170, 170, -60, deerAnimation);
    deers.push(deer);
  }
}

function keyReleased() {
  if (keyCode === DOWN_ARROW && !isGameOver) {
    gunshotSound.play();
    bullets[bullets.length - 1].shoot();
  }
}

function gameOver() {
  swal(
    {
      title: `Game Over!!!`,
      text: "Thanks for playing!!",
      imageUrl:
        "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
      imageSize: "150x150",
      confirmButtonText: "Play Again"
    },
    function(isConfirm) {
      if (isConfirm) {
        location.reload();
      }
    }
  );
}