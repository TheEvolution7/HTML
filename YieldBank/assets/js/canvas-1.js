$('#canvas-1').ready(function(){
    // Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
// Read Stefan's excellent paper for details on how this code works.
//
// Sean McCullough banksean@gmail.com

/**
 * You can pass in a random number generator object if you like.
 * It is assumed to have a random() method.
 */
var ClassicalNoise = function(r) { // Classic Perlin noise in 3D, for comparison 
    if (r == undefined) r = Math;
    this.grad3 = [[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0], 
                                   [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1], 
                                   [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]]; 
    this.p = [];
    for (var i=0; i<256; i++) {
      this.p[i] = Math.floor(r.random()*256);
    }
    // To remove the need for index wrapping, double the permutation table length 
    this.perm = []; 
    for(var i=0; i<512; i++) {
      this.perm[i]=this.p[i & 255];
    }
  };
  
  ClassicalNoise.prototype.dot = function(g, x, y, z) { 
      return g[0]*x + g[1]*y + g[2]*z; 
  };
  
  ClassicalNoise.prototype.mix = function(a, b, t) { 
      return (1.0-t)*a + t*b; 
  };
  
  ClassicalNoise.prototype.fade = function(t) { 
      return t*t*t*(t*(t*6.0-15.0)+10.0); 
  };
  
    // Classic Perlin noise, 3D version 
  ClassicalNoise.prototype.noise = function(x, y, z) { 
    // Find unit grid cell containing point 
    var X = Math.floor(x); 
    var Y = Math.floor(y); 
    var Z = Math.floor(z); 
    
    // Get relative xyz coordinates of point within that cell 
    x = x - X; 
    y = y - Y; 
    z = z - Z; 
    
    // Wrap the integer cells at 255 (smaller integer period can be introduced here) 
    X = X & 255; 
    Y = Y & 255; 
    Z = Z & 255;
    
    // Calculate a set of eight hashed gradient indices 
    var gi000 = this.perm[X+this.perm[Y+this.perm[Z]]] % 12; 
    var gi001 = this.perm[X+this.perm[Y+this.perm[Z+1]]] % 12; 
    var gi010 = this.perm[X+this.perm[Y+1+this.perm[Z]]] % 12; 
    var gi011 = this.perm[X+this.perm[Y+1+this.perm[Z+1]]] % 12; 
    var gi100 = this.perm[X+1+this.perm[Y+this.perm[Z]]] % 12; 
    var gi101 = this.perm[X+1+this.perm[Y+this.perm[Z+1]]] % 12; 
    var gi110 = this.perm[X+1+this.perm[Y+1+this.perm[Z]]] % 12; 
    var gi111 = this.perm[X+1+this.perm[Y+1+this.perm[Z+1]]] % 12; 
    
    // The gradients of each corner are now: 
    // g000 = grad3[gi000]; 
    // g001 = grad3[gi001]; 
    // g010 = grad3[gi010]; 
    // g011 = grad3[gi011]; 
    // g100 = grad3[gi100]; 
    // g101 = grad3[gi101]; 
    // g110 = grad3[gi110]; 
    // g111 = grad3[gi111]; 
    // Calculate noise contributions from each of the eight corners 
    var n000= this.dot(this.grad3[gi000], x, y, z); 
    var n100= this.dot(this.grad3[gi100], x-1, y, z); 
    var n010= this.dot(this.grad3[gi010], x, y-1, z); 
    var n110= this.dot(this.grad3[gi110], x-1, y-1, z); 
    var n001= this.dot(this.grad3[gi001], x, y, z-1); 
    var n101= this.dot(this.grad3[gi101], x-1, y, z-1); 
    var n011= this.dot(this.grad3[gi011], x, y-1, z-1); 
    var n111= this.dot(this.grad3[gi111], x-1, y-1, z-1); 
    // Compute the fade curve value for each of x, y, z 
    var u = this.fade(x); 
    var v = this.fade(y); 
    var w = this.fade(z); 
     // Interpolate along x the contributions from each of the corners 
    var nx00 = this.mix(n000, n100, u); 
    var nx01 = this.mix(n001, n101, u); 
    var nx10 = this.mix(n010, n110, u); 
    var nx11 = this.mix(n011, n111, u); 
    // Interpolate the four results along y 
    var nxy0 = this.mix(nx00, nx10, v); 
    var nxy1 = this.mix(nx01, nx11, v); 
    // Interpolate the two last results along z 
    var nxyz = this.mix(nxy0, nxy1, w); 
  
    return nxyz; 
  };

var canvas    = document.getElementById('canvas-1'),
    ctx       = canvas.getContext('2d'),
	  perlin    = new ClassicalNoise(),
    variation = .0025,
    amp       = 500,
    variators = [],
    max_lines = (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) ? 10 : 60,
    canvasWidth,
    canvasHeight,
    start_y;

for (var i = 0, u = 0; i < max_lines; i++, u+=.02) {
  variators[i] = u;
}

function draw(){
  ctx.shadowColor = "rgba(43, 205, 255, 1)";
  ctx.shadowBlur = 0;
  
  for (var i = 0; i <= max_lines; i++){
    ctx.beginPath();
    ctx.moveTo(0, start_y);
    for (var x = 0; x <= canvasWidth; x++) {
      var y = perlin.noise(x*variation+variators[i], x*2*variation, 0);
      ctx.lineTo(x*3, start_y + amp*y);
    }
    var gradient = ctx.createLinearGradient(0, 0, 1000, 0);
    gradient.addColorStop("0", "#d97c12");
    gradient.addColorStop("0.5" ,"#6d4c31");
    gradient.addColorStop("1.0", "#2d3039");
    var color = Math.floor(150*Math.abs(y));
    var alpha = Math.min(Math.abs(y)+0.05, .05);
    ctx.strokeStyle = gradient;
    ctx.stroke();
    ctx.closePath();
    

    variators[i] += .005;
  }
}

(function init() {
	resizeCanvas();
	animate();
	window.addEventListener('resize', resizeCanvas);
})();

function animate() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  draw();
  requestAnimationFrame(animate);
}

function resizeCanvas(){
	canvasWidth = document.documentElement.clientWidth,
	canvasHeight = document.documentElement.clientHeight; 

	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);

    start_y = canvasHeight/2;
}
})