var moment = require( 'moment' );
var fs = require( 'fs' );
var d3 = require( 'd3' );
var _ = require( 'underscore' );

var instancesCsv = fs.readFileSync( './data/seed/instances.csv' ).toString();
var instances = d3.csvParse( instancesCsv );

var sponsorsCsv = fs.readFileSync( './data/sponsors.csv' ).toString();
var sponsors = d3.csvParse( sponsorsCsv );

var getWeeksTillElection = function ( instance ) {

	var election = Date.parse( new Date( '2016-11-8' ) );

	var fullDate = new Date( instance.start_time );

	var date = Date.parse( fullDate.getFullYear() + '-' + ( fullDate.getMonth() + 1 ) + '-' + fullDate.getDate() );

	var weeks = Math.floor( Math.floor( ( election - fullDate ) / 86400000 ) / 7 );

	return weeks;

};


var data = {};

_.each( instances, function ( instance ) {

	if ( instance.race === 'PRES' && instance.sponsor && instance.sponsor_affiliation ) {

		var weeks = getWeeksTillElection( instance );

		data[weeks] = {};

		_.each( sponsors, function ( sponsor ) {
			if ( sponsor.sponsor_affiliation !== ' Not Washington' ) {
				data[weeks][sponsor.sponsor_affiliation] = 0;
			}
		} );

	}

} );

_.each( instances, function ( instance ) {

	if ( instance.race === 'PRES' && instance.sponsor && instance.sponsor_affiliation ) {

		// Find the sponsor in the JSON that includes the party.
		var sponsor = _.find( sponsors, function ( sponsor ) {
			return sponsor.sponsor === instance.sponsor;
		});

		if ( sponsor && sponsor.sponsor_affiliation !== ' Not Washington' ) {

			var weeks = getWeeksTillElection( instance );

			data[weeks][sponsor.sponsor_affiliation]++;

		}

	}

} );

fs.writeFile( './data/instances-by-candidate.json', JSON.stringify( data, null, 2 ), function ( error ) {
	console.log( error ? error : 'Instances by candidate JSON written.' );
} );

fs.writeFile( './charts/data/instances-by-candidate.json', JSON.stringify( data ), function ( error ) {
	console.log( error ? error : 'Instances by candidate JSON written for charts.' );
} );