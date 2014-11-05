// SETTINGS
/* frame duration (in milliseconds) */
var FRAME_FREQ = 100;

/* Factor by which to skip pixel (1 means we do every pixel, 2 means every other pixel, etc.) */
var RESOLUTION = 2;

/* How to render each grey pixel as ASCII */
var CHARS = {
	0: " ",
	1: "`",
	2: ":",
	3: "*",
	4: "+",
	5: "@",
	6: "V",
	7: "#"
};


// VARIOUS PROPERTIES
var _input = document.getElementById('file');
var _output = document.getElementById('output');
var _video = document.createElement('video');
var _canvas = document.createElement("canvas");
var _frame_d = document.getElementById('frames');
var _res_f = document.getElementById('res');
var _context;


// APP STATES
var _playing = false;
var _loaded = false;
var _timer = null;


// API & METHODS
function init_canvas(w, h) {
	_canvas.width = w;
	_canvas.height = h;
	
	_context = _canvas.getContext("2d");
};

function load_video(data) {
	_counter = 0;
	_loaded = false;
	
	_output.innerHTML = '';
	_video.src = URL.createObjectURL(data);
	_video.load();
};

function play_video() {
	if (!_loaded)
		return;
	_playing = true;
	_video.play();
};

function pause_video() {
	_playing = false;
	_video.pause();
	clearTimeout(_timer);
};

function draw_frame() {
	if (!_playing)
		return;
	
	// WORK ON THESE ARGUMENTS.... THIS IS A TAD MESSY
	draw_ascii(_output, _video, _frame_d.value, _res_f.value, _context, _canvas.width, _canvas.height, CHARS);
	_timer = setTimeout(draw_frame, FRAME_FREQ);
};

function draw_ascii(o, vid, fr, res, cxt, w, h, crs) {
		o.innerHTML = '';
		
		cxt.drawImage(vid, 0, 0, w, h);
		var img = cxt.getImageData(0, 0, w, h);
		
		for (var i = 0, pxls = img.data, l = pxls.length, s = 4, r = w * s; i < l; i += r * res) {
			var line = '';
			for (var j = i, t = j + r; j < t; j += s * res) {
				// Here we take a weighted average of rgb and assign it as a single colour.
				var grey = pxls[j] * 0.2126 + pxls[j + 1] * 0.7152 + pxls[j + 2] * 0.0722;
				var c;
				
				if (grey > 250)
					c = crs[0];
				else if (grey > 230)
					c = crs[1];
				else if (grey > 200)
					c = crs[2];
				else if (grey > 175)
					c = crs[3];
				else if (grey > 150)
					c = crs[4];
				else if (grey > 125)
					c = crs[5];
				else if (grey > 50)
					c = crs[6];
				else
					c = crs[7];
				
				line += c;
			}
			o.appendChild(document.createTextNode(line));
			o.appendChild(document.createElement("br"));
		}
	
};

// EVENT HANDLERS
function onkeyup(e) {
	//console.log(e.which);
	switch(e.which) {
		case 32:
			if (_playing)
				pause_video();
			else
				play_video();
			break;
	}
	e.preventDefault();
};

function onfile(e) {
	pause_video();
	
	var blob = e.target.files[0];
	if (blob)
		load_video(blob);
	else
		alert('No video found.');
};

function onplay(e) {
	draw_frame();
};

function onload(e) {
	_loaded = true;
	init_canvas(_video.videoWidth, _video.videoHeight);
	play_video();
};

function onend(e) {
	_playing = false;
	clearTimeout(_timer);
};

// EVENTS
document.addEventListener('keyup', onkeyup, false);
_input.addEventListener('change', onfile, false);
_video.addEventListener('play', onplay, false);
_video.addEventListener('canplaythrough', onload, false);
_video.addEventListener('ended', onend, false);


/*
+-----------------------------------------------------------------------------+

	written & directed by:
				 _                 _ _
	 ___ ___ ___| |_ ___ _____ ___|_| |_ ___ ___
	| . |  _| .'|   | .'|     |- _| | . | .'|  _|
	|_  |_| |__,|_|_|__,|_|_|_|___|_|___|__,|_|
	|___|

+-----------------------------------------------------------------------------+
*/

