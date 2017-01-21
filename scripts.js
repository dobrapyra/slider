
( function(){

	var sliderConfig = {
		id: "slider",
		data: [
			{ img: 'img/slide01.jpg' },
			{ img: 'img/slide02.jpg' },
			{ img: 'img/slide03.jpg' },
			{ img: 'img/slide04.jpg' }
		],
		time: {
			slide: 5000,
			anim: 800,
			fade: 800,
			zoom: 800
		}
	};
	new Slider( sliderConfig );
	
} )();
