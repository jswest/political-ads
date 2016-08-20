var fs = require( 'fs' );
var d3 = require( 'd3' );
var _ = require( 'underscore' );

var adsCsv = fs.readFileSync( './data/seed/ads.csv' ).toString();
var ads = d3.csvParse( adsCsv );

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

var data = {};

// We're going to iterate over the ads array three times.
// First we want to grab all the parties and put them in the data object.
_.each( ads, function ( ad ) {

	// Only for presidential ads with sponsors and affiliations...
	if ( ad.race === 'PRES' && ad.sponsor && ad.sponsor_affiliation ) {

		// Find the sponsor in the JSON that includes the party.
		var sponsor = _.find( sponsors, function ( sponsor ) {
			return sponsor.sponsor === ad.sponsor;
		});

		// Make sure we have a party object for the sponsor's party
		// that we can fill with subjects.
		// Do this if we have a match.
		if ( sponsor ) {
			if ( !data[sponsor.party] ) {
				data[sponsor.party] = {};
			}
			if ( !data[sponsor.party][sponsor.sponsor_affiliation] ) {
				data[sponsor.party][sponsor.sponsor_affiliation] = {};
			}
			data[sponsor.party].all = {};
		}

	}

} );

// Second, we want to fill the parties with subjects.
_.each( ads, function ( ad ) {

	// Only for presidential ads with sponsors and affiliations...
	if ( ad.race === 'PRES' && ad.sponsor && ad.sponsor_affiliation ) {

		// Now, split the ad subject into an arrray.
		var adSubjects = ad.subject.split( ', ' );

		// Iterate over that array so we can push them into the data object.
		_.each( adSubjects, function ( subject ) {

			// If we have a subject...
			if ( subject ) {

				subject = cleanSubject( subject );

				// Iterate over the data object and fill.
				_.each( data, function ( candidates, party ) {

					_.each( candidates, function ( counts, candidate ) {

						// We want both the unique number of ads (ads) and the number of times it was aired (air_count).
						data[party][candidate][subject] = {
							ads: 0,
							air_count: 0
						};

					} );

					data[party].all[subject] = {
						ads: 0,
						air_count: 0
					};

				} );

			}

		} );
	}

} );

// Third, and last, fill with the air_count number and the unique ad number.
_.each( ads, function ( ad ) {

	// Only for presidential ads...
	if ( ad.race === 'PRES' && ad.sponsor_affiliation ) {

		// Now, split the ad subject into an array.
		var adSubjects = ad.subject.split( ', ' );

		// Iterate over that array so we can find the right values.
		_.each( adSubjects, function ( subject ) {

			// If we have a subject...
			if ( subject ) {

				subject = cleanSubject( subject );

				// Find the sponsor in the JSON that includes the party.
				var sponsor = _.find( sponsors, function ( sponsor ) {
					return sponsor.sponsor === ad.sponsor;
				});

				// If we have a match...
				if ( sponsor ) {

					// Fill the values of the data object at long last.
					data[sponsor.party].all[subject].air_count += parseInt( ad.air_count );
					data[sponsor.party].all[subject].ads++;
					data[sponsor.party][sponsor.sponsor_affiliation][subject].air_count += parseInt( ad.air_count );
					data[sponsor.party][sponsor.sponsor_affiliation][subject].ads++;

				}

			}

		} );

	}

} );

// Write the JSON file.
fs.writeFile( './data/party-candidate-and-subject-counts.json', JSON.stringify( data, null, 2 ), function ( error ) {
	console.log( error ? error : 'Party, candidate, and subject count JSON file written.' );
} );

// Transform to CSV.
var csv = 'party,candidate,subject,unique_ads,air_count\n';

_.each( data, function ( candidates, party ) {

	_.each( candidates, function ( subjects, candidate ) {

		_.each( subjects, function ( counts, subject ) {

			csv += party + ',' + candidate + ',' + subject + ',' + counts.ads + ',' + counts.air_count + '\n';

		} );

	} );

} );

// Write the CSV files.
fs.writeFile( './data/party-candidate-and-subject-counts.csv', csv, function ( error ) {
	console.log( error ? error : 'Party, candidate, and subject count CSV file written.' );
} );
fs.writeFile( './charts/data/subjects.csv', csv, function ( error ) {
	console.log( error ? error : 'Party, candidate, and subject count CSV file written in charts folder.' );
} );