class Bloup {
	constructor(x, y, move, type) {
		this.pos = { x: x, y: y };
		this.type = type;

		this.alive = true;

		this.vel = { x: 0, y: 0 };
		if (move == 'rand') this.vel = { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 };

		this.ray = {
			gravity: { v: 4, r: 4 },
			sand: { v: 4, r: 4 },
			rock: { v: 4, r: 4 },
			fire: { v: 4, r: 4 },
			water: { v: 4, r: 4 }
		}[type];

		this.airfric = {
			gravity: 0.1,
			sand: 0.001,
			rock: 0.1,
			fire: 0.001,
			water: 0.001
		}[type];

		this.frictions = {
			gravity: 0.1,
			sand: 0.5,
			rock: 0.1,
			fire: 0.999,
			water: 0.999
		}[type];

		this.mass = {
			gravity: 100000,
			sand: 10,
			rock: 10,
			fire: 1,
			water: 1
		}[type];

		this.heat = {
			gravity: 20,
			sand: 20,
			rock: 20,
			fire: 200,
			water: 20
		}[type];
	}

	move() {
		this.pos.x += this.vel.x;
		this.pos.y += this.vel.y;

		this.vel.x *= 1 - this.airfric;
		this.vel.y *= 1 - this.airfric;

		if (-border > this.pos.x || this.pos.x > innerWidth + border || -border > this.pos.y || this.pos.y > innerHeight + border) this.alive = false;
	}

	draw(ctx) {
		let color = {
			gravity: `rgba(${255}, ${255}, ${255}, ${1})`,
			sand: `rgba(${255}, ${255}, ${200}, ${1})`,
			rock: `gray`,
			fire: `orange`,
			water: `blue`
		}[this.type];

		if (this.type == 'rock') {
			let c1 = [60, 50, 50, 1];
			let c2 = [255, 100, 0, 1];
			let c3 = [0, 0, 0];

			let min = 50;
			let max = 200;

			if (this.heat < min) c3 = c1;
			else if (this.heat > max) c3 = c2;
			else {
				let r = (this.heat - min) / (max - min);
				for (let i = 0; i < 2; i++) c3[i] = Math.floor(c2[i] * r + c1[i] * (1 - r));
			}

			color = `rgba(${c3[0]}, ${c3[1]}, ${c3[2]}, ${1})`;
		}

		if (this.type == 'water') {
			if (this.heat < 0) color = `rgba(${100}, ${150}, ${255}, ${0.5})`;
			if (this.heat > 100) color = `rgba(${200}, ${220}, ${255}, ${0.5})`;
		}

		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(this.pos.x, this.pos.y, this.ray.v, 0, 2 * Math.PI);
		ctx.fill();
	}
}
