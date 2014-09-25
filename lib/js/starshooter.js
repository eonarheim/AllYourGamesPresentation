// request animation frame polyfill
if(!window.requestAnimationFrame){
    window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame || 
    window.msRequestAnimationFrame || 
    function(callback){ 
        window.setInterval(callback, 1000/60);
    };
}

// Actor with built in collision detection
var Actor = function(x, y , width, height){
    var me = this;
    me.pos = {x : x || 0, y: y || 0};
    me.vel = {x : 0, y: 0};
    me.width = width || 0;
    me.height = height || 0;
    me.color = 'white';
    return me;
};

Actor.prototype.collides = function(actor){
    return ((this.pos.x + this.width) > actor.pos.x && 
    	this.pos.x < (actor.pos.x + actor.width) && 
    	(this.pos.y + this.height) > actor.pos.y && 
    	this.pos.y < (actor.pos.y + actor.height));
};

Actor.prototype.update = function(delta, game){
	this.pos.x += this.vel.x * delta/1000;
	this.pos.y += this.vel.y * delta/1000;
    
};

Actor.prototype.draw = function(delta, game){
	game.ctx.fillStyle = this.color;
	game.ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
};

// Sound
var AudioContext = new window.webkitAudioContext();
var Sound = function(soundUrl, volume, playOnLoad){
	var me = this;
	me.context = AudioContext;
	me.volume = me.context.createGain();
	me.volume.gain.value = volume || 1;

	me.soundUrl = soundUrl || "";
	me.loaded = false;
	me.buffer = null;
	me.sound = null;


	me.load = function(){
		var request = new XMLHttpRequest();
		request.open('GET', soundUrl);
		request.responseType = 'arraybuffer';
		request.onload = function(){
			me.context.decodeAudioData(request.response, function(decodedBuffer){
				me.buffer = decodedBuffer;
				me.loaded = true;
				if(playOnLoad){
					me.play();
				}
			});
		}
		request.send();
	};



	// load the sound
	me.load();
	return me;
};



Sound.prototype.play = function(){
	if(this.loaded){
		this.sound = this.context.createBufferSource(this.buffer);
		this.sound.buffer = this.buffer;
		this.sound.connect(this.volume);
		this.volume.connect(this.context.destination);
		this.sound.start(0);
	}
};

Sound.prototype.stop = function(){
	if(this.sound){
		this.sound.noteOff(0);
	}
}

// Animations
var Sprite = function(image, ctx, sx, sy, sw, sh){
    var me = this;
    if(typeof image == 'string'){
        me.image = new Image();
        me.image.src = image;
    }else{
        me.image = image;
	}

    me.ctx = ctx;
    me.draw = function(x, y, width, height){
        me.ctx.drawImage(me.image, sx, sy, sw, sh, x, y, width || sw, height || sh);
    };
};

var Animation = function(spritesheet, ctx, columns, rows, sw, sh, width, height){
    var me = this;
    var image = new Image();
    image.src = spritesheet;    
    var sprites = new Array(columns * rows);
    var currIndex = 0;
    me.speed = 50;
    me.loop = false;
    var lastTick = Date.now();

    for(var i = 0; i < rows; i++){
        for(var j = 0; j < columns; j++){
            sprites[j+i*columns] = new Sprite(image, ctx, j*sw, i*sh, sw, sh);
        }
    }
    
    var tick = function(){
    	var currentTime = Date.now();
    	if(currentTime - lastTick > me.speed){
        	currIndex = me.loop ? (currIndex + 1) % sprites.length : currIndex + 1;
        	lastTick = currentTime;
    	}
    };
    
    me.draw = function(x, y){
        tick();
        if(currIndex < sprites.length){
        	sprites[currIndex].draw(x, y, width, height);
    	}
    };

    me.done = function(){
    	return !me.loop && currIndex >= sprites.length;
    };

    return me;
};
//var animation = new Animation('images/spriteexplosion.png', 5, 5, 45, 45);

