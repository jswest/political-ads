var fs = require( 'fs' );
var d3 = require( 'd3' );
var _ = require( 'underscore' );

var rawAdsCsv = fs.readFileSync( './data/seed/ads.csv' ).toString();
var adsCsv = d3.csvParse( rawAdsCsv );

var rawSponsors = [];
var sponsors = [];

// Make a nice JSON file.
_.each( adsCsv, function ( ad ) {

	// Only for presidential ads where there is a clear sponsor affiliation...
	if ( ad.race === 'PRES' && ad.sponsor_affiliation ) {
		// Ad this to the canonical list of sponsors.
		if ( rawSponsors.indexOf( ad.sponsor ) === -1 ) {
			rawSponsors.push( ad.sponsor );
			sponsors.push( { sponsor: ad.sponsor, affiliation: ad.sponsor_affiliation } );
		}
	}

} );

// Write the JSON file.
fs.writeFile( './data/sponsors-raw.json', JSON.stringify( sponsors, null, 2 ), function ( error ) {
	console.log( error ? error : 'Raw sponsors JSON file written.' );
} );

// Write a CSV file.
var csv = 'sponsor,sponsor_affiliation\n';
_.each( sponsors, function ( sponsor ) {

	csv += sponsor.sponsor + ',' + sponsor.affiliation + '\n';

} );

// Write the CSV file.
fs.writeFile( './data/sponsors-raw.csv', csv, function ( error ) {
	console.log( error ? error : 'Raw sponsors CSV file written.' );
} );