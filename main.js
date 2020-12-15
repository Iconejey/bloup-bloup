let can = document.querySelector('canvas');
let fsbtn = document.querySelector('#fullscreen');
let count = document.querySelector('#count');

fsbtn.addEventListener('click', event => {
	if (document.fullscreenElement) {
		document.exitFullscreen();
		fsbtn.innerHTML = `<i class="material-icons md-64">fullscreen</i>`;
	} else {
		document.documentElement.requestFullscreen();
		fsbtn.innerHTML = `<i class="material-icons md-64">fullscreen_exit</i>`;
	}
});

let brushes = document.querySelectorAll('a');
for (let brush of brushes) {
	brush.title = brush.id;
	if (brush.id != 'fullscreen') {
		brush.addEventListener('click', event => {
			cursor = brush.id;
			setCookie('cursor', cursor);
		});
	}
}

let time = 0;
let bloups = [];
let border = 300;
let cursor = getCookie('cursor');

if (!cursor) {
	setCookie('cursor', 'sand');
	location.reload();
}

console.log();
let mouse_press = null;

let getDif = (a, b) => {
	let x = b.pos.x - a.pos.x;
	let y = b.pos.y - a.pos.y;
	let d = Math.sqrt(x * x + y * y);
	return { x: x / d, y: y / d, d: d };
};

let swap = (a, b, callback) => {
	callback(a, b);
	callback(b, a);
};

can.addEventListener('contextmenu', event => event.preventDefault());

let mouse_event = event => {
	if (mouse_press) {
		if (mouse_press.btn) {
			can.classList.add('drag');
			for (let bloup of bloups) {
				bloup.pos.x += event.x - mouse_press.x;
				bloup.pos.y += event.y - mouse_press.y;
			}
			mouse_press.x = event.x;
			mouse_press.y = event.y;
		} else bloups.push(new Bloup(event.x, event.y, 'rand', cursor));
	}
};

can.addEventListener('mousedown', event => {
	mouse_press = { btn: event.button, x: event.x, y: event.y };
	mouse_event(event);
});

can.addEventListener('mouseup', event => {
	mouse_press = null;
	can.classList.remove('drag');
});

can.addEventListener('mousemove', event => {
	if (cursor != 'gravity' || (mouse_press && mouse_press.btn)) mouse_event(event);
});

let tick = new_time => {
	let delay = new_time - time;
	time = new_time;

	can.width = document.documentElement.clientWidth;
	can.height = document.documentElement.clientHeight;

	let ctx = can.getContext('2d');

	bloups = bloups.filter(bloup => bloup.alive);
	count.innerHTML = bloups.length + 'p / ' + Math.floor(1000 / delay) + 'fps';

	for (let brush of brushes) {
		if (brush.id == cursor) brush.classList.add('active');
		else brush.classList.remove('active');
	}

	for (let i = 0; i < bloups.length; i++) {
		let a = bloups[i];
		a.move();

		if (i + 1 < bloups.length) {
			for (let j = i + 1; j < bloups.length; j++) {
				let b = bloups[j];

				let dif = getDif(a, b);

				// Gravity
				grav_div = 10000;
				a.vel.x += (dif.x * b.mass) / grav_div / dif.d;
				a.vel.y += (dif.y * b.mass) / grav_div / dif.d;

				b.vel.x -= (dif.x * a.mass) / grav_div / dif.d;
				b.vel.y -= (dif.y * a.mass) / grav_div / dif.d;

				// Collision vals
				let wr = a.ray.r + b.ray.r;
				let dr = wr - dif.d;

				// Mass Ratio
				let cma = b.mass / (a.mass + b.mass);
				let cmb = a.mass / (a.mass + b.mass);

				if (dif.d < wr) {
					// Static Response
					a.pos.x -= dif.x * dr * cma;
					a.pos.y -= dif.y * dr * cma;

					b.pos.x += dif.x * dr * cmb;
					b.pos.y += dif.y * dr * cmb;

					// Dynamic Response
					let dpta = a.vel.x * -dif.y + a.vel.y * dif.x;
					let dptb = b.vel.x * -dif.y + b.vel.y * dif.x;

					let dpna = a.vel.x * dif.x + a.vel.y * dif.y;
					let dpnb = b.vel.x * dif.x + b.vel.y * dif.y;

					let ma = (dpna * (a.mass - b.mass) + 2 * b.mass * dpnb) / (a.mass + b.mass);
					let mb = (dpnb * (b.mass - a.mass) + 2 * a.mass * dpna) / (a.mass + b.mass);

					a.vel.x = -dif.y * dpta + dif.x * ma;
					a.vel.y = dif.x * dpta + dif.y * ma;

					b.vel.x = -dif.y * dptb + dif.x * mb;
					b.vel.y = dif.x * dptb + dif.y * mb;

					// Frictions
					let f = a.frictions * b.frictions;

					a.vel.x *= f;
					a.vel.y *= f;

					b.vel.x *= f;
					b.vel.y *= f;

					// Swap
					swap(a, b, (aa, bb) => {
						// Heat
						aa.heat = aa.heat * 0.99 + bb.heat * 0.01;
						if (aa.type == 'fire' && (bb.type == 'water' || aa.heat < 180)) aa.alive = false;
						if (aa.type == 'sand' && aa.heat > 150) aa.type = 'rock';
					});
				}
			}
		}

		a.draw(ctx);
	}

	requestAnimationFrame(tick);
};

onload = () => {
	requestAnimationFrame(tick);
};