// Game container
var Game = function(canvasId){
	var me = this;
    var running = false;

    me.canvas = document.getElementById(canvasId);
    me.ctx = me.canvas.getContext('2d');

    me.actors = [];
    me.animations = [];
    me.keys = [];

    me.score = 0;
    me.lost = false;
    me.removeActor = function(actor){
        var index = me.actors.indexOf(actor);
        if(index > -1){
            me.actors.splice(index, 1);
        }
    };

    me.playAnimation = function(animation, x, y){
    	me.animations.push({anim: animation, x: x, y: y});
    };

    var clear = function(){
        me.ctx.fillStyle = 'black';
        me.ctx.fillRect(0, 0, me.canvas.width, me.canvas.height);
	};

    var drawFPS = function(fps){
        me.ctx.fillStyle = 'red';
        me.ctx.fillText('FPS: ' + fps.toFixed(1), 5, 20);
	};

	var drawScore = function(){
      me.ctx.save();
		me.ctx.translate(me.canvas.width - 20, 40);
		me.ctx.scale(2, 2);
		me.ctx.fillStyle = 'lime';
      me.ctx.font = "20px consolas";
      me.ctx.textAlign = "right";
      me.ctx.fillText(me.score, 0, 0);
      me.ctx.restore();
	};

	me.update = function(delta){
		// update state of the game
		// including players, npcs, scenery, animations, etc.
		me.actors.forEach(function(actor){
			actor.update(delta, me);
		});

		me.animations = me.animations.filter(function(a){
			return !a.anim.done();
		});
	};

	me.draw = function(delta){
		clear();
		// draw the game
        // draw players, npcs, scenery, animations, etc.
        me.actors.forEach(function(actor){
            actor.draw(delta, me);
        });

        me.animations.forEach(function(a){
        	a.anim.draw(a.x, a.y);
        });
	};

	me.lose = function(){
		me.lost = true;
	};
	var drawLoseMessage = function(){
		me.ctx.save();
		me.ctx.translate(20, me.canvas.height/2);
		me.ctx.scale(3, 3);
		me.ctx.fillStyle = 'red';
		me.ctx.fillText("ALL YOUR BASE ARE BELONG TO US", 0, 0);
		me.ctx.restore();
	};

	me.start = function(){
		// Setup key listeners
		window.addEventListener('keydown', function(e){
			if(me.keys.indexOf(e.keyCode) === -1){
				me.keys.push(e.keyCode);
			}
		});
		window.addEventListener('keyup', function(e){
			var index;
			if((index = me.keys.indexOf(e.keyCode)) > -1){
				me.keys.splice(index,1);
			}
		});

		// Start mainloop
        running = true;
		var lastTime =  Date.now();
		(function mainloop(){
            if(!running) return;
            
            window.requestAnimationFrame(mainloop);
            
			// Get the time to calculate time-elapsed
			var now = Date.now();
			var elapsed = Math.floor(now - lastTime);

			me.update(elapsed); 
			me.draw(elapsed);

			drawFPS(1/(elapsed/1000));
			drawScore();
			if(me.lost){
				drawLoseMessage();
			}

			lastTime = now;
		})();	
	};

	me.onstop = function(){

	};
    
    me.stop = function(){
        running = false;
        me.onstop();
    };

	return me;
};

// Initialize the game
if(game){
   game.stop();
}
var game = new Game('game');

// Setup helpers

var bullets = [];
var enemyBullets = [];
var enemies = [];

// Load resources
var allYourBase = new Sound('sounds/soundeffect.mp3', 0.05);
var soundTrack = new Sound('sounds/soundtrack.mp3',0.2, true);
var laser = new Sound('sounds/laser.mp3', 0.3, false);
var explode = new Sound('sounds/explode.wav', 0.3, false);
var enemyfire = new Sound('sounds/enemyfire.wav', 0.1, false);

var shipSprite = new Sprite('img/fighter.png', game.ctx, 0, 0, 40, 40);
var enemySprite = new Sprite('img/enemy.png', game.ctx, 0, 0, 40, 40);




