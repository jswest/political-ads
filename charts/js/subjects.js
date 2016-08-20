window.subjectViz = {



	/**
	 * @private
	 * An object that describes the sentence version of the raw subjects for an ad.
	 */
	_sentence: {
		'HEALTH CARE': 'health care',
		'ECONOMY': 'the economy',
		'WOMEN': 'women',
		'IMMIGRATION': 'immigration',
		'CANDIDATE BIOGRAPHY': 'their biographies',
		'TERRORISM': 'terrorism',
		'TAXES': 'taxes',
		'JOBS': 'jobs',
		'FOREIGN POLICY': 'foreign policy',
		'MILITARY': 'the military',
		'CAMPAIGN FINANCE': 'campaign finance',
		'JOB ACCOMPLISHMENTS': 'their job accomplishments',
		'VETERANS': 'veterans',
		'VOTING RECORD': 'voting records',
		'SOCIAL SECURITY': 'social security',
		'CHILDREN': 'children',
		'GUNS': 'guns',
		'EDUCATION': 'education',
		'ABORTION': 'abortion',
		'HOMELAND SECURITY': 'homeland security',
		'INCOME': 'income',
		'FAMILIES': 'families',
		'NUCLEAR': 'nuclear power'
	},



	/**
	 * @private
	 * The amount of padding around the viz.
	 */
	_padding: {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	},



	/**
	 * @private
	 */
	_barDimensions: {
		height: 24,
		padding: 2,
		font: 12
	},



	/**
	 * @private _bindSvg
	 * Bind the viz to the SVG element.
	 */
	_bindSvg: function () {

		// We want both D3 and jQuery copies.
		this._svg = d3.select( '#viz-subjects' );
		this._$svg = $( '#viz-subjects' );

		this._wrapper = d3.select( '#viz-subjects-wrapper' );
		this._$wrapper = $( '#viz-subjects-wrapper' );

		this._width = this._$svg.width() - this._padding.left - this._padding.right;
		this._height = this._$svg.height() - this._padding.top - this._padding.bottom;

	},



	_setFilteredSubjects: function ( data ) {

		// Home for the total number of ad airings.
		this._totalAirCount = 0;

		// An empty array to help us make the canonical list of subjects.
		var subjectsCheck = [];

		// The canoncial list of subjects.
		var subjects = []

		// Iterate over the data...
		_.each( data, function ( d ) {

			// If it's not in the check array, then add it to the canonical list of subjects.
			if ( subjectsCheck.indexOf( d.subject ) === -1 ) {

				// Ad it to the check array.
				subjectsCheck.push( d.subject );

				// Add it, in its proper form, to the subjects array.
				// Note, we set the count to zero so we can easily incriment later.
				subjects.push( { subject: d.subject, count: 0 } );

			}

			// Now find the subject within the subject array.
			var subject = _.find( subjects, function ( s ) {
				return s.subject === d.subject;
			} );

			// If we have a match...
			if ( subject ) {

				// Incriment the count.
				subject.count += parseInt( d.air_count );

				// Incriment the total.
				this._totalAirCount += parseInt( d.air_count );

			}

		}.bind( this ) );

		// Create the correctly filtered subject array.
		// We only want subjects that account for at least 1% of airings.
		this._subjects = _.filter( subjects, function ( s ) {
			return s.count / this._totalAirCount >= 0.01;
		}.bind( this ) );

		// Now sort it by count.
		this._subjects.sort( function ( a, b ) {
			return a.count > b.count ? -1 : 1;
		} );

	},



	/**
	 * @private
	 * @function _createSubjectObjectElements
	 * Creates the HTML element that allows user to select subjects.
	 */
	_createSubjectObjectElements: function () {

		this._wrapper.select( '.viz-dropdown' ).selectAll( 'option' )
			.data( this._subjects )
			.enter()
			.append( 'option' )
			.classed( 'viz-control-option', true )
			.attr( 'value', function ( d ) { return d.subject } )
			.text( function ( d ) { return d.subject } );

	},



	/**
	 * @private
	 * @function _setCandidateData
	 */
	_setCandidateData: function ( data ) {

		var candidatesCheck = [];
		var candidates = [];

		_.each( data, function ( d ) {
			if (
				d.candidate !== 'all' &&
				( d.party === 'D' || d.party === 'R' ) &&
				candidatesCheck.indexOf( d.candidate ) === -1
			) {
				candidatesCheck.push( d.candidate );
				candidates.push( { name: d.candidate, party: d.party } );
			}
		} );

		candidates.push( { name: 'All Democrats', party: 'D' } );
		candidates.push( { name: 'All Republicans', party: 'R' } );

		this._candidateData = [];

		_.each( candidates, function ( candidate ) {

			this._candidateData.push( {
				candidate: candidate.name,
				party: candidate.party,
				subjects: {},
				total: 0
			} );

		}.bind( this ) );

		this._candidateData.sort( function ( a, b ) {
			var lastA = a.candidate.split( ' ' )[1];
			var lastB = b.candidate.split( ' ' )[1];
			return lastA < lastB ? -1 : 1;
		} );

		var republicansIndex = _.map( this._candidateData, function ( d ) {
			return d.candidate;
		} ).indexOf( 'All Republicans' );
		this._candidateData.unshift( this._candidateData.splice( republicansIndex, 1 )[0] );


		var democratsIndex = _.map( this._candidateData, function ( d ) {
			return d.candidate;
		} ).indexOf( 'All Democrats' );
		this._candidateData.unshift( this._candidateData.splice( democratsIndex, 1 )[0] );

		_.each( data, function ( d ) {

			var candidateDatum = _.find( this._candidateData, function ( c ) {
				return c.candidate === d.candidate;
			} );

			if ( d.candidate === 'all' && d.party === 'D' ) {
				candidateDatum = _.find( this._candidateData, function ( c ) {
					return c.candidate === 'All Democrats';
				} );
			} else if ( d.candidate === 'all' && d.party === 'R' ) {
				candidateDatum = _.find( this._candidateData, function ( c ) {
					return c.candidate === 'All Republicans';
				} );
			}

			if ( candidateDatum ) {
				candidateDatum.total += parseInt( d.air_count );
				candidateDatum.subjects[d.subject] = parseInt( d.air_count );
			}

		}.bind( this ) );

	},



	/**
	 * @primvate
	 * @function _createVizElements
	 */
	_createVizElements: function () {

		this._bars = this._svg.selectAll( 'g.bar' )
			.data( this._candidateData )
			.enter()
			.append( 'g' )
			.classed( 'bar', true )
			.attr( 'height', this._barDimensions.height + this._barDimensions.padding )
			.attr( 'width', this._width )
			.attr( 'transform', function ( d, i ) {
				return 'translate(0,' + ( i * ( this._barDimensions.height + this._barDimensions.padding ) ) + ')';
			}.bind( this ) );

		this._rects = this._bars.append( 'rect' )
			.attr( 'width', 0 ) // For now!
			.attr( 'height', this._barDimensions.height )
			.classed( 'democrat', function ( d ) {
				return d.party === 'D';
			})
			.classed( 'republican', function ( d ) {
				return d.party === 'R';
			});

		this._labels = this._bars.append( 'text' )
			.classed( 'label', true )
			.attr( 'x', 0 )
			.attr( 'y', ( this._barDimensions.height / 2 ) + 6 )
			.style( 'font-size', 12 )
			.text( function ( d ) { return d.candidate; } );

		this._percentLabels = this._bars.append( 'text' )
			.classed( 'label', true )
			.classed( 'percent-label', true )
			.attr( 'x', this._width )
			.attr( 'y', ( this._barDimensions.height / 2 ) + 6 )
			.attr( 'text-anchor', 'end' )
			.style( 'font-size', 12 );

		this._maxLabelWidth = d3.max( this._$svg.find( '.label' ), function ( d ) {
			return $( d ).width();
		} ) + ( this._barDimensions.height / 2 );

		this._labels.attr( 'x', this._maxLabelWidth ).attr( 'text-anchor', 'end' );

		this._rects.attr( 'width', this._maxLabelWidth + ( this._barDimensions.height / 2 ) );

	},



	/**
	 * @private
	 * @function _bindControlSentenceClick
	 */
	_bindControlSentenceClick: function () {

		$( '#viz-control-sentence-subjects-subject' ).on( 'click', function () {
			var $dropdown = $( '#viz-control-dropdown-subjects-subjects' );
			var p = $( this ).position();
			var w = $( this ).width();
			var h = $( this ).height();
			$dropdown.css( { 'top': p.top + ( h / 2 ), 'left': p.left + ( w / 2 ) } );
			$dropdown.toggleClass( 'active' );
		} );

	},



	/**
	 * @private
	 * @function _bindControlDropdownClick
	 */
	_bindControlDropdownClick: function ( data ) {

		this._$wrapper.find( '.viz-dropdown' ).on( 'change', function ( e ) {

			var $el = $( e.currentTarget );

			$el.removeClass( 'active' );

			var subject = $el.find( ':selected' ).text();

			$( '#viz-control-sentence-subjects-subject' ).text( this._sentence[subject.toUpperCase()] );

			var dtotal = 0;
			var rtotal = 0;
			_.each( data, function ( d ) {
				if ( d.subject === subject && d.party === 'D' ) {
					dtotal += parseInt( d.air_count );
				} else if ( d.subject === subject && d.party === 'R' ) {
					rtotal += parseInt( d.air_count );
				}
			} );

			var comparator = dtotal / this._totalAirCount > rtotal / this._totalAirCount ? 'more' : 'less';

			$( '#viz-control-sentence-subjects-comparator' ).text( comparator );

			var widthScale = d3.scaleLinear()
				.domain( [
					0,
					d3.max( this._candidateData, function ( d ) {
						if ( d.subjects[subject] > 0 ) {
							var percent = Math.round( ( d.subjects[subject] / d.total ) * 10000 ) / 100;
						} else {
							var percent = 0;
						}
						return percent;
					} )
				] )
				.range( [ 0, this._width - ( this._maxLabelWidth + 12 ) - 100 ] );


			this._rects
				.transition()
				.duration( 1000 )
				.attr( 'width', function ( d ) {
					if ( d.subjects[subject] > 0 ) {
						var percent = Math.round( ( d.subjects[subject] / d.total ) * 10000 ) / 100;
					} else {
						var percent = 0;
					}
					return widthScale( percent ) + this._maxLabelWidth + 12;
				}.bind( this ) );

			this._percentLabels.text( function ( d ) {
				if ( d.subjects[subject] > 0 ) {
					var percent = Math.round( ( d.subjects[subject] / d.total ) * 10000 ) / 100;
				} else {
					var percent = 0;
				}
				return percent + '%';
			} );


		}.bind( this ) );

	},



	/**
	 * @public
	 * @function on
	 */
	on: function () {
		this._bindSvg();
		d3.csv( '../data/subjects.csv', function ( data ) {
			this._setFilteredSubjects( data );
			this._createSubjectObjectElements();
			this._setCandidateData( data );
			this._createVizElements();
			this._bindControlSentenceClick();
			this._bindControlDropdownClick( data );
			this._$wrapper.find( '.viz-dropdown option' ).eq( 0 ).prop( 'selected', 'true' );
			this._$wrapper.find( '.viz-dropdown' ).trigger( 'change' );
		}.bind( this ) );
	}

};

window.subjectViz.on();