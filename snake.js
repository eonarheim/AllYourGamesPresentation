if(!window.requestAnimationFrame){
	window.requestAnimationFrame = window.webkitRequestAnimationFrame ||
	window.msRequestAnimationFrame || 
	window.mozRequestAnimationFrame ||
	function(callback){
		setInterval(callback, 16);
	};
}

var Snake = function(targetElement){
	var me = this;
	var canvas = document.getElementById(targetElement);
	var ctx = canvas.getContext('2d');

	var snake = [];
	var food = null;

	var startingLength = 5;
	var startX = 8;
	var startY = 8;
	var score = 0;
	var width = 10;
	var running = false;
	var currentDirection = "right";


	var initSnake = function(){
		currentDirection = "right";
		snake = [];
		for(var i = 0; i<startingLength; i++){
			snake.push({x:startX-1, y: startY});
		}
	}

	var createFood = function(){
		food = {x: 0, y: 0};
		food.x = Math.floor(Math.random()*canvas.width/width);
		food.y = Math.floor(Math.random()*canvas.height/width);
	}

	var selfCollision = function(x, y){
		for(var i = 0; i < snake.length; i++){
			if(snake[i].x === x && snake[i].y === y){
				return true;
			}
		}
		return false;
	}

	var throttle = 0;
	me.update = function(){
		if(throttle++%4 == 0){
			var tailx = snake[0].x;
			var taily = snake[0].y;
			if(currentDirection === "right"){
				tailx++;
			}else if(currentDirection === "left"){
				tailx--;
			}else if(currentDirection === "down"){
				taily++;
			}else if(currentDirection === "up"){
				taily--;
			}


			// Check collisions
			// Collide with the side of the canvas
			if(tailx === -1 || 
				tailx === Math.floor(canvas.width/width) || 
				taily === -1 || 
				taily === Math.floor(canvas.height/width) || selfCollision(tailx, taily)) {
				me.stop();
				setTimeout(function(){
					me.start();
				},30);
				
				return;
			}

			// Grab food
			if(tailx === food.x && taily === food.y){
				score++;
				createFood();
				var tail = {x: tailx, y: taily};
			}else{
				var tail = snake.pop();
				tail.x = tailx;
				tail.y = taily;
			}
			
			snake.unshift(tail);
		}
	};

	me.draw = function(){
		// clear background
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		//draw snake
		snake.forEach(function(block){
			ctx.fillStyle = 'lime';
			ctx.fillRect(block.x*width, block.y*width, width, width);
			ctx.strokeStyle = "black";
			ctx.strokeRect(block.x*width, block.y*width, width, width);
		});

		//draw food
		ctx.fillStyle = 'lime';
		ctx.fillRect(food.x*width, food.y*width, width, width);

		// draw score
		ctx.fillStyle = 'lime'
		ctx.fillText('Score: ' + score, 420, 20);
	};

	me.start = function(){
		running = true;
		score = 0;
		initSnake();
		createFood();
		window.addEventListener('keydown', function(ev){
			var code = ev.keyCode;
			if(code == "37" && currentDirection !== "right"){
				currentDirection = "left";
			}else if(code == "38" && currentDirection !== "down"){
				currentDirection = "up";
			}else if(code == "39" && currentDirection !== "left"){
				currentDirection = "right";
			}else if(code == "40" && currentDirection != "up"){
				currentDirection = "down";
			}
		});

		(function mainloop(){
			if(!running) return;
			window.requestAnimationFrame(mainloop);
			me.update();
			me.draw();

		})()

	};

	me.stop = function(){
		running = false;
	};
};