// Bullet helper
var throttle = 500;//ms
var flipGun = false;
var lastFire = Date.now();
var fireBullet = function(x, y){
	var currentTime = Date.now();
	if(currentTime - lastFire > throttle){
		flipGun = !flipGun;
		var bullet = new Actor(x+40, flipGun?y:y+40, 10, 2);
		bullet.color = 'lime';
		var bulletSpeed = 900;
		bullet.update = function(delta, game){
			Actor.prototype.update.apply(this, [delta, game]);
			bullet.vel.x = bulletSpeed;

			// Check collisions with game boarders
			if((bullet.pos.x + bullet.width) > game.canvas.width){
				game.removeActor(bullet);
				var index = bullets.indexOf(bullet);
				bullets.splice(index, 1);
			}
			if((bullet.pos.y + bullet.height) > game.canvas.height){
				game.removeActor(bullet);
                var index = bullets.indexOf(bullet);
                bullets.splice(index, 1);
			}

		};
		laser.play();
		game.actors.push(bullet);
		bullets.push(bullet);
		lastFire = currentTime;
	}
};


// Enemy bulled helper
var enemyBullets = [];
var fireEnemyBullet = function(x, y){
   var bullet = new Actor(x, y+20, 10, 10);
   bullet.color = 'red';
   var bulletSpeed = -200;
   bullet.update = function(delta, game){
      Actor.prototype.update.apply(this, [delta, game]);
      bullet.vel.x = bulletSpeed;

      // Check collisions with game boarders
      if((bullet.pos.x + bullet.width) > game.canvas.width){
         game.removeActor(bullet);
         var index = enemyBullets.indexOf(bullet);
         enemyBullets.splice(index, 1);
      }
      if((bullet.pos.y + bullet.height) > game.canvas.height){
         game.removeActor(bullet);
             var index = enemyBullets.indexOf(bullet);
             enemyBullets.splice(index, 1);
      }

   };
   enemyfire.play();
   game.actors.push(bullet);
   enemyBullets.push(bullet);
}

// Setup enemies
var createEnemy = function(){
	var enemy = new Actor(game.canvas.width + 20, Math.random()*game.canvas.height, 40, 40);
   

	enemy.vel.x = -50;
	var angle = 0;
	var y = enemy.pos.y;
   var fireTimer = 0;
	enemy.update = function(delta, game){
		Actor.prototype.update.apply(enemy, [delta, game]);
		if(enemy.pos.x < -90) game.removeActor(enemy);
		angle += Math.PI/4 * delta/1000;
		enemy.pos.y = 100*Math.sin(angle) - 200 + y; 
      fireTimer += delta;
      if(fireTimer > 1000 + Math.random() * 500){
         fireEnemyBullet(enemy.pos.x, enemy.pos.y);
         fireTimer = 0;
      }

		// Check if bullet killed this enemy
		for(var i = 0; i < bullets.length; i++){
			if(bullets[i].collides(enemy)){
				game.score += 100;
				game.removeActor(bullets[i]);
				bullets.splice(i, 1);
				var explosion = new Animation('img/bombspritesheet.png', game.ctx, 3, 4, 280, 237.5, 100, 100);
            explode.play();
				game.playAnimation(explosion, enemy.pos.x, enemy.pos.y);
				game.removeActor(enemy);
				var index = enemies.indexOf(enemy);
				enemies.splice(index,1);
				break;
			}
		}
	};

	enemy.draw = function(){
		game.ctx.save();
		game.ctx.translate(enemy.pos.x, enemy.pos.y);
		game.ctx.scale(3, 3);
		enemySprite.draw(0, 0, 20, 20);
		game.ctx.restore();
	};
	enemies.push(enemy);
	game.actors.push(enemy);
};

