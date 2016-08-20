
var parties = {
	'Hillary Clinton': 'democrat',
	'Donald Trump': 'republican',
	'Bernie Sanders': 'democrat',
	'Ted Cruz': 'republican',
	'John Kasich': 'republican',
	'Chris Christie': 'republican',
	'Marco Rubio': 'republican',
	'Jeb Bush': 'republican',
	'Ben Carson': 'republican',
	'Rick Santorum': 'republican',
	'Bobby Jindal': 'republican',
	'Carly Fiorina': 'republican',
	'Rick Perry': 'republican',
	'Martin O\'Malley': 'democrat',
	'Mike Huckabee': 'republican',
	'Scott Walker': 'republican',
	'Rand Paul': 'republican'
};

var drops = {
	'Hillary Clinton': false,
	'Donald Trump': false,
	'Bernie Sanders': '2016-07-12',
	'Ted Cruz': '2016-05-03',
	'John Kasich': '2016-05-04',
	'Chris Christie': '2016-02-10',
	'Marco Rubio': '2016-03-15',
	'Jeb Bush': '2016-02-20',
	'Ben Carson': '2016-03-04',
	'Rick Santorum': '2016-02-03',
	'Bobby Jindal': '2015-11-17',
	'Carly Fiorina': '2016-02-10',
	'Rick Perry': '2015-09-11',
	'Martin O\'Malley': '2016-02-01',
	'Mike Huckabee': '2016-02-01',
	'Scott Walker': '2015-09-21',
	'Rand Paul': '2016-02-03'
};

var weekdrops = {};
_.each( drops, function ( dropDate, candidate ) {

	if ( drops[candidate] !== false ) {

		var election = Date.parse( new Date( '2016-11-8' ) );

		var fullDate = new Date( dropDate );

		var date = Date.parse( fullDate.getFullYear() + '-' + ( fullDate.getMonth() + 1 ) + '-' + fullDate.getDate() );

		var weeks = Math.floor( Math.floor( ( election - fullDate ) / 86400000 ) / 7 );

		weekdrops[candidate] = weeks;

	} else {
		weekdrops[candidate] = false;
	}

} );

