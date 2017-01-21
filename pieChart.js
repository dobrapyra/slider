var PieChart = function( config ){ this.init( config ); };
PieChart.prototype = extend( Chart, {
	constructor: PieChart,

	_offset: -Math.PI / 2, // -90deg in rad

	_createPart: function( chart, partData ){
		return new PieChartPart( chart, partData );
	},

	_getRelVal: function( val, sum ){
		return this._getRad( val, sum );
	},

	_getRad: function( val, sum ){
		return val / sum * 2 * Math.PI;
	}

} );