// Setup starfield
var createStarField = function(starCount){
	var createStar = function(){
		var star = new Actor(Math.random()*game.canvas.width, Math.random()*game.canvas.height, 2, 2);
		star.vel.x = -Math.random()*100-100;
		star.vel.y = 0;
		star.color = 'white';
		star.update = function(delta, game){
			Actor.prototype.update.apply(star, [delta, game]);
			// Check collisions with game boarders
			if(star.pos.x < 0) star.pos.x = game.canvas.width;
		};
		
		game.actors.push(star);
	};
	for(var i = 0; i< starCount; i++){
		createStar();
	}
};

// Setup player 
var createPlayer = function(){
	// Setup player
	var actor = new Actor(50, 50, 20, 20);
	var speed = 100;
	var alive = true;
   actor.fireBullet = function(){
      fireBullet(actor.pos.x, actor.pos.y);
   };

   actor.moveUp = function(){
      actor.vel.y = -speed;
   }

   actor.moveDown = function(){
      actor.vel.y = speed;
   }

   actor.moveLeft = function(){
      actor.vel.x = -speed;
   }

   actor.moveRight = function(){
      actor.vel.x = speed;
   }

	actor.update = function(delta, game){
		Actor.prototype.update.apply(this, [delta, game]);
		//actor.vel.y = 0;
		//actor.vel.x = 0;

		if(game.keys.indexOf(38) > -1){
			actor.vel.y = -speed;
		}

		if(game.keys.indexOf(40) > -1){
			actor.vel.y = speed;
		}

		if(game.keys.indexOf(39) > -1){
			actor.vel.x = speed;
		}

		if(game.keys.indexOf(37) > -1){
			actor.vel.x = -speed;
		}

		if(game.keys.indexOf(32) > -1){
			fireBullet(actor.pos.x, actor.pos.y);
		}

		// Check collisions with game boarders
		if(actor.pos.x < 0) actor.pos.x = 0;
		if(actor.pos.y < 0) actor.pos.y = 0;
		if((actor.pos.x + actor.width) > game.canvas.width) actor.pos.x = game.canvas.width - actor.width;
		if((actor.pos.y + actor.height) > game.canvas.height) actor.pos.y = game.canvas.height - actor.height;

		// Check for collision with baddies
		// Check if bullet killed this enemy
		for(var i = 0; i < enemies.length; i++){
			if(enemies[i].collides(actor)){
				game.removeActor(enemies[i]);
				game.removeActor(actor);
				var explosion = new Animation('img/bombspritesheet.png', game.ctx, 3, 4, 280, 237.5, 100, 100);
				game.playAnimation(explosion, actor.pos.x, actor.pos.y);
            explode.play();
				game.lose();
				allYourBase.play();	
				break;
			}
		}

      for(var j=0; j < enemyBullets.length; j++){
         if(enemyBullets[j].collides(actor)){
            game.removeActor(enemies[i]);
            game.removeActor(actor);
            var explosion = new Animation('img/bombspritesheet.png', game.ctx, 3, 4, 280, 237.5, 100, 100);
            game.playAnimation(explosion, actor.pos.x, actor.pos.y);
            explode.play();
            game.lose();
            allYourBase.play();  
            break;
         }
      }

	};

	actor.draw = function(delta, game){
		game.ctx.save();
		game.ctx.translate(actor.pos.x, actor.pos.y);
		
		shipSprite.draw(-10, -10, 60, 60);
		

		game.ctx.restore();
	};
	game.actors.push(actor);
   return actor;
};

// Create game objects and start

// Create star field with 100 stars
createStarField(100);

// Create enemies every 2 seconds
setInterval(function(){
	createEnemy();
},2000);

// Add the player and start
var player = createPlayer();

soundTrack.play();
game.onstop = function(){
	soundTrack.stop();
}

// delay game start for a few seconds and wait for resources to load, you should write a loader
setTimeout(function(){
	game.start();	
},4000);

document.getElementById('stop-starshootr').addEventListener('mousedown', function(){
   if(this.innerText == "Pause"){
      this.innerText = "Play";
      game.stop();
   }else{
      this.innerText = "Pause";
      game.start()
   }
});


