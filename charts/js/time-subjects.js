
var _sentence = {
	'HEALTH CARE': 'health care',
	'ECONOMY': 'the economy',
	'WOMEN': 'women',
	'IMMIGRATION': 'immigration',
	'CANDIDATE BIOGRAPHY': 'candidate biographies',
	'TERRORISM': 'terrorism',
	'TAXES': 'taxes',
	'JOBS': 'jobs',
	'FOREIGN POLICY': 'foreign policy',
	'MILITARY': 'the military',
	'CAMPAIGN FINANCE': 'campaign finance',
	'JOB ACCOMPLISHMENTS': 'candidate job accomplishments',
	'VETERANS': 'veterans',
	'VOTING RECORD': 'voting records',
	'SOCIAL SECURITY': 'social security',
	'CHILDREN': 'children',
	'GUNS': 'guns',
	'EDUCATION': 'education',
	'ABORTION': 'abortion',
	'HOMELAND SECURITY': 'homeland security',
	'INCOME': 'income',
	'ENERGY': 'energy',
	'RELIGION': 'religion',
	'FAMILIES': 'families',
	'NUCLEAR': 'nuclear power'
};


d3.json( 'data/instances-by-subject.json', function ( instances ) {

	var padding = { top: 10, right: 40, bottom: 40, left: 40 };
	var width = $( '#viz-time-subjects' ).width() - padding.left - padding.right;
	var height = $( '#viz-time-subjects' ).height() - padding.top - padding.bottom;

	var svg = d3.select( '#viz-time-subjects' );

	var data = [];

	_.each( instances, function ( subjects, weeks ) {
		var datum = { weeks: parseInt( weeks ) };
		_.each( subjects, function ( count, subject ) {
			datum[subject] = count;
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

	var subjects = [];
	_.each( data[0], function ( value, key ) {
		if ( key !== 'weeks' ) {
			subjects.push( key );
		}
	} );

	var subjectInstances = [];
	_.each( subjects, function ( subject ) {
		subjectInstances.push( { subject: subject, count: 0 } );
	} );
	_.each( data, function ( d ) {

		_.each( d, function ( value, key ) {

			var subject = _.find( subjectInstances, function ( s ) {
				return s.subject === key;
			} );

			if ( subject ) {
				subject.count += value;
			}

		} );

	} );

	subjectInstances.sort( function ( a, b ) {
		return a.count < b.count ? 1 : -1;
	} );

	d3.select( '#viz-control-dropdown-time-subjects-subjects' ).selectAll( 'option' )
		.data( subjectInstances )
		.enter()
		.append( 'option' )
		.attr( 'value', function ( d ) { return d.subject; } )
		.text( function ( d ) { return d.subject; } );

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

	_.each( subjects, function ( subject ) {

		var lineData = [];
		_.each( data, function ( d ) {
			lineData.push( d );
		} );

		var line = d3.line()
			.x( function ( d ) {
				return x( d.weeks );
			} )
			.y( function ( d ) {
				return y( d[subject] );
			} );

		lines.append( 'path' )
			.datum( lineData )
			.classed( 'line', true )
			.classed( 'subject', true )
			.attr( 'd', line )
			.attr( 'data-subject', subject );

	} );

	svg.selectAll( 'rect.hoverspot' )
		.data( subjectInstances )
		.enter()
		.append( 'rect' )
		.classed( 'hoverspot', true )
		.attr( 'width', width + 'px' )
		.attr( 'height', height / subjectInstances.length )
		.attr( 'transform', function ( d, i ) {
			return 'translate(0,' + ( i * ( height / subjectInstances.length ) + ')' );
		} )
		.style( 'fill', 'transparent' );

	var animateLines = function ( subject ) {
		$( '#viz-time-subjects' ).find( '.line' ).each( function () {
			if ( $( this ).attr( 'data-subject' ) === subject ) {
				$( this ).addClass( 'active' );
			}
		} );
	};

	$( '#viz-control-dropdown-time-subjects-subjects' ).on( 'change', function () {

		$( '#viz-time-subjects' ).find( '.line' ).removeClass( 'active' );
		$( this ).removeClass( 'active' );
		var subject = $( this ).find( ':selected' ).text();
		$( '#viz-control-sentence-time-subjects-subject' ).text( _sentence[subject.toUpperCase()] );
		var count = _.find( subjectInstances, function ( c ) {
			return c.subject === subject;
		} ).count;
		$( '#viz-control-sentence-time-subjects-number' ).text( numeral( count ).format( '0,0' ) );
		animateLines( subject );

	} );

	$( '#viz-time-subjects' ).find( '.hoverspot' ).on( 'click', function () {
		$( '#viz-time-subjects' ).find( '.line' ).removeClass( 'active' );
		var subject = d3.select( this ).datum().subject;
		console.log( subject );
		$( '#viz-control-sentence-time-subjects-subject' ).text( _sentence[subject.toUpperCase()] );
		var s = _.find( subjectInstances, function ( c ) {
			return c.subject === subject;
		} );
		var count = 0;
		if ( s ) {
			count = s.count;
		}
		$( '#viz-control-sentence-time-subjects-number' ).text( numeral( count ).format( '0,0' ) );
		animateLines( subject );

	} );

	$( '#viz-time-subjects' ).find( '.hoverspot' ).on( 'mouseover', function () {
		$( '#viz-time-subjects' ).find( '.line' ).removeClass( 'hovered' );
		var subject = d3.select( this ).datum().subject;
		$( '#viz-time-subjects' ).find( '.line' ).each( function () {
			if ( $( this ).attr( 'data-subject' ) === subject ) {
				$( this ).addClass( 'hovered' );
			}
		} );
	} );

	$( '#viz-time-subjects' ).find( '.hoverspot' ).eq( 0 ).trigger( 'click' );

	$( '#viz-control-sentence-time-subjects-subject' ).on( 'click', function () {
		var p = $( this ).position();
		var w = $( this ).width();
		var h = $( this ).height();
		$( '#viz-control-dropdown-time-subjects-subjects' ).css( { 'top': p.top + ( h / 2 ), 'left': p.left + ( w / 2 ) } );
		$( '#viz-control-dropdown-time-subjects-subjects' ).toggleClass( 'active' );
	} );

} );