/*
 * Author: Mike King (@micjamking)
 */

$(function(){			
	
	/* -----------------------------------------
   	// Global Variables & Functions
	----------------------------------------- */
	var $playState 	= false;
	var $audio 		= document.getElementById('audio');
	
	$(window).load(function(){
		onLoad();
		
		$('.current_song').text($('.selected').text());
		$('.container').fadeIn(); $('.player').addClass('visible');
		//if ($.browser.safari){ setTimeout(function(){ $('.toggle').fadeIn('slow');},800);}
	});
	
	
	/* -----------------------------------------
   	// Play/Pause Logic
	----------------------------------------- */
	$('.control-play').click(function(){
		if ($(this).data('title') == 'Play'){
			$('.current_song').toggleClass('active');
			$(this).data('title', 'Pause').toggleClass('on'); 
			this.innerHTML = '&#9612;&#9612;';
			$('.progress').fadeIn('slow'); 
			$playState = true; 
			$audio.play();
		} else {
			$('.current_song').toggleClass('active');
			$(this).data('title', 'Play').toggleClass('on');
			this.innerHTML = '&#9654;';
			$('.progress').fadeOut('slow'); 
			$playState = false; 
			$audio.pause(); 
		}
	});
	
	
	/* -----------------------------------------
   	// Tracklist Logic
	----------------------------------------- */	
	$('.toggle').click(function(){
		$(this).toggleClass('open closed');
		$('.tracklist').toggleClass('visible hidden');
	});
	
	$('.tracklist li').click(function(){
		if ($playState == true ){ $audio.pause(); $playState = false; }
		var song = 'audio/' + $(this).text() + '.mp3';
		$('.current_song').text($(this).text());
		$('.tracklist li').removeClass('selected');
		$(this).addClass('selected');
		$('#audio').attr('src',song);
		if ($('.control-play').hasClass('on')){ $audio.play(); $playState = true; }
	});
	
	
	/* -----------------------------------------
   	// Time Display Logic
	----------------------------------------- */
	$($audio).bind("timeupdate", function(){
		$(".current_time").html(formatTime(this.currentTime))	
	});
	
	$($audio).bind("durationchange", function(){
		$(".duration_time").html(formatTime(this.duration))	
	});

	function formatTime(seconds) {		
		var seconds = Math.round(seconds);
		var minutes = Math.floor(seconds / 60);
		seconds 	= Math.floor(seconds % 60);
		minutes 	= (minutes >= 10) ? minutes : "0" + minutes;
		seconds 	= (seconds >= 10) ? seconds : "0" + seconds;
		return minutes + ":" + seconds;
	}
	
	
	/* -----------------------------------------
   	// Frequency Visualizer (Canvas)
	----------------------------------------- */
	//if (window.webkitAudioContext) {
		var context 	= new webkitAudioContext();
		var analyser 	= context.createAnalyser();
	
		var canvas 		= document.getElementById('frequency-1');
		var ctx2		= canvas.getContext('2d');
		canvas.width 	= $(window).width();
		canvas.height 	= $(window).height();

		var canvas2 	= document.getElementById('frequency-2');
		var ctx3 		= canvas2.getContext('2d');
		canvas2.width 	= canvas.width;
		canvas2.height 	= canvas.height;

		const HEIGHT 	= canvas.height;
		const WIDTH 	= canvas.width;

		function freqCallback(time) {
			window.webkitRequestAnimationFrame(freqCallback, canvas);

			var freqByteData 	= new Uint8Array(analyser.frequencyBinCount); 
			analyser.getByteFrequencyData(freqByteData);

			var SPACER_WIDTH	= 15;
			var BAR_WIDTH 		= 10;
			var OFFSET 			= 100;
			var numBars 		= Math.round(WIDTH / SPACER_WIDTH);
		
			ctx2.fillStyle 		= '#000000';
			ctx2.lineCap 		= 'round';
			ctx3.fillStyle 		= 'rgba(252, 233, 252, 1)';
			ctx3.shadowColor 	= 'hsla(303, 80%, 60%, 1)';
			ctx3.shadowBlur 	= 25;
			ctx3.lineCap 		= 'round';
		
			ctx2.clearRect(0, 0, WIDTH, HEIGHT);
			ctx3.clearRect(0, 0, WIDTH, HEIGHT);
		
			for (var i = 0; i < numBars; ++i) {
				var magnitude = freqByteData[i + OFFSET];
				ctx2.fillRect(i * SPACER_WIDTH, HEIGHT, BAR_WIDTH, -magnitude);
	    		ctx3.fillRect(i * SPACER_WIDTH, HEIGHT, BAR_WIDTH, -magnitude);
			}
		}
	
		function onLoad(e) {
			var source = context.createMediaElementSource($audio);
			source.connect(analyser);
			analyser.connect(context.destination);
			freqCallback();
		}
	//}
	

	/* -----------------------------------------
   	// Progress Bar (Canvas)
	----------------------------------------- */
	var c = document.createElement('canvas'),
    	ctx		= c.getContext('2d'),
    	cw 		= c.width = 300,
		ch 		= c.height = 300,
    	rand 	= function(a,b){return ~~((Math.random()*(b-a+1))+a);},
	    dToR 	= function(degrees){ return degrees * (Math.PI / 180); },

 	   circle = {
			x: (cw / 2),
			y: (ch / 2),
			radius: 110,
			speed: 6,
			rotation: 0,
			angleStart: 270,
			angleEnd: 180,
			hue: 303,
			thickness: 5,
			blur: 25
	    },

	    updateCircle = function(){
			if(circle.rotation < 360){ circle.rotation += circle.speed; } 
			else { circle.rotation = 0; }
	    },

	    renderCircle = function(){
			ctx.save();
			ctx.translate(circle.x, circle.y);
			ctx.rotate(dToR(circle.rotation));
			ctx.beginPath();
			ctx.arc(0, 0, circle.radius, dToR(circle.angleStart), dToR(circle.angleEnd), true);
			ctx.lineWidth 	= circle.thickness;    
			ctx.strokeStyle = gradient1;
			ctx.stroke();
			ctx.restore();
	    },

	    renderCircleBorder = function(){
			ctx.save();
			ctx.translate(circle.x, circle.y);
			ctx.rotate(dToR(circle.rotation));
			ctx.beginPath();
			ctx.arc(0, 0, circle.radius + (circle.thickness/2), dToR(circle.angleStart), dToR(circle.angleEnd), true);
			ctx.lineWidth 	= 1;  
			ctx.strokeStyle = gradient2;
			ctx.stroke();
			ctx.restore();
	    },
	
	    renderCircleFlare = function(){
			ctx.save();
			ctx.translate(circle.x, circle.y);
			ctx.rotate(dToR(circle.rotation+165));
			ctx.scale(1.5,1);
			ctx.beginPath();
			ctx.arc(0, circle.radius, 5, 0, Math.PI *2, false);
			ctx.closePath();
			var gradient4 = ctx.createRadialGradient(0, circle.radius, 0, 0, circle.radius, 5);
			gradient4.addColorStop(0, 'hsla(30, 100%, 50%, .2)');
			gradient4.addColorStop(1, 'hsla(30, 100%, 50%, 0)');
			ctx.fillStyle = gradient4;
			ctx.fill();     
			ctx.restore();
	    },
	
	    clear = function(){
			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillStyle = 'rgba(17, 17, 17, .1)';
			ctx.fillRect(0, 0, cw, ch);
			ctx.globalCompositeOperation = 'lighter';		
	    },

		loop = function(){
	      	clear();
			updateCircle();
			renderCircle();
			renderCircleBorder();
			renderCircleFlare();
	    }
 
		ctx.shadowBlur 	= circle.blur;
		ctx.shadowColor = 'hsla('+circle.hue+', 80%, 60%, 1)';
		ctx.lineCap 	= 'round';
  		
		var gradient1 = ctx.createLinearGradient(0, -circle.radius, 0, circle.radius);
		gradient1.addColorStop(0, 'hsla('+circle.hue+', 23%, 62%, 0.5)');
		gradient1.addColorStop(1, 'hsla('+circle.hue+', 60%, 50%, 0)');
  
		var gradient2 = ctx.createLinearGradient(0, -circle.radius, 0, circle.radius);
		gradient2.addColorStop(0, 'hsla('+circle.hue+', 100%, 50%, 0)');
		gradient2.addColorStop(.1, 'hsla('+circle.hue+', 100%, 100%, .25)');
		gradient2.addColorStop(1, 'hsla('+circle.hue+', 100%, 50%, 0)');

		setInterval(loop, 12);
		
		$('.player').prepend(c);
		$(c).addClass('progress').hide();

});
