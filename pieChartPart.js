var PieChartPart = function( chart, data ){ this.init( chart, data ); };
PieChartPart.prototype = extend( ChartPart, {
	constructor: PieChartPart,

	_setStateVars: function( data ){
		var relVal = data.relVal || 0;

		this._state = {
			val: relVal,
			arc: {
				b: this._offset,
				e: this._offset + relVal
			}
		};

		this._animStateFns.show = function( $this, fract ){
			$this._state.arc = {
				b: $this._offset,
				e: $this._offset + ( $this._state.val * fract )
			};
		};
		
		this._animStateFns.hide = function( $this, fract ){
			$this._state.arc = {
				b: $this._offset + ( $this._state.val * fract ),
				e: $this._offset + $this._state.val
			};
		};
	},

	update: function( t ){
		if( !this._ready ) return;

		this._checkHover( this._ctx, this._cursor.pos );
	},

	render: function(){
		if( !this._ready ) return;

		this._drawArc0();
		this._drawArc1();
	},

	_drawArc0: function(){
		this._drawArc( this._ctx, this._size.ri, this._size.ro, this._img );
	},

	_drawArc1: function(){
		this._ctx.save(); // alpha

		if( this._hover ){
			this._ctx.globalAlpha = 1;
		}else{
			this._ctx.globalAlpha = 0.5;
		}
		// this._ctx.globalAlpha = 0.5;
		this._drawArc( this._ctx, this._size.r2i, this._size.r2o, null );

		this._ctx.restore(); // alpha
	},

	_drawArc: function( ctx, ri, ro, img ){

		ctx.save(); // arc

		ctx.beginPath();
		ctx.arc( this._canvas.cx, this._canvas.cy, ro, this._state.arc.b, this._state.arc.e, false );
		if( ri > 0 ){ // arc pie
			ctx.arc( this._canvas.cx, this._canvas.cy, ri, this._state.arc.e, this._state.arc.b, true );
		}else{ // full pie
			ctx.lineTo( this._canvas.cx, this._canvas.cy );
		}

		ctx.save(); // img

		ctx.clip();
		if( img !== null && this._imgReady ){
			ctx.drawImage( img, 0, 0, img.height, img.height, 0, 0, this._canvas.w, this._canvas.h );
			ctx.globalCompositeOperation = 'color';
		}
		ctx.fillStyle = this._color;
		ctx.fillRect( 0, 0, this._canvas.w, this._canvas.h );

		ctx.restore(); // img

		ctx.restore(); // arc

	},

	_checkHover: function( ctx, pos ){

		ctx.save();

		ctx.beginPath();
		ctx.arc( this._canvas.cx, this._canvas.cy, this._size.r2o, this._state.arc.b, this._state.arc.e, false );
		if( this._size.ri > 0 ){ // arc pie
			ctx.arc( this._canvas.cx, this._canvas.cy, this._size.ri, this._state.arc.e, this._state.arc.b, true );
		}else{ // full pie
			ctx.lineTo( this._canvas.cx, this._canvas.cy );
		}

		this._hover = ctx.isPointInPath( pos.x, pos.y );

		ctx.restore();

	}

} );
