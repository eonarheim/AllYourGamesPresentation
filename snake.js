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

	var startingLength = 5;
	var startX = 1;
	var startY = 3;
	var score = 0;
	var width = 20;
	var running = false;
	var currentDirection = "right";


	var initSnake(){
		for(var i = 0; i<startingLength; i++){
			snake.push({x:i+startX, y: startY});
		}
	}

	me.update = function(){
		var tailblock = snake[0];
		if(currentDirection === "right"){
			tailblock.x++;
		}else if(currentDirection === "left"){
			tailblock.x--;
		}else if(currentDirection === "down"){
			tailblock.y++;
		}else if(currentDirection === "up"){
			tailblock.y--;
		}

		var filpBlock = snake.pop();
		snake.unshift(filpBlock);
	};

	me.draw = function(){
		// clear background
		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		//draw snake
		ctx.fillStyle = 'lime';
		snake.forEach(function(block){
			ctx.fillRect(block.x, block.y, block.x * width, block.y * width);
		});
	};

	me.start = function(){
		running = true;
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