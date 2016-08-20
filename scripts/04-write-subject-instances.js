var moment = require( 'moment' );
var fs = require( 'fs' );
var d3 = require( 'd3' );
var _ = require( 'underscore' );

var instancesCsv = fs.readFileSync( './data/seed/instances.csv' ).toString();
var instances = d3.csvParse( instancesCsv );

var sponsorsCsv = fs.readFileSync( './data/sponsors.csv' ).toString();
var sponsors = d3.csvParse( sponsorsCsv );

var cleanSubject = function ( subject ) {

	if (
		subject === 'Canddate Biography' ||
		subject === 'Candiate Biography' ||
		subject === 'Candiate biography' ||
		subject === 'Candidiate Biography'
	) {
		subject = 'Candidate Biography';
	}

	if ( subject === 'Disability ' ) {
		subject = 'Disability';
	}

	if ( subject === 'Government Efficiency ' ) {
		subject = 'Government Efficiency';
	}

	if (
		subject === 'Government Regulations' ||
		subject === 'Government regulation'
	) {
		subject = 'Government Regulation';
	}

	if ( subject === 'Isreal' ) {
		subject = 'Israel';
	}

	if ( subject === 'Negative Campaigning ' ) {
		subject = 'Negative Campaigning';
	}

	if ( subject === 'Terrorism ' ) {
		subject = 'Terrorism';
	}

	if (
		subject === 'D.C.' ||
		subject === 'Washington' ||
		subject === 'Washington D.C. '
	) {
		subject = 'Washington D.C.';
	}

	if ( subject === 'immigration' ) {
		subject = 'Immigration';
	}

	return subject;
};

var getWeeksTillElection = function ( instance ) {

	var election = Date.parse( new Date( '2016-11-8' ) );

	var fullDate = new Date( instance.start_time );

	var date = Date.parse( fullDate.getFullYear() + '-' + ( fullDate.getMonth() + 1 ) + '-' + fullDate.getDate() );

	var weeks = Math.floor( Math.floor( ( election - fullDate ) / 86400000 ) / 7 );

	return weeks;

};

var data = {};

var subjects = [];

var subjectTotals = {};

var total = 0;

_.each( instances, function ( instance ) {

	if ( instance.race === 'PRES' && instance.sponsor && instance.sponsor_affiliation ) {

		var weeks = getWeeksTillElection( instance );

		data[weeks] = {};

		// Now, split the ad subject into an arrray.
		var adSubjects = instance.subject.split( ', ' );

		// Iterate over that array so we can push them into the data object.
		_.each( adSubjects, function ( subject ) {

			// If we have a subject...
			if ( subject ) {

				subject = cleanSubject( subject );

				if ( subjects.indexOf( subject ) === -1 ) {
					subjects.push( subject );
				}

			}

		} );

	}

} );

_.each( subjects, function ( subject ) {

	subjectTotals[subject] = 0;

} );

_.each( instances, function ( instance ) {

	var adSubjects = instance.subject.split( ', ' );

	_.each( adSubjects, function ( subject ) {

		if ( subject ) {

			subject = cleanSubject( subject );

			subjectTotals[subject]++;

			total++;

		}

	} );

} );

_.each( data, function ( weeksSubjects, weeks ) {

	_.each( subjects, function ( subject ) {

		if ( subjectTotals[subject] / total >= 0.01 ) {
			data[weeks][subject] = 0;
		}

	} );

} );


_.each( instances, function ( instance ) {

	if ( instance.race === 'PRES' && instance.sponsor && instance.sponsor_affiliation ) {

		var weeks = getWeeksTillElection( instance );

		var adSubjects = instance.subject.split( ', ' );

		_.each( adSubjects, function ( subject ) {

			if ( subject ) {

				subject = cleanSubject( subject );

				if ( subjectTotals[subject] / total >= 0.01 ) {
					data[weeks][subject]++;
				}

			}

		} );

	}

} );

fs.writeFile( './data/instances-by-subject.json', JSON.stringify( data, null, 2 ), function ( error ) {
	console.log( error ? error : 'Instances by subject JSON written.' );
} );

fs.writeFile( './charts/data/instances-by-subject.json', JSON.stringify( data ), function ( error ) {
	console.log( error ? error : 'Instances by subject JSON written for charts.' );
} );