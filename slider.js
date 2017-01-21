var Slider = function( config ){ this.init( config ); };
Slider.prototype = {
	constructor: Slider,

	_ready: false,
	_animStateFns: {},
	_easingFns: {
		easeInQuad: function(f){
			return f*f;
		},
		easeOutQuad: function(f){
			f = 1 - f;
			return 1 - (f*f);
		},
		easeInCubic: function(f){
			return f*f*f;
		},
		easeOutCubic: function(f){
			f = 1 - f;
			return 1 - (f*f*f*f);
		},
		easeInQuart: function(f){
			return f*f*f;
		},
		easeOutQuart: function(f){
			f = 1 - f;
			return 1 - (f*f*f*f);
		}
	},

	init: function( config ){
		if( !this._setVars( config ) ) return;
		this._setEvents();
	},

	_setVars: function( config ){
		if( !window._SliderCore ) return false;
		if( !config ) return false;

		this._id = config.id || null;
		if( !this._id ) return false;

		this._canvasEl = document.getElementById( this._id );
		if( !this._canvasEl ) return false;
		this._ctx = this._canvasEl.getContext( '2d' );

		this._data = config.data || [];
		this._currIdx = 0;
		this._prevIdx = 0;
		this._maxIdx = this._data.length - 1;

		this._canvas = {};
		this._resizeCanvas();

		this._cursor = {};
		this._cursor.pos = {};
		this._cursor.pos.x = 0;
		this._cursor.pos.y = 0;
		// this._cursor.hit = false;

		this._time = config.time || {
			slide: 5000,
			anim: 500,
			fade: 500,
			zoom: 500
		};
		this._event = config.event || {};
		this._animArr = [];

		this._setStateVars( this._data );
		this._loadImages();

		return true;
	},

	_resizeCanvas: function(){
		this._canvas.w = this._canvasEl.offsetWidth;
		this._canvas.h = this._canvasEl.offsetHeight;
		this._canvasEl.setAttribute( 'width', this._canvas.w );
		this._canvasEl.setAttribute( 'height', this._canvas.h );
		this._canvas.cx = this._canvas.w / 2;
		this._canvas.cy = this._canvas.h / 2;
	},

	_setStateVars: function( data ){
		var relVal = data.relVal || 0;

		this._state = {
			prevImg: {
				alpha: 0,
				scale: 1,
				image: {
					sx: 0,
					sy: 0,
					sw: 100,
					sh: 100,
					x: 0,
					y: 0,
					w: 0,
					h: 0,
					img: null
				}
			},
			currImg: {
				aplha: 1,
				scale: 1,
				image: {
					sx: 0,
					sy: 0,
					sw: 100,
					sh: 100,
					x: 0,
					y: 0,
					w: 0,
					h: 0,
					img: null
				}
			}
		};

		this._animStateFns.fade = function( $this, fract ){
			$this._state.prevImg.alpha = 1 - fract;
		};

		this._animStateFns.zoom = function( $this, fract ){
			$this._state.currImg.scale = 1 + ( 1 - fract ) * 0.2;
		};

	},

	_setEvents: function(){
		var $this = this;

		this._resizeTimeout = null;
		window.addEventListener( 'resize', function(e){
			if( $this._resizeTimeout !== null ){
				clearTimeout( $this._resizeTimeout );
				$this._resizeTimeout = null;
			}
			$this._resizeTimeout = setTimeout( function(){
				$this._resizeCanvas();
			}, 200 );
		} );
	},

	_recalcCursorPos: function( e ){	
		var offset = window._ChartCore._getOffset( this._canvasEl );
		return {
			x: ( e.pageX - offset.l ) * ( this._canvas.w / this._canvasEl.offsetWidth ),
			y: ( e.pageY - offset.t ) * ( this._canvas.h / this._canvasEl.offsetHeight )
		};
	},

	_each: function( arr, fn ){
		if( !arr.length ) return;
		if( typeof fn != 'function' ) return;
		var i;
		for( i = 0; i < arr.length; i++ ){
			fn( i, arr[i] );
		}
	},

	_loadImages: function(){
		var $this = this;

		this._each( this._data, function( key, val ){
			val.ready = false;
			val.imgObj = new Image();
			val.imgObj.onload = function(){
				val.ready = true;
				$this._checkReady();
			};	
			val.imgObj.src = val.img;
		} );
	},

	_checkReady: function(){
		var allReady = true;
		this._each( this._data, function( key, val ){
			if( !val.ready ){
				allReady = false;
				return false;
			}
		} );

		if( allReady ){
			this._ready = true;
			window._SliderCore.addSlider( this );
		}
	},

	_anim: function( name, time, cb, partCb ){
		var animTime = time || this._time[name] || this._time.anim || 0;

		var anim = {
			name: name,
			b: null,
			e: null,
			time: animTime
		};
		
		var k, ak = null;
		for( k in this._animArr ){
			if( this._animArr[k].name == name ){
				ak = k;
				break;
			}
		}

		if( ak === null ){
			this._animArr.push(anim);
		}else{
			this._animArr[ak] = anim;
		}
	},

	_updateAnim: function( t ){
		if( !this._ready ) return;
		
		var k, remArr = [];
		for( k in this._animArr ){

			if( this._animArr[k].b === null || this._animArr[k].e === null ){
				this._animArr[k].b = t;
				this._animArr[k].e = t + this._animArr[k].time;
			}

			if( t >= this._animArr[k].e ){ // anim end
				remArr.push( this._animArr[k] );
				if( typeof( this._animArr[k].cb ) == 'function' ){
					this._animArr[k].cb();
				}
				continue;
			}

			if( t >= this._animArr[k].b ){ // anim
				this._setAnimState( this._animArr[k].name, ( ( t - this._animArr[k].b ) / this._animArr[k].time ) );
			}

		}

		for( k in remArr ){
			this._animArr.splice( this._animArr.indexOf( remArr[k] ), 1 );
		}
	},

	_setAnimState: function( name, fract ){
		if( !this._animStateFns[name] ) return;
		fract = this._easingFns.easeOutQuad( fract );
		this._animStateFns[name]( this, fract );
	},

	_draw: function( ctx ){
		if( !this._animArr.length ){
			ctx.drawImage( this._data[this._currIdx].imgObj, 0, 0 );
			return;
		}
	
		ctx.save();
		ctx.globalAlpha = this._state.currImg.alpha;
		// ctx.scale(this._state.currImg.scale,this._state.currImg.scale);
		ctx.drawImage( this._data[this._currIdx].imgObj, 0, 0 );
		ctx.restore();


		ctx.save();
		ctx.globalAlpha = this._state.prevImg.alpha;
		// ctx.scale(this._state.prevImg.scale,this._state.prevImg.scale);
		ctx.drawImage( this._data[this._prevIdx].imgObj, 0, 0 );
		ctx.restore();

		// ctx.scale(1,1);
		// ctx.globalAlpha = 1;

	},

	goToSlide: function( idx, cb ){
		var diff = idx - this._currIdx;
		if( diff === 0 ) return;
		if( idx > this._maxIdx ) idx = 0;
		if( idx < 0 ) idx = this._maxIdx;

		this._prevIdx = this._currIdx;
		this._currIdx = idx;

		this._anim( 'fade', null, cb );
		// this._anim( 'zoom', null, cb );
	},

	nextSlide: function( cb ){
		this.goToSlide( this._currIdx + 1, cb );
	},

	prevSlide: function( cb ){
		this.goToSlide( this._currIdx - 1, cb );
	},

	update: function( t ){
		if( !this._ready ) return;

		this._updateAnim( t );
	},

	render: function(){
		if( !this._ready ) return;

		this._draw( this._ctx );
	},

	clear: function(){
		this._ctx.clearRect( 0, 0, this._canvas.w, this._canvas.h );
	}

};
