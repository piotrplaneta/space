//Game initialization

var CANVAS_WIDTH = 480;
var CANVAS_HEIGHT = 320;

var canvasElement = document.getElementById('game');

var canvas = canvasElement.getContext("2d");

function animate() {
	requestAnimFrame(animate);
	update();
	draw();
}

//End of game initialization

//Bullet

function Bullet(Instance) {
	Instance.active = true;

	Instance.xVelocity = 0;
	Instance.yVelocity = -Instance.speed;
	Instance.width = 3;
	Instance.height = 3;
	Instance.color = "#000";

	Instance.inBounds = function() {
		return Instance.x >= 0 && Instance.x <= CANVAS_WIDTH &&
			   Instance.y >= 0 && Instance.y <= CANVAS_HEIGHT;
	};

	Instance.draw = function() {
		canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);
	};

	Instance.update = function() {
		Instance.x += Instance.xVelocity;
		Instance.y += Instance.yVelocity;

		Instance.active == Instance.active && Instance.inBounds();
	};

	return Instance;

}

//End of Bullet

//Enemies

enemies = [];

function Enemy(Instance) {
	Instance = Instance || {};
	
	Instance.active = true;
	Instance.age = Math.floor(Math.random() * 128);

	Instance.color = "#A2B";

	Instance.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
	Instance.y = 0;
	Instance.xVelocity = 0;
	Instance.yVelocity = 2;

	Instance.width = 32;
	Instance.height = 32;

	Instance.sprite = Sprite("enemy");

	Instance.inBounds = function() {
		return Instance.x >= 0 && Instance.x <= CANVAS_WIDTH &&
			   Instance.y >= 0 && Instance.y <= CANVAS_HEIGHT;
	};

	Instance.draw = function() {
		//canvas.fillStyle = this.color;
		//canvas.fillRect(this.x, this.y, this.width, this.height);
		this.sprite.draw(canvas, this.x, this.y);
	};

	Instance.update = function() {
		Instance.x += Instance.xVelocity;
		Instance.y += Instance.yVelocity;

		Instance.xVelocity = 3 * Math.sin(Instance.age * Math.PI / 64);

		Instance.age++;

		Instance.active = Instance.active && Instance.inBounds();
	};

	Instance.explode = function() {
		Sound.play("explosion");
		this.active = false;
	}

	return Instance;

}

//End of enemies

//Player

var playerBullets = [];

var player = {
	active: true,
	color: "#00A",
	x: 220,
	y: 270,
	width: 32,
	height: 32,
	sprite: Sprite("player"),

	draw: function() {
		//canvas.fillStyle = this.color;
		//canvas.fillRect(this.x, this.y, this.width, this.height);
		this.sprite.draw(canvas, this.x, this.y);
	},

	shoot: function() {
		var bulletPosition = this.midpoint();

		playerBullets.push(Bullet({
			speed: 5,
			x: bulletPosition.x,
			y: bulletPosition.y
		}));

		Sound.play("shoot");
	},

	midpoint: function() {
		return {
			x: this.x + this.width/2,
			y: this.y + this.height/2
		};
	},

	explode: function() {
	}
};

//End of player

//Update and redraw of canvas

function collides(a, b) {
	return a.x < b.x + b.width &&
		   a.x + a.width > b.x &&
		   a.y < b.y + b.height &&
		   a.y + a.height > b.y;
}

function handleCollisions() {
	playerBullets.forEach(function(bullet) {
		enemies.forEach(function(enemy) {
			if (collides(bullet, enemy)) {
				enemy.explode();
				bullet.active = false;
				$("#result").html(parseInt($("#result").html())+1);
			}
		});
	});

	enemies.forEach(function(enemy) {
		if (collides(enemy, player)) {
			enemy.explode();
			player.explode();
			$("#result").html(parseInt($("#result").html())-1);
		}
	});
}

function update() {
	if (keydown.w) {
		player.shoot();
	}

	if (keydown.a) {
		player.x -= 5;
	}

	if (keydown.d) {
		player.x += 5;
	}

	player.x = player.x.clamp(0, CANVAS_WIDTH - player.width);

	handleCollisions();

	playerBullets.forEach(function(bullet) {
		bullet.update();
	});

	playerBullets = playerBullets.filter(function(bullet) {
		return bullet.active;
	});

	enemies.forEach(function(enemy) {
		enemy.update();
	});

	enemies = enemies.filter(function(enemy) {
		return enemy.active;
	});

	if (Math.random() < 0.02) {
		enemies.push(Enemy());
	}
};

function draw() {
	canvas.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

	player.draw();

	playerBullets.forEach(function(bullet) {
		bullet.draw();
	});

	enemies.forEach(function(enemy) {
		enemy.draw();
	});
} 

//End of update and redraw of canvas

//Mouse support

function getPosition(e) {

    //this section is from http://www.quirksmode.org/js/events_properties.html
    var targ;
    if (!e)
        e = window.event;
    if (e.target)
        targ = e.target;
    else if (e.srcElement)
        targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;

    // jQuery normalizes the pageX and pageY
    // pageX,Y are the mouse positions relative to the document
    // offset() returns the position of the element relative to the document
    var x = e.pageX - $(targ).offset().left;
    var y = e.pageY - $(targ).offset().top;

    player.x = x;
	player.y = y;
}

function playerShoot() {
	player.shoot();
}

//End of mouse support

//End of Mouse support
window.onload = function() {
	animate();
	var canvas = document.getElementById("game");
	canvas.onselectstart = function () { return false; }
    canvas.addEventListener("mousemove", getPosition, false);

    var interval;
	$("#game").mousedown(function() {
	    interval = setInterval(playerShoot, 100);
	}).mouseup(function() {
	    clearInterval(interval);  
	}).mouseleave(function() {
		clearInterval(interval); 
	});
}