d3.json( '../data/instances-by-candidate.json', function ( instances ) {

	var padding = { top: 10, right: 40, bottom: 40, left: 40 };
	var width = $( '#viz-time' ).width() - padding.left - padding.right;
	var height = $( '#viz-time' ).height() - padding.top - padding.bottom;

	var svg = d3.select( '#viz-time' );

	var data = [];

	_.each( instances, function ( candidates, weeks ) {
		var datum = { weeks: parseInt( weeks ) };
		_.each( candidates, function ( count, candidate ) {
			if ( candidate !== 'Jill Stein' && candidate !== 'Gary Johnson' ) {
				datum[candidate] = count;
			}
		} );
		data.push( datum );
	} );

	var xMax = d3.max( data, function ( d ) { return d.weeks } );
	var xMin = d3.min( data, function ( d ) { return d.weeks } );

	var x = d3.scaleLinear().domain( [ xMin, xMax ] ).range( [ width, 0 ] );

	var yMax = d3.max( data, function ( d ) {
		return d3.max( _.values( d ) );
	} );
	var yMin = 0;

	var y = d3.scaleLinear().domain( [ yMin, yMax ] ).range( [ height, 0 ] );

	var color = d3.scaleOrdinal(d3.schemeCategory10);

	var candidates = [];
	_.each( data[0], function ( value, key ) {
		if ( key !== 'weeks' ) {
			candidates.push( key );
		}
	} );

	d3.select( '#time-controls-candidates' ).selectAll( 'option.time-controls-candidate' )
		.data( candidates )
		.enter()
		.append( 'option' )
		.classed( 'time-controls-candidate', true )
		.attr( 'value', function ( d ) { return d; } )
		.text( function ( d ) { return d; } );

	var candidateInstances = [];
	_.each( candidates, function ( candidate ) {
		candidateInstances.push( { candidate: candidate, count: 0 } );
	} );
	_.each( data, function ( d ) {

		_.each( d, function ( value, key ) {

			var candidate = _.find( candidateInstances, function ( c ) {
				return c.candidate === key;
			} );

			if ( candidate ) {
				candidate.count += value;
			}

		} );

	} );

	candidateInstances.sort( function ( a, b ) {
		return a.count < b.count ? 1 : -1;
	} );

	var xAxis = d3.axisBottom( x )
		.tickSize( -height )
		.ticks( 10 )
		.tickFormat( function ( d, i ) {
			return i === 0 ? d + ' weeks' : d;
		});

	var yAxis = d3.axisLeft( y )
		.tickSize( -width );

	svg.append( 'g' )
		.classed( 'axis', true )
		.classed( 'x-axis', true )
		.attr( 'transform', 'translate(' + padding.left + ',' + ( height + padding.top ) + ')' )
		.call( xAxis );

	svg.append( 'g' )
		.classed( 'axis', true )
		.classed( 'y-axis', true )
		.attr( 'transform', 'translate(' + padding.left + ',' + padding.top + ')' )
		.call( yAxis );

	var lines = svg.append( 'g' )
		.attr( 'transform', 'translate(' + padding.left + ',' + padding.top + ')' );

	_.each( candidates, function ( candidate, i ) {

		var lineData = [];
		_.each( data, function ( d ) {
			if ( d.weeks >= weekdrops[candidate] ) {
				lineData.push( d );
			}
		} );

		var line = d3.line()
			.x( function ( d ) {
				return x( d.weeks );
			} )
			.y( function ( d ) {
				return y( d[candidate] );
			} );

		lines.append( 'path' )
			.datum( lineData )
			.attr( 'class', function ( d ) {
				return 'line ' + parties[candidate];
			} )
			.attr( 'd', line )
			.attr( 'data-candidate', candidate );

	} );

	svg.selectAll( 'rect.hoverspot' )
		.data( candidateInstances )
		.enter()
		.append( 'rect' )
		.classed( 'hoverspot', true )
		.attr( 'width', width + 'px' )
		.attr( 'height', height / candidateInstances.length )
		.attr( 'transform', function ( d, i ) {
			return 'translate(0,' + ( i * ( height / candidateInstances.length ) + ')' );
		} )
		.style( 'fill', 'transparent' );

	var animateLines = function ( candidate ) {
		$( '#viz-time' ).find( '.line' ).each( function () {
			if ( $( this ).attr( 'data-candidate' ) === candidate ) {
				$( this ).addClass( 'active' );
				lines.selectAll( '.line' ).each( function ( d, i ) {

					var c = $( this ).attr( 'data-candidate' );

					if ( weekdrops[candidate] !== false ) {
						x.domain( [ weekdrops[candidate], xMax ] );
					} else {
						x.domain( [ xMin, xMax ] );
					}

					svg.select( '.x-axis' )
						.transition()
						.duration( 1000 )
						.call( xAxis );


					var line = d3.line()
						.x( function ( d ) { return x( d.weeks ); } )
						.y( function ( d ) { return y( d[c] ); } );

					d3.select( this )
						.transition()
						.duration( 1000 )
						.attr( 'd', line );

				} );

			}
		} );
	};

	$( '#time-controls-candidates' ).on( 'change', function () {

		$( '#viz-time' ).find( '.line' ).removeClass( 'active' );
		$( this ).removeClass( 'active' );
		var candidate = $( this ).find( ':selected' ).text();
		$( '#time-controls-candidate' ).text( candidate );
		var count = _.find( candidateInstances, function ( c ) {
			return c.candidate === candidate;
		} ).count;
		$( '#time-controls-number' ).text( numeral( count ).format( '0,0' ) );
		animateLines( candidate );

	} );

	$( '#viz-time' ).find( '.hoverspot' ).on( 'click', function () {
		$( '#viz-time' ).find( '.line' ).removeClass( 'active' );
		var candidate = d3.select( this ).datum().candidate;
		$( '#time-controls-candidate' ).text( candidate );
		var count = _.find( candidateInstances, function ( c ) {
			return c.candidate === candidate;
		} ).count;
		$( '#time-controls-number' ).text( numeral( count ).format( '0,0' ) );
		animateLines( candidate );

	} );

	$( '#viz-time' ).find( '.hoverspot' ).on( 'mouseover', function () {
		$( '#viz-time' ).find( '.line' ).removeClass( 'hovered' );
		var candidate = d3.select( this ).datum().candidate;
		$( '#viz-time' ).find( '.line' ).each( function () {
			if ( $( this ).attr( 'data-candidate' ) === candidate ) {
				$( this ).addClass( 'hovered' );
			}
		} );
	} );

	$( '#viz-time' ).find( '.hoverspot' ).eq( 0 ).trigger( 'click' );

	$( '#time-controls-candidate' ).on( 'click', function () {
		var p = $( this ).position();
		var w = $( this ).width();
		var h = $( this ).height();
		$( '#time-controls-candidates' ).css( { 'top': p.top + ( h / 2 ), 'left': p.left + ( w / 2 ) } );
		$( '#time-controls-candidates' ).toggleClass( 'active' );
	} );

} );