var gamepadSupportAvailable = !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
var gamepad = {};
gamepad.BUTTONS = {
  Face1: 0, // Face (main) buttons
  Face2: 1,
  Face3: 2,
  Face4: 3,
  LeftShoulder: 4, // Top shoulder buttons
  RightShoulder: 5,
  LeftShoulderBottom: 6, // Bottom shoulder buttons
  RightShoulderBottom: 7,
  Select: 8,
  Start: 9,
  LeftStick: 10, // Analogue sticks (if depressible)
  RightStick: 11,
  PadTop: 12, // Directional (discrete) pad
  PadBottom: 13,
  PadLeft: 14,
  PadRight: 15
};

gamepad.AXES = {
  LeftAnalogueX: 0,
  LeftAnalogueY: 1,
  RightAnalogueX: 2,
  RightAnalogueY: 3
};

var leftX = 96;
var leftY = 87;

var rightX = 400;
var rightY = 223; 

var cloneObject = function(obj){
   var newObj = {};
   for(var key in obj){
      if(obj.hasOwnProperty(key)){
         if(typeof obj[key] === 'object'){
            newObj[key] = cloneObject(obj[key]);
         }else{
            newObj[key] = obj[key];
         }
      }            
   }
   return newObj;
}

var oldPads = [];
var gamePadTimeStamps = [0, 0, 0, 0]
if(gamepadSupportAvailable){
   uToast.info("GamePad Support Available");
   oldPads = cloneObject(navigator.getGamepads());
   (function pollGamePads(){
      window.requestAnimationFrame(pollGamePads);

      var gamepads = navigator.getGamepads();
      for(var i = 0; i <gamepads.length; i++){
         if(gamepads[i] && (gamepads[i].timestamp != gamePadTimeStamps[i])){
            for(var b in gamepad.BUTTONS){
               var buttonIndex = gamepad.BUTTONS[b];
               if(gamepads[i].buttons[buttonIndex].value != oldPads[i].buttons[buttonIndex].value){
                  //debugger;
                  //uToast.info("Pad",i,"-", b, gamepads[i].buttons[buttonIndex].pressed?"pressed":"released","value",gamepads[i].buttons[buttonIndex].value);
                  try{
                    if(gamepads[i].buttons[buttonIndex].pressed){
                      if(buttonIndex === gamepad.BUTTONS.Face1){
                        player.fireBullet();
                      }
                      if(buttonIndex === gamepad.BUTTONS.PadTop){
                        player.moveUp();
                      }
                      if(buttonIndex === gamepad.BUTTONS.PadBottom){
                        player.moveDown();
                      }
                      if(buttonIndex === gamepad.BUTTONS.PadLeft){
                        player.moveLeft();
                      }
                      if(buttonIndex === gamepad.BUTTONS.PadRight){
                        player.moveRight();
                      }
                    }else{
                      if(buttonIndex === gamepad.BUTTONS.PadTop){
                        player.vel.y = 0;
                      }
                      if(buttonIndex === gamepad.BUTTONS.PadBottom){
                        player.vel.y = 0;
                      }
                      if(buttonIndex === gamepad.BUTTONS.PadLeft){
                        player.vel.x = 0;
                      }
                      if(buttonIndex === gamepad.BUTTONS.PadRight){
                        player.vel.x = 0;
                      }
                    }
                    
                  }catch(e){
                    uToast.error(e);
                  }

               }
            }

            for(var a in gamepad.AXES){
               var axesIndex = gamepad.AXES[a];
               if(Math.abs(gamepads[i].axes[axesIndex]-oldPads[i].axes[axesIndex])>.1){
                  //uToast.info("Pad",i,"-",a, gamepads[i].axes[axesIndex])
                  
               }
            }

            gamePadTimeStamps[i] = gamepads[i].timestamp;
         }            

         oldPads[i] = cloneObject(gamepads[i]);
      }
      
   })();
}



