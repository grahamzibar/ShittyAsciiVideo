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
var _export_btn = document.getElementById('export_btn');
var _context;
var _audio_context = new AudioContext();

var _audio_input = _audio_context.createMediaElementSource(_video);
_audio_input.connect(_audio_context.destination);

var _recorder = new Recorder(_audio_input, {
	workerPath: 'recorderWorker.js',
	callback: onwav
});

var _encoded_data = new Array();

// APP STATES
var _playing = false;
var _loaded = false;
var _timer = null;
var _exporting = false;

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
	if (!_loaded)
		return;
	_playing = false;
	_video.pause();
	clearTimeout(_timer);
};

function export_video() {
	if (_exporting || !_loaded)
		return;
	_exporting = true;
	
	pause_video();
	
	_video.currentTime = 0;
	_video.addEventListener('ended', onexportend, false);
	
	play_video();
	_recorder.record();
};

function draw_frame() {
	if (!_playing)
		return;
	
	// WORK ON THESE ARGUMENTS.... THIS IS A TAD MESSY.... I should also have some separate functions?
	draw_ascii(_output, _video, _frame_d.value, _res_f.value, _context, _canvas.width, _canvas.height, CHARS, _exporting, _encoded_data);
	_timer = setTimeout(draw_frame, FRAME_FREQ);
};

function draw_ascii(o, vid, fr, res, cxt, w, h, crs, exp, data) {
		o.innerHTML = '';
		
		cxt.drawImage(vid, 0, 0, w, h);
		var img = cxt.getImageData(0, 0, w, h);
		
		for (var x = 0, i = 0, pxls = img.data, l = pxls.length, s = 4, r = w * s; i < l; i += r * res, x++) {
			var line = '';
			if (exp)
				data[x] = new Array();
			for (var y = 0, j = i, t = j + r; j < t; j += s * res, y++) {
				// Here we take a weighted average of rgb and assign it as a single colour.
				var grey = pxls[j] * 0.2126 + pxls[j + 1] * 0.7152 + pxls[j + 2] * 0.0722;
				
				if (exp)
					data[x][y] = grey;
				
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
	if (_exporting)
		return;
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

function onexport(e) {
	export_video();
};

function onexportend(e) {
	alert('Exported!');
	_exporting = false;
	_video.removeEventListener('ended', onexportend, false);
	_recorder.stop();
	_recorder.exportWAV();
};

function onwav(blob) {
	var data = {
		frame_duration: _frame_d.value,
		audio_track: 'output.wav',
		frames: _encoded_data
	};
	
	Recorder.forceDownload(blob);
	Recorder.forceDownload(
		new Blob([JSON.stringify(data)], { type:'text/json' }),
		'output.asciiv'
	);
};

// EVENTS
document.addEventListener('keyup', onkeyup, false);
_input.addEventListener('change', onfile, false);
_video.addEventListener('play', onplay, false);
_video.addEventListener('canplaythrough', onload, false);
_video.addEventListener('ended', onend, false);
_export_btn.addEventListener('click', onexport, false);


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

