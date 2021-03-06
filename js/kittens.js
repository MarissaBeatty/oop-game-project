// This sectin contains some game constants. It is not super interesting
var GAME_WIDTH = 375;
var GAME_HEIGHT = 500;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 156;
var MAX_ENEMIES = 3;

var TOMATO_WIDTH = 75;
var TOMATO_HEIGHT = 78;
var MAX_TOMATOES = 1;

var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 67;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;

// These two constants allow us to DRY
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';

// Preload game images
var images = {};
['enemy.png', 'rainbow.png', 'player.png', 'tomato.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});

//soundtrack
var audio = document.createElement("audio");
audio.src = "audio/puppysong.mp3";
audio.play();
audio.loop = true;

//isPlayerDead audio
var deadAudio = document.createElement("audio");
deadAudio.src = "audio/doh.mp3";

//tomato points audio
var pointsAudio = document.createElement("audio");
pointsAudio.src = "audio/eat.wav";


// This section is where you will be doing most of your coding
class Entity{
     render(ctx) {
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}

class Enemy extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['enemy.png'];

        // Each enemy should have a different speed
        this.speed = Math.random() / 2 + 0.25;
    }

    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed;
    }
}

class Tomato extends Entity {
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = GAME_HEIGHT - TOMATO_HEIGHT - 10;
        this.sprite = images['tomato.png'];
    }
    
}

class Player extends Entity {
    constructor() {
        super();
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['player.png'];
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        }
        else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        }
    }

}




/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/
class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();

        // Setup enemies, making sure there are always three
        this.setupEnemies();
        
        // set up tomatoes
        this.setupTomatoes();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH;

        var enemySpot;
       // Keep looping until we find a free enemy spot at random
        while (!enemySpot && this.enemies[enemySpot]) { //M: change from || (or) to && (and); "this.enemies[enemySpot]" refers to 1 of 5 slots on the screen, and !enemySpot checks that it's currently not occupied by an enemy. Need for both to be true to properly find a slot. Before it was only  
            enemySpot = Math.floor(Math.random() * enemySpots);
        }
        

        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
    }
    
    //setup tomatoes 
     setupTomatoes() {
        if (!this.tomatoes) {
            this.tomatoes = [];
        }

        while (this.tomatoes.filter(e => !!e).length < MAX_TOMATOES) {
            this.addTomato();
        }
    }

    // This method finds a random spot where there is no tomato, and puts one in there
    addTomato() {
        var tomatoSpots = GAME_WIDTH / TOMATO_WIDTH;

        var tomatoSpot;
      // Keep looping until we find a free spot at random
        while (!tomatoSpot && this.tomatoes[tomatoSpot]) {  
            tomatoSpot = Math.floor(Math.random() * tomatoSpots);
        }
        
        this.tomatoes[tomatoSpot] = new Tomato(tomatoSpot * TOMATO_WIDTH);
    }

    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();

        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
        });

        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));
        
        // Draw everything!
        this.ctx.drawImage(images['rainbow.png'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.tomatoes.forEach(tomato => tomato.render(this.ctx)); // draw tomatoes
        this.player.render(this.ctx); // draw the player

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.setupEnemies();
        
        //are tomatoes being eaten?
        this.tomatoes.forEach((tomato, tomatoIdx) => {
            if (tomato.x === this.player.x) {
                delete this.tomatoes[tomatoIdx];
                this.lastFrame = Date.now();
                requestAnimationFrame(this.gameLoop);
                pointsAudio.play();
                this.score = this.score + 1000; 
            }
        });
        this.setupTomatoes();
    
         // Check if player is dead
        if (this.isPlayerDead()) {
            // If they are dead, then it's game over!
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillStyle = '#9602f2';
            this.ctx.fillText(this.score + ' SHE CAN HAZ VEGBURGER', 5, 200);
            audio.pause();
            deadAudio.play();
        }
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score, 5, 30);

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }

    isPlayerDead() {
       // TODO: fix this function!
       // loop through enemies 
        
        for(var i = 0; i < this.enemies.length; i++) {
            //check if any have same position as player
             if(this.enemies[i] //is there an enemy in the game
             &&this.enemies[i].x === this.player.x //are they on the same horizontal position
             && this.enemies[i].y + ENEMY_HEIGHT/2 > this.player.y) { //is the enemy halfway over the player on the y axis
                     return true; //is dead because enemy has same position as player
                 } 
                
            
        } return false;
    }

}


// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();