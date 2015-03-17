/**
 * SurfacingController and related classes
 * Part of the Surfacing website
 * developed for Nicole Starosielski
 * by Erik Loyer
 */
  
var controller = new SurfacingController();

/**
 * Creates a new SurfacingController. This is called automatically and the resulting instance
 * placed in the global variable controller.
 */
function SurfacingController() {

	scalarapi.setBook('http://scalar.usc.edu/nehvectors/surfacing/');
	
	this.useLocalData = true;
	this.placeFiles = [
		"places",
		"place-0-299",
		"place-300-599",
		"place-600-899",
		"place-900-1199",
		"place-1200-1499"
	];
	this.placeFileIndex = -1;
	this.cableFiles = [
		"cable-0-49",
		"cable-50-99",
		"cable-100-149",
		"cable-150-199",
		"cable-200-249",
		"cable-250-299",
		"cable-300-349"
	];
	this.cableFileIndex = -1;

}

SurfacingController.prototype.useLocalData = null;
SurfacingController.prototype.placeFiles = null;
SurfacingController.prototype.placeFileIndex = null;
SurfacingController.prototype.cableFiles = null;
SurfacingController.prototype.cableFileIndex = null;

/**
 * Starts initialization.
 */
SurfacingController.prototype.init = function() {

	this.getImages();

}

/**
 * Completes initialization. (NOT CURRENTLY USED)
 */
SurfacingController.prototype.completeInit = function() {
	
	// set initial state of page according to the url we received
	var urlState = getUrlParameter('view');
	if (urlState != null) {
		view.setState(urlState);
	} else {
		view.setState(ViewState.Image);
	}

}

/**
 * Loads the images.
 */
SurfacingController.prototype.getImages = function() {

	//console.log( 'get images' );

	// http://scalar.usc.edu/nehvectors/surfacing/rdf/instancesof/media?rec=1&ref=0&format=json

	if ( !this.useLocalData ) {
		scalarapi.loadPagesByType('media', true, this.handleImages, null, 1);
	} else {
		$.ajax({
			type:"GET",
			url:"data/media.json",
			dataType:"json",
			success:[scalarapi.parsePage, this.handleImages],
			error:scalarapi.handleLoadPageError
		});
	}

}

SurfacingController.prototype.handleImages = function( results ) {

	console.log( 'got images' );

	model.images = [];
	var node,
		mediaNodes = scalarapi.model.getNodesWithProperty('scalarType', 'media');
	
	for (var i in mediaNodes) {
		node = mediaNodes[ i ];
		if ( node.current.mediaSource.contentType == 'image' ) {
			node.places = [];
			model.images.push( node );
		}
	}
	
	controller.getPlaces();

}

/**
 * Loads the images.
 */
SurfacingController.prototype.getImagesPaginated = function() {

	var me = this;

	scalarapi.loadPagesByType('media', true, function(results) {
	
		model.images = [];
		var mediaNodes = scalarapi.model.getNodesWithProperty('scalarType', 'media');
		
		for (var i in mediaNodes) {
			if (mediaNodes[i].current.mediaSource.contentType == 'image') {
				model.images.push(mediaNodes[i]);
			}
		}
		
		//console.log( mediaNodes );
		
	}, null, 3, false, null, 0, 10 );

}

/**
 * Loads the places.
 */
SurfacingController.prototype.getPlaces = function() {

	//console.log( 'get places' );

	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/place?rec=2&ref=0&format=json (yes, we really do need to include this one too)
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/place-0-299?rec=2&ref=0&format=json
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/place-300-599?rec=2&ref=0&format=json
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/place-600-899?rec=2&ref=0&format=json
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/place-900-1199?rec=2&ref=0&format=json
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/place-1200-1499?rec=2&ref=0&format=json
	
	if ( !this.useLocalData ) {
		scalarapi.loadPage('place', true, this.handlePlaces, null, 2);
	} else {
		this.getNextPlaceFile();
		/*$.ajax({
			type:"GET",
			url:"data/places.json",
			dataType:"json",
			success:[scalarapi.parsePage, this.handlePlaces],
			error:[scalarapi.handleLoadPageError, function(e) { console.log( e ); }]
		});*/
	}

}

SurfacingController.prototype.getNextPlaceFile = function() {

	controller.placeFileIndex++;

	//console.log( controller.placeFiles );

	if ( controller.placeFileIndex < controller.placeFiles.length ) {
		console.log( "get place file: " + controller.placeFiles[ controller.placeFileIndex ] );
		$.ajax({
			type: "GET",
			url: "data/" + controller.placeFiles[ controller.placeFileIndex ] + ".json",
			dataType: "json",
			success:[scalarapi.parsePage, controller.getNextPlaceFile],
			error:[scalarapi.handleLoadPageError, function(e) { console.log( e ); }]
		});
	} else {
		controller.handlePlaces();
	}

}

SurfacingController.prototype.handlePlaces = function() {

	console.log( 'got places' );

	model.places = [];
	var placeTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'place'];
	model.places = placeTag.getRelatedNodes('tag', 'outgoing');

	var i;
	for ( i = 1; i < this.placeFiles.length; i++ ) {
		placeTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix + this.placeFiles[ i ] ];
		model.places = model.places.concat( placeTag.getRelatedNodes('tag', 'outgoing') );
	}

	console.log( "place count: " + model.places.length );

	model.postProcessPlaces();
	view.handleLoadCompleted( 'places' );
	
	controller.getStories();

}

/**
 * Loads the stories.
 */
SurfacingController.prototype.getStories = function() {

	//console.log( 'get stories' );

	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/story?rec=2&ref=0&format=json

	if ( !this.useLocalData ) {
		scalarapi.loadPage('story', true, this.handleStories, null, 2);
	} else {
		$.ajax({
			type:"GET",
			url:"data/stories.json",
			dataType:"json",
			success:[scalarapi.parsePage, this.handleStories],
			error:scalarapi.handleLoadPageError
		});
	}

}

SurfacingController.prototype.handleStories = function() {

	console.log( 'got stories' );

	model.stories = [];
	var storyTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'story'];
	model.stories = storyTag.getRelatedNodes('tag', 'outgoing');
	
	for ( var i in model.stories ) {
		model.stories[ i ].images = [];
		model.stories[ i ].themes = [];
	}
	
	model.postProcessImages();
	
	view.handleLoadCompleted();
	
	controller.getStoryGroups();

}

/**
 * Loads the story groups.
 */
SurfacingController.prototype.getStoryGroups = function() {

	console.log( 'get story groups' );

	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/story-group?rec=1&ref=0&format=json

	if ( !this.useLocalData ) {
		scalarapi.loadPage('story-group', true, this.handleStoryGroups, null, 1);
	} else {
		$.ajax({
			type:"GET",
			url:"data/story-groups.json",
			dataType:"json",
			success:[scalarapi.parsePage, this.handleStoryGroups],
			error:scalarapi.handleLoadPageError
		});
	}

}

SurfacingController.prototype.handleStoryGroups = function() {

	//console.log( 'got story groups' );

	model.storyGroups = [];
	var storyGroupTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'story-group'];
	model.storyGroups = storyGroupTag.getRelatedNodes('tag', 'outgoing');
	view.handleLoadCompleted();
	
	controller.getCableGroups();
	
}

SurfacingController.prototype.getCableGroups = function() {

	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/cable-group?rec=1&res=tag&ref=0&format=json

	$.ajax({
		type:"GET",
		url:"data/cable-groups.json",
		dataType:"json",
		success:[scalarapi.parsePage, function() { 
			controller.getCables(); 
		}],
		error:scalarapi.handleLoadPageError
	});

}

/**
 * Loads the cables.
 */
SurfacingController.prototype.getCablesPaginated = function() {

	var me = this;
	
	scalarapi.loadPage('cable', true, function(results) {
		var cableTag = scalarapi.getNode( 'cable' );
		model.cables = cableTag.getRelatedNodes('tag', 'outgoing');
		//console.log( results );
		//console.log( model.cables );
		/*model.branchPointTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'branching-point'];
		model.ringTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'ring-1'];
		view.handleLoadCompleted();*/
		
	}, null, 1, false, null, 0, 10);

}

/**
 * Loads the cables.
 */
SurfacingController.prototype.getCables = function() {

	//console.log( 'get cables' );

	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/cable?rec=2&ref=0&format=json

	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/cable-0-49?rec=2&ref=0&format=json
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/cable-50-99?rec=2&ref=0&format=json
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/cable-100-149?rec=2&ref=0&format=json
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/cable-150-199?rec=2&ref=0&format=json
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/cable-200-249?rec=2&ref=0&format=json
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/cable-250-299?rec=2&ref=0&format=json
	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/cable-300-349?rec=2&ref=0&format=json

	if ( !this.useLocalData ) {
		scalarapi.loadPage('cable', true, this.handleCables, null, 2);
	} else {
		this.getNextCableFile();
		/*$.ajax({
			type:"GET",
			url:"data/cables.json",
			dataType:"json",
			success:[scalarapi.parsePage, this.handleCables],
			error:scalarapi.handleLoadPageError
		});*/
	}

}

SurfacingController.prototype.getNextCableFile = function() {

	controller.cableFileIndex++;

	//console.log( controller.placeFiles );

	if ( controller.cableFileIndex < controller.cableFiles.length ) {
		console.log( "get cable file: " + controller.cableFiles[ controller.cableFileIndex ] );
		$.ajax({
			type: "GET",
			url: "data/" + controller.cableFiles[ controller.cableFileIndex ] + ".json",
			dataType: "json",
			success:[scalarapi.parsePage, controller.getNextCableFile],
			error:[scalarapi.handleLoadPageError, function(e) { console.log( e ); }]
		});
	} else {
		controller.handleCables();
	}

}

SurfacingController.prototype.handleCables = function() {

	//console.log( 'got cables' );

	model.cables = [];

	var i, cableTag;
	for ( i = 0; i < this.cableFiles.length; i++ ) {
		cableTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix + this.cableFiles[ i ] ];
		model.cables = model.cables.concat( cableTag.getRelatedNodes( 'tag', 'outgoing' ) );
	}

	console.log( "cable count: " + model.cables.length );

	/*
	var cableTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'cable'];
	model.cables = cableTag.getRelatedNodes('tag', 'outgoing');
	*/

	model.branchPointTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'branching-point'];
	model.ringTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'ring-1'];
	var cableGroupTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'cable-group'];
	model.cableGroups = cableGroupTag.getRelatedNodes('tag', 'outgoing');

	var n = model.cableGroups.length;
	model.cableGroupNames = [];
	for ( i = 0; i < n; i++ ) {
		model.cableGroupNames.push( model.cableGroups[ i ].slug );
	}
	model.postProcessCables();
	view.handleLoadCompleted( 'cables' );
	
	controller.getThemes();

}

/**
 * Loads the themes.
 */
SurfacingController.prototype.getThemes = function() {

	//console.log( 'get themes' );

	// http://scalar.usc.edu/nehvectors/surfacing/rdf/node/theme?rec=2&ref=0&format=json

	if ( !this.useLocalData ) {
		scalarapi.loadPage('theme', true, this.handleThemes, null, 2);
	} else {
		$.ajax({
			type:"GET",
			url:"data/themes.json",
			dataType:"json",
			success:[scalarapi.parsePage, this.handleThemes],
			error:scalarapi.handleLoadPageError
		});
	}

}

SurfacingController.prototype.handleThemes = function() {

	//console.log( 'got themes' );

	model.themes = [];
	var themeTag = scalarapi.model.nodesByURL[scalarapi.model.urlPrefix+'theme'];
	model.themes = themeTag.getRelatedNodes('tag', 'outgoing');
	
	model.postProcessThemes();
	view.handleLoadCompleted( 'themes' );
	
	//controller.completeInit();

}

 