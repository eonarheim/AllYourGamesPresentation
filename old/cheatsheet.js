//cheetsheet.js

// Drawing
var canvas = document.getElementById('canvas1');
var ctx = canvas.getContext('2d');

var erase = function(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,canvas.width, canvas.height);
};

// rectangles
ctx.fillStyle = 'white';
ctx.fillRect(50, 50, 50, 50);

// circles
erase();
ctx.fillStyle = 'red';
ctx.beginPath();
ctx.arc(50, 50, 10, 0, Math.PI*1);
ctx.closePath();
ctx.fill();

// text
erase();
ctx.fillStyle = 'white';
ctx.fillText('Hello Canvas!', 100,100);

// images
erase();
var image = new Image();
image.src = './images/me.png';
ctx.drawImage(image, 0, 0, 213, 500, 75, 0, 100, 150);

// affine transformations
erase();
ctx.save();
ctx.translate(100,100);
ctx.rotate(Math.PI/4);
ctx.scale(2, 2);
ctx.fillStyle = 'white';
ctx.fillText('Rotated Text', -50, -10);
ctx.restore();

// Movement
if(!window.requestAnimationFrame){
    window.requestAnimationFrame = webkitRequestAnimationFrame ||
    mozRequestAnimationFrame || msRequestAnimationFrame || 
    function(callback){window.setInterval(callback, 1000/60)};
}

var canvas = document.getElementById('canvas2');
var ctx = canvas.getContext('2d');

var x = 10;
var y = 10;
var dx = 1;
var dy = 0;

var running = true;
(function mainloop(){
    if(!running) return;

    window.requestAnimationFrame(mainloop);
    
    // Update position
    x += dx;
    y += dy;
    
    dx += 1;
    dy += 0;
    
    // Clear Canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw shape
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, 50, 50);
})();


// Timing

var canvas = document.getElementById('canvas3');
var ctx = canvas.getContext('2d');

var clear = function(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};
var drawFPS = function(fps){
    ctx.fillStyle = 'red';
    ctx.fillText('FPS: ' + fps.toFixed(1), 5, 20);
};

var x = 0;
var y = 40;
var dx = 3;
var dy = 0;

var update = function(delta){
    var seconds = delta/1000;
    x += dx*seconds;
    y += dy*seconds;    
};

var draw = function(){
    clear();
    ctx.fillStyle = 'blue';
    ctx.fillRect(x, y, 30, 30);
};

var lastTime =  Date.now();
var interval = setInterval(function(){
	// Get the time to calculate time-elapsed
	var now = Date.now();
	var elapsed = Math.floor(now - lastTime);
    update(elapsed);
    draw();
    drawFPS(1/(elapsed/1000));

	lastTime = now;
}, 16);	

// mainloop
var Game = function(){
	var me = this;
	me.update = function(delta){
		// update state of the game
		// including players, npcs, scenery, animations, etc.
	};

	me.draw = function(delta){
		// draw the game
	};

	me.start = function(){
		// todo: implement gameloop
		var lastTime =  Date.now();
		setInterval(function(){
			// Get the time to calculate time-elapsed
			var now = Date.now();

			var elapsed = Math.floor(now - lastTime);

			me.update(elapsed); 
			me.draw(elapsed);

			lastTime = now;
		}, 30);	
	};

	return me;
};

var game = new Game();
game.start();

// Rectangular collision
var Rect = function(x, y, w, h){
    var me = this;
    me.x = x;
    me.y = y;
    me.w = w;
    me.h = h;
    return me;
};

var collides = function(rectA, rectB){
    var ARight = rectA.x + rectA.w;
    var BRight = rectB.x + rectB.w;
    var ABottom = rectA.y + rectA.h;
    var BBottom = rectB.y + rectB.h;
    
    return ARight > rectB.x &&
    rectA.x < BRight &&
    ABottom > rectB.y &&
    rectA.y < BBottom;
};

// Sound Api
var sound = document.createElement('audio');
document.body.appendChild(sound);
sound.src = 'sounds/soundeffect.mp3';
sound.volume = 0.5;

var button = document.getElementById('btn-html-audio-play');
button.addEventListener("click", function(){
    sound.play();
});

// Webaudio Api
var context = new window.webkitAudioContext();
var volume = context.createGain();
volume.gain.value = 0.6;

var buffer = null;

var load = function(){
  var request = new XMLHttpRequest();
  request.open('GET', 'sounds/soundeffect.mp3');
  request.responseType = 'arraybuffer';
  request.onload = function(){
      context.decodeAudioData(request.response, function(decodedBuffer){
          buffer = decodedBuffer;
      });
  };
  request.send();
};

var play = function(){
    var sound = context.createBufferSource();
    sound.buffer = buffer;
    sound.connect(volume);
    volume.connect(context.destination);
    sound.start(0);
};

load();

var button = document.getElementById('btn-web-audio-play');
button.addEventListener("click", function(){
    play();
});

// Sprite animation
var Sprite = function(image, sx, sy, sw, sh){
    var me = this;
    me.image = image;
    me.draw = function(ctx, x, y){
        ctx.drawImage(me.image, sx, sy, sw, sh, x, y, sw, sh);
    };
};

var Animation = function(spritesheet, columns, rows, sw, sh){
    var me = this;
    var image = new Image();
    image.src = spritesheet;    
    var sprites = new Array(columns * rows);
    var currIndex = 0;
    
    for(var i = 0; i < rows; i++){
        for(var j = 0; j < columns; j++){
            sprites[j+i*columns] = new Sprite(image, j*sw, i*sh, sw, sh);
        }
    }
    
    var tick = function(){
        currIndex = (currIndex + 1) % sprites.length;
    };
    
    me.draw = function(ctx, x, y){
        tick();
        sprites[currIndex].draw(ctx, x, y);
    };
    return me;
};

var canvas = document.getElementById('canvas5');
var ctx = canvas.getContext('2d');

var animation = new Animation('images/sprite.png', 5, 1, 44, 50);
var interval = setInterval(function(){
    ctx.save();
    ctx.scale(3,3);
    animation.draw(ctx, 50,50);    
    ctx.restore();
}, 200);