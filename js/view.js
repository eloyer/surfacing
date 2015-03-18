/**
 * SurfacingView and related classes
 * Part of the Surfacing website
 * developed for Nicole Starosielski
 * by Erik Loyer
 */

// Source: http://www.netlobo.com/url_query_string_javascript.html
function getUrlParameter(name) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
	var regexS = "[\\?&]"+name+"=([^&#]*)";  
	var regex = new RegExp( regexS );  
	var results = regex.exec( window.location.href ); 
	if(results == null) {
		return null;  
	} else {
		return results[1];
	}    
}
 
// Possible macro states of the view
var ViewState = {
	Title: 0,
	Theme: 5,
	Map: 4,
	Place: 3,
	Image: 2,
	Story: 1
};

// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// Source: http://www.netlobo.com/url_query_string_javascript.html
function getUrlParameter(name) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");  
	var regexS = "[\\?&]"+name+"=([^&#]*)";  
	var regex = new RegExp( regexS );  
	var results = regex.exec( window.location.href ); 
	if(results == null) {
		return null;  
	} else {
		return results[1];
	}    
}

// Source: http://www.kirupa.com/forum/showthread.php?63633-shortest-distance-between-two-angles
function getDeltaAngle(a1, a2) {
    var angle = (Math.abs(a1 - a2))%360;
    if(angle > 180) angle = 360 - angle;
    return angle;
};

function interpolateKeyframes( keyframes, t ) {

	var i, n, keyframe, lastKeyframe, result, ratio;
	
	keyframes.sort( function( a, b ) {
		return a.key - b.key;
	} );
	
	n = keyframes.length;
	for ( i = 0; i < n; i++ ) {
		keyframe = keyframes[ i ];
		if ( t < keyframe.key ) {
			if ( i == 0 ) {
				result = keyframe.value;
				break;
			} else {
				lastKeyframe = keyframes[ i - 1 ];
				ratio = ( t - lastKeyframe.key ) / ( keyframe.key - lastKeyframe.key );
				result = lastKeyframe.value + ( ( keyframe.value - lastKeyframe.value ) * ratio );
				break;
			}
		} else if ( i == ( n - 1 ) ) {
			result = keyframe.value;
		}
	}

	return result;
}


var view = new SurfacingView();

/**
 * Creates a new SurfacingView. This is called automatically and the resulting instance
 * placed in the global variable view.
 */
function SurfacingView() {

	var me = this;
	
	this.targetState = this.currentState = this.lastState = ViewState.Image;
	this.lastFrame = new Date().getTime();
	
	var state;
	this.minState = 99999;
	this.maxState = -99999;
	for ( var i in ViewState ) {
		if ( i != 'Title' ) {
			state = ViewState[ i ];
			if ( state < this.minState ) {
				this.minState = state;
			}
			if ( state > this.maxState ) {
				this.maxState = state;
			}
		}
	}
	
	this.stateData = [];
	this.localCables = [];
	this.localCablePlaces = [];
	this.relatedNodes = [];
	this.initialized = false;
	this.launchContentRestored = false;
	
	this.stateData[ ViewState.Theme ] = {
		//projection: d3.geo.orthographic().scale( 5 )
		projection: d3.geo.mercator().clipAngle( 90 )
	};
	
	this.stateData[ ViewState.Map ] = {
		//projection: d3.geo.orthographic().scale( 2.5 ).clipAngle( 90 )
		projection: d3.geo.mercator().clipAngle( 90 )
	};
	
	this.stateData[ ViewState.Place ] = {
		//projection: d3.geo.orthographic().scale( 60 ).clipAngle( 90 )
		projection: d3.geo.mercator().clipAngle( 90 )
	};
	
	this.stateData[ ViewState.Image ] = {
		//projection: d3.geo.orthographic().scale( 70 ).clipAngle( 90 )
		projection: d3.geo.mercator().clipAngle( 90 )
	};
	
	this.stateData[ ViewState.Story ] = {
		projection: d3.geo.mercator().clipAngle( 90 )
		//projection: d3.geo.orthographic().scale( 10 )
		/*projection: d3.geo.satellite()
		    .distance(1.1)
		    .scale(15)
		    .clipAngle( 30 )
		    .precision(.1)*/
	}
	
	// restores content when back/forward buttons clicked (but not when state changes are pushed to History.js)
    $(window).bind('popstate', function(e){
		if (typeof e['originalEvent'] !== 'undefined') {
			me.restoreContentFromURL();
		}
	});

}

SurfacingView.prototype.currentState = null;
SurfacingView.prototype.targetState = null;
SurfacingView.prototype.lastState = null;
SurfacingView.prototype.lowState = null;
SurfacingView.prototype.minState = null;
SurfacingView.prototype.maxState = null;
SurfacingView.prototype.highState = null;
SurfacingView.prototype.stateData = null;
SurfacingView.prototype.visualization = null;
SurfacingView.prototype.stories = null;
SurfacingView.prototype.lastFrame = null;
SurfacingView.prototype.timeSinceLastFrame = null;
SurfacingView.prototype.currentPlace = null;
SurfacingView.prototype.localCables = null;
SurfacingView.prototype.localCablePlaces = null;
SurfacingView.prototype.relatedNodes = null;
SurfacingView.prototype.currentTheme = null;
SurfacingView.prototype.currentCable = null;
SurfacingView.prototype.initialized = null;
SurfacingView.prototype.launchContentRestored = null;
SurfacingView.prototype.hasBeenDragged = null;

SurfacingView.prototype.init = function() {

	this.visualization = new SurfacingVisualization();
	
	$( '#zoom-controls' ).data( 'zoomOutBtn', 'bottom' );
	
	$( '#top-zoom-btn' ).click( function() {
		if ( $( this ).attr( 'src' ) != 'images/empty_btn_top.png' ) {
			view.centerOnCurrentPlace( view.decrementViewState );
		}
		
	} );
	
	$( '#bottom-zoom-btn' ).click( function() {
		if ( $( this ).attr( 'src' ) != 'images/empty_btn_bottom.png' ) {
			view.centerOnCurrentPlace( view.incrementViewState );
		}
		
	} );
	
}

SurfacingView.prototype.log = function( message, replace ) {
	if ( replace ) {
		$( '#message-box' ).html( message + '<br/>' );
	} else {
		$( '#message-box' ).append( message + '<br/>' );
	}
	$( '#message-box' ).css( 'display', 'inline' );
}

SurfacingView.prototype.wrapState = function( state ) {

	state = Math.round( state );

	if ( state > this.maxState ) {
		state = state - this.maxState;
	} else if ( state < this.minState ) {
		state = this.maxState + state;
	}
	
	return state;
}

SurfacingView.prototype.perFrame = function( type ) {
	
	var currentTime = new Date().getTime();
	view.timeSinceLastFrame = currentTime - view.lastFrame;
	view.currentState += ( view.targetState - view.currentState ) * ( .1 /** ( view.timeSinceLastFrame * .001 )*/ );
	
	view.lowState = view.wrapState( Math.floor( view.currentState ) );
	view.highState = view.wrapState( Math.ceil( view.currentState ) );
	
	//view.log( view.lowState + ' - ' + view.highState + ' ' + view.currentState, true );
	
	if ( Math.abs( view.currentState - view.targetState ) < .00001 ) {
		view.currentState = view.targetState;
		if ( !model.muteViz) {
			view.visualization.perFrame( true );
		}
	} else {
		if ( !model.muteViz) {
			view.visualization.perFrame();
		}
	}
	
	view.lastFrame = currentTime;
	window.requestAnimationFrame( view.perFrame );

	//$( '#message-box' ).text( 'current: ' + view.currentState + ' target: ' + view.targetState );
	
}

SurfacingView.prototype.decrementViewState = function( ) {

	if (( view.targetState == ViewState.Image ) && ( this.currentImage.stories.length == 0 )) {
		this.incrementViewState();
	} else {
		var wrappedState,
			newState = view.targetState - 1;
		//if (( view.currentState == ViewState.Place ) ||( view.currentState == ViewState.Story ) || ( view.currentState == ViewState.Theme )) {
			view.stories.resetStories();
		//}
		if ( newState < this.minState ) {
			wrappedState = this.maxState;
			view.currentState = wrappedState + ( newState + view.currentState );
		} else {
			wrappedState = newState;
		}
		//alert( 'current: ' + view.targetState + ' / new: ' + wrappedState + ' / action: zoom in  / zoom out btn: ' + $( '#zoom-controls' ).data( 'zoomOutBtn' ) );

		view.setState( wrappedState );
		view.updateURL();
	}
	
	/*if ( wrappedState == ViewState.Story ) {
		if ( this.currentStory == null ) {
			this.decrementViewState();
		}
	}*/

}

SurfacingView.prototype.incrementViewState = function( ) {

	var wrappedState,
		newState = view.targetState + 1;
	//if (( view.currentState == ViewState.Place ) ||( view.currentState == ViewState.Story ) || ( view.currentState == ViewState.Theme )) {
		view.stories.resetStories();
	//}
	if ( newState > this.maxState ) {
		wrappedState = this.minState;
		view.currentState = wrappedState - ( newState - view.currentState );
	} else {
		wrappedState = newState;
	}
	//alert( 'current: ' + view.targetState + ' / new: ' + wrappedState + ' / action: zoom out  / zoom out btn: ' + $( '#zoom-controls' ).data( 'zoomOutBtn' ) );

	view.setState( wrappedState );
	view.updateURL();

}

SurfacingView.prototype.handleLoadCompleted = function( type ) {

	switch ( type ) {
	
		case 'places':
		break;
	
		case 'cables':
		break;
		
		case 'themes':
		this.initialized = true;
		this.visualization.setupThemes();
		this.visualization.setupCables();
		this.visualization.setupPlaces();
		this.perFrame();
		this.visualization.perFrame( true );
		
		//view.log( 'load completed' );
		
		/*var place;
		do {
			place = model.nonBranchPlaces[ Math.floor( Math.random() * model.nonBranchPlaces.length ) ];
		} while ( nonBranchPlaces.images.length == 0 );*/
		
		//view.log( 'random place: ' + place.getDisplayTitle() + ' with ' + place.images.length + ' images' );
		
		/*do {
			this.selectImage( place.images[ Math.floor( Math.random() * place.images.length ) ] );
		} while ( this.currentImage.stories == null );*/
		
		this.stories = new SurfacingStories();
		
		if ( !this.restoreContentFromURL() ) {
			//this.selectImage( scalarapi.getNode( 'media/makaha-manhole' ) );
			//this.selectImage( scalarapi.getNode( 'media/sumay-cable-station-plans' ) );
			//this.selectImage( scalarapi.getNode( 'media/bamfield-marine-sciences-center' ) );
			//this.selectImage( scalarapi.getNode( 'media/sans-souci-celebration' ) );
			this.selectImage( model.startingPoints[ Math.floor( Math.random() * model.startingPoints.length ) ] );
			view.updateURL();
		} else {
			this.hideSplash();
			this.update();
		}
		
		break;
		
	}

}

SurfacingView.prototype.restoreContentFromURL = function() {
		
	var theme, place, image, story, images, node, places;
	
	if ( this.initialized && !this.launchContentRestored ) {
			
		if ( getUrlParameter( 'view' ) != null ) {
		
		} else if ( getUrlParameter( 'theme' ) != null ) {
			node = scalarapi.getNode( getUrlParameter( 'theme' ) );
			if ( node != null ) {
				if ( model.themes.indexOf( node ) != -1 ) {
					if ( node.places != null ) {
						place = node.places[ Math.floor( Math.random() * node.places.length ) ];
						view.selectPlace( place );
					}
					view.selectTheme( node, true );
					//view.currentTheme = node;
					//view.stories.resetStories();
					//view.setState( ViewState.Theme );
					this.launchContentRestored = true;
				} else if ( model.places.indexOf( node ) != -1 ) {
					view.selectPlace( node );
					view.stories.resetStories();
					view.setState( ViewState.Theme );
					this.launchContentRestored = true;
				}
			}
			
		} else if ( getUrlParameter( 'map' ) != null ) {
			node = scalarapi.getNode( getUrlParameter( 'map' ) );
			if ( node != null ) {
				if ( model.places.indexOf( node ) != -1 ) {
					view.selectPlace( node );
					view.setState( ViewState.Map );
					this.launchContentRestored = true;
				} else if ( model.cables.indexOf( node ) != -1 ) {
					places = node.getRelatedNodes( 'path', 'outgoing' );
					if ( places.indexOf( view.currentPlace ) == -1 ) {
						place = places[ Math.floor( Math.random() * places.length ) ];
						view.selectPlace( place );
					}
					view.setState( ViewState.Map );
					view.selectCable( node );
					this.launchContentRestored = true;
				}
			}
			
		} else if ( getUrlParameter( 'place' ) != null ) {
			place = scalarapi.getNode( getUrlParameter( 'place' ) );
			if ( place != null ) {
				view.selectPlace( place );
				view.setState( ViewState.Place );
				this.launchContentRestored = true;
			}
			
		} else if ( getUrlParameter( 'image' ) != null ) {
			image = scalarapi.getNode( 'media/' + getUrlParameter( 'image' ) );
			if ( image != null ) {
				view.selectImage( image );
				view.setState( ViewState.Image );
				this.launchContentRestored = true;
			}
			
		} else if ( getUrlParameter( 'story' ) != null ) {
		
			// first check to see if the url is referencing an image; if so, then display its related story groups
			image = scalarapi.getNode( 'media/' + getUrlParameter( 'story' ) );
			if ( image != null ) {
				view.setState( ViewState.Story );
				view.selectImage( image );
				this.launchContentRestored = true;
				
			// if not, then see if it was referencing a story; if so, then open the story
			} else {
				story = scalarapi.getNode( getUrlParameter( 'story' ) );
				if ( story != null ) {
					images = story.getRelatedNodes( 'annotation', 'outgoing' );
					view.setState( ViewState.Story );
					view.selectImage( images[ Math.floor( Math.random() * images.length ) ] );
					view.stories.showStory( story.slug );
					this.launchContentRestored = true;
				}
			}
		}
		
	}
	
	return this.launchContentRestored;
}

SurfacingView.prototype.showSplash = function() {
	$( '#chips' ).hide();
	$( '#zoom-controls' ).hide();
	$( '#splash-container' ).show();
}

SurfacingView.prototype.hideSplash = function() {
	$( '#chips' ).show();
	$( '#zoom-controls' ).show();
	$( '#splash-container' ).fadeOut();
}

SurfacingView.prototype.hideHelp = function() {
	$( '#help' ).fadeOut();
}

/**
 * Transitions to the specified state.
 */
SurfacingView.prototype.setState = function(state, forceReset) {

	//console.log( 'setState ' + state );

	//if ((this.targetState != state) || forceReset) {
		
		//$( '#message-box' ).text( 'set state: ' + state );
		
		this.lastState = this.targetState;
		this.targetState = state;
		this.hasBeenDragged = false;
		this.update();
	//}

}
// Possible macro states of the view
var ViewState = {
	Title: 0,
	Theme: 5,
	Map: 4,
	Place: 3,
	Image: 2,
	Story: 1
};

// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/

SurfacingView.prototype.update = function() {
	
	this.getRelatedNodes();
	
	this.visualization.update();
	if ( this.stories != null ) {
		this.stories.update();
	}
	
	switch ( this.targetState ) {
	
		case ViewState.Title:
		$( "#zoom-controls div:first-child" ).html( "&nbsp;<br>&nbsp;" );
		$( "#zoom-controls div:last-child" ).html( "&nbsp;<br>&nbsp;" );
		break;
	
		case ViewState.Theme:
		$( "#zoom-controls div:first-child" ).text( "Zoom to map" );
		$( "#zoom-controls div:last-child" ).text( "Zoom to story" );
		break;
	
		case ViewState.Map:
		$( "#zoom-controls div:first-child" ).text( "Zoom to place" );
		$( "#zoom-controls div:last-child" ).text( "Zoom to theme" );
		break;
	
		case ViewState.Place:
		$( "#zoom-controls div:first-child" ).text( "Zoom to image" );
		$( "#zoom-controls div:last-child" ).text( "Zoom to map" );
		break;
	
		case ViewState.Image:
		$( "#zoom-controls div:first-child" ).text( "Zoom to story" );
		$( "#zoom-controls div:last-child" ).text( "Zoom to place" );
		break;
	
		case ViewState.Story:
		$( "#zoom-controls div:first-child" ).text( "Zoom to theme" );
		$( "#zoom-controls div:last-child" ).text( "Zoom to image" );
		break;
	
	}

	switch ( this.targetState ) {

		case ViewState.Image:
		// no image or no stories for image: no zoom to story
		if (( this.currentImage == null ) || ( this.currentImage.stories.length == 0 )) {
			$( '#top-zoom-btn' ).attr( 'src', 'images/empty_btn_top.png' );
			$( "#zoom-controls div:first-child" ).html( "&nbsp;<br>&nbsp;" );

		} else {
			$( '#top-zoom-btn' ).attr( 'src', 'images/minus_btn_top.png' );
		}
		$( '#bottom-zoom-btn' ).attr( 'src', 'images/minus_btn_bottom.png' );
		break;

		case ViewState.Place:
		// no images for place: no zoom to image
		if ( this.currentPlace.images.length == 0 ) {
			$( '#top-zoom-btn' ).attr( 'src', 'images/empty_btn_top.png' );
			$( "#zoom-controls div:first-child" ).html( "&nbsp;<br>&nbsp;" );
		} else {
			$( '#top-zoom-btn' ).attr( 'src', 'images/plus_btn_top.png' );
		}
		$( '#bottom-zoom-btn' ).attr( 'src', 'images/minus_btn_bottom.png' );
		break;

		case ViewState.Map:
		// no themes for place: no zoom to theme
		if ( model.getThemesForPlace( this.currentPlace ).length == 0 ) {
			$( '#bottom-zoom-btn' ).attr( 'src', 'images/empty_btn_bottom.png' );
			$( "#zoom-controls div:nth-child(4)" ).html( "&nbsp;<br>&nbsp;" );
		} else {
			$( '#bottom-zoom-btn' ).attr( 'src', 'images/minus_btn_bottom.png' );
		}
		$( '#top-zoom-btn' ).attr( 'src', 'images/plus_btn_top.png' );
		break;

		case ViewState.Story:
		// no themes for place: no zoom to theme
		if ( model.getThemesForPlace( this.currentPlace ).length == 0 ) {
			$( '#top-zoom-btn' ).attr( 'src', 'images/empty_btn_top.png' );
			$( "#zoom-controls div:first-child" ).html( "&nbsp;<br>&nbsp;" );
		} else {
			$( '#top-zoom-btn' ).attr( 'src', 'images/minus_btn_top.png' );
		}
		$( '#bottom-zoom-btn' ).attr( 'src', 'images/plus_btn_bottom.png' );
		break;

		case ViewState.Theme:
		// no selected theme: no zoom to story
		if ( this.currentTheme == null ) {
			$( '#bottom-zoom-btn' ).attr( 'src', 'images/empty_btn_bottom.png' );
			$( "#zoom-controls div:nth-child(4)" ).html( "&nbsp;<br>&nbsp;" );
		} else {
			$( '#bottom-zoom-btn' ).attr( 'src', 'images/plus_btn_bottom.png' );
		}
		$( '#top-zoom-btn' ).attr( 'src', 'images/plus_btn_top.png' );
		break;

		default:
		$( '#top-zoom-btn' ).attr( 'src', 'images/plus_btn_top.png' );
		$( '#bottom-zoom-btn' ).attr( 'src', 'images/minus_btn_bottom.png' );
		break;

	}

}

SurfacingView.prototype.updateURL = function() {

	//console.log( 'updateURL ' + this.targetState );

	var i, n, viewStr, temp, slug, title, item;
	
	switch ( this.targetState ) {
	
		case ViewState.Title:
		viewStr = 'view';
		slug = 'title';
		title = 'Introduction';
		break;
	
		case ViewState.Theme:
		viewStr = 'theme';
		if ( view.currentTheme != null ) {
			slug = view.currentTheme.slug;
			title = view.currentTheme.getDisplayTitle();
		} else if ( view.currentPlace != null ) {
			slug = view.currentPlace.slug;
			title = view.currentPlace.getDisplayTitle();
		}
		break;
	
		case ViewState.Map:
		viewStr = 'map';
		if ( view.currentCable != null ) {
			slug = view.currentCable.slug;
			if ( view.currentCable.cableGroup == null ) {
				title = view.currentCable.getDisplayTitle();
			} else {
				title = view.currentCable.cableGroup.getDisplayTitle();
			}
		} else if ( view.currentPlace != null ) {
			slug = view.currentPlace.slug;
			title = view.currentPlace.getDisplayTitle();
		}
		break;
	
		case ViewState.Place:
		viewStr = 'place';
		if ( view.currentPlace != null ) {
			slug = view.currentPlace.slug;
			title = view.currentPlace.getDisplayTitle();
		}
		break;
	
		case ViewState.Image:
		viewStr = 'image';
		if ( view.currentImage != null ) {
			temp = view.currentImage.slug.split( 'media/' );
			slug = temp[ temp.length - 1 ];
			title = view.currentImage.getDisplayTitle();
		}
		break;
	
		case ViewState.Story:
		viewStr = 'story';
		
		// if a story was just opened, use it in the URL
		if ( view.stories.lastOpenedStory != null ) {
			slug = view.stories.lastOpenedStory.slug;
			title = view.stories.lastOpenedStory.getDisplayTitle();
			
		// otherwise, use the selected image
		} else if ( view.currentImage != null ) {
			temp = view.currentImage.slug.split( 'media/' );
			slug = temp[ temp.length - 1 ];
			title = view.currentImage.getDisplayTitle();
		}
		break;
	
	}

	if ( viewStr != null ) {
		History.pushState( { state: viewStr, source: 'app' }, 'Surfacing: ' + title, '?' + viewStr + '=' + slug );
	}

}


SurfacingView.prototype.selectImage = function( image ) {

	if ( image != null ) {

		var i, n, nodes, node;

		view.currentImage = image;
		view.currentPlace = image.places[ 0 ];
		
		view.currentCable = null;
		
		view.findLocalCables();
		
		if ( this.currentPlace != null ) {
			view.visualization.rotateTo( [ this.currentPlace.longitude + this.currentImage.angleOffset[ 0 ], this.currentPlace.latitude + this.currentImage.angleOffset[ 1 ] ], null, function() {
				view.setImageAsBackground( view.currentImage );
			} );
		}
		
		if ( view.stories != null ) {
			view.stories.resetStories();
		}

		view.update();
	}

}

SurfacingView.prototype.setImageAsBackground = function( image ) {
	if ( image != null ) {
		var url = image.current.sourceFile;
		//var temp = image.current.sourceFile.split( 'media' );
		//var url = temp.join( 'media/medium' ); // this is the real deal
		//var url = 'media' + temp[ temp.length - 1 ]; // this is temporary for local images
		//view.log( encodeURI(url) );
		$( '#background' ).css( 'background-image', 'url(' + encodeURI(url) + ')' );
	} else {
		$( '#background' ).css( 'background-image', 'none' );
	}
}

SurfacingView.prototype.selectPlace = function( place ) {

	console.log( 'selectPlace ' + place.getDisplayTitle() );

	view.currentPlace = place;
	view.currentImage = place.images[ Math.floor( Math.random() * place.images.length ) ];
	view.setImageAsBackground( view.currentImage );
	
	view.currentCable = null;
	view.currentTheme = null;
	
	view.findLocalCables();
	
	var angleOffset
	if ( view.currentImage == null ) {
		angleOffset = [ 0, 0 ];
	} else {
		angleOffset = this.currentImage.angleOffset;
	}
	//alert( ( this.currentPlace.longitude + angleOffset[ 0 ] ) + ' ' + ( this.currentPlace.latitude + angleOffset[ 1 ] ) );
	
	view.visualization.rotateTo( [ this.currentPlace.longitude + angleOffset[ 0 ], this.currentPlace.latitude + angleOffset[ 1 ] ], null, function() {
		if ( view.currentImage != null ) {
			view.setImageAsBackground( view.currentImage );
		} else {
			view.setImageAsBackground( null );
		}
	} );
	
	if ( view.stories != null ) {
		view.stories.resetStories();
	}
	view.update();
	
}

SurfacingView.prototype.centerOnCurrentPlace = function( callback ) {

	if (( this.currentPlace != null ) && (( view.targetState == ViewState.Map ) || ( view.targetState == ViewState.Theme )) && view.hasBeenDragged ) {
	
		var angleOffset
		if ( view.currentImage == null ) {
			angleOffset = [ 0, 0 ];
		} else {
			angleOffset = this.currentImage.angleOffset;
		}

		view.visualization.rotateTo( [ this.currentPlace.longitude + angleOffset[ 0 ], this.currentPlace.latitude + angleOffset[ 1 ] ], null, callback );
	} else {
		callback();
	}

}

SurfacingView.prototype.selectCable = function( cable ) {

	//console.log( 'selectCable ' + cable.getDisplayTitle() );

	view.currentCable = cable;
	view.findLocalCables();
	view.update();
	view.updateURL();

}

SurfacingView.prototype.selectTheme = function( theme, setStateToTheme, ignoreEquality ) {

	//console.log( 'selectTheme ' + theme.getDisplayTitle() );

	if (( view.currentTheme != theme ) || ignoreEquality ) {
		view.currentTheme = theme;
		if ( setStateToTheme ) {
			view.setState( ViewState.Theme );
		}
		view.stories.resetStories();
		view.updateURL();
		view.update();
	}

}

SurfacingView.prototype.getRelatedNodes = function() {

	var i, n, node;
	
	this.relatedNodes = [];
	switch ( this.targetState ) {
	
		case ViewState.Image:
		if ( this.currentImage != null ) {
			//this.relatedNodes = this.relatedNodes.concat( this.currentImage.stories );
			this.relatedNodes = this.relatedNodes.concat( this.currentImage.places );
		}
		this.currentTheme = null;
		break;
		
		case ViewState.Map:
		//this.relatedNodes.push( this.currentPlace );
		//if ( this.currentCable == null ) {
			this.relatedNodes = this.relatedNodes.concat( this.currentPlace.localCables );
		/*} else {
			this.relatedNodes.push( this.currentCable );
		}*/
		this.currentTheme = null;
		break;
		
		case ViewState.Place:
		this.relatedNodes.push( this.currentPlace );
		this.currentTheme = null;
		break;
		
		case ViewState.Story:
		if ( this.currentImage != null ) {
			//this.relatedNodes = this.relatedNodes.concat( this.currentImage.stories );
			/*if ( this.currentTheme == null ) {
				this.setCurrentThemeFromImage( this.currentImage );
			}*/
		} else {
			this.currentTheme = null;
		}
		this.setCurrentStoryFromImage( this.currentImage );
		/*n = this.currentImage.stories.length;
		for ( i = 0; i < n; i++ ) {
			node = this.currentImage.stories[ i ];
			this.relatedNodes = this.relatedNodes.concat( node.themes );
		}*/
		break;
		
		case ViewState.Theme:
		if ( this.currentTheme == null ) {
			this.relatedNodes = this.relatedNodes.concat( this.currentPlace.themes );
			//this.setCurrentThemeFromImage( this.currentImage );
		/*} else {
			this.currentTheme = null;
		}*/
		} else /*if ( this.currentTheme != null )*/ {
			this.relatedNodes.push( this.currentTheme );
		}
		break;
	
	}
	
	/*console.log( 'view state ' + this.targetState );
	console.log( 'related...' );
	for ( i in this.relatedNodes ) {
		console.log( 'related: ' + this.relatedNodes[ i ].slug );
	}*/

}

SurfacingView.prototype.setCurrentThemeFromImage = function( image ) {

	var i, n, node, indexA;
	
	this.currentTheme = null;
	
	if ( image != null ) {
		n = image.stories.length;
		indexA = Math.floor( Math.random() * n );
		for ( i = 0; i < n; i++ ) {
			node = image.stories[ i ];
			this.relatedNodes = this.relatedNodes.concat( node.themes );
			if ( i == indexA ) {
				this.currentTheme = node.themes[ Math.floor( Math.random() * node.themes.length ) ];
			}
		}
	}
	
	//view.log( 'current theme: ' + this.currentTheme );

}

SurfacingView.prototype.setCurrentStoryFromImage = function( image ) {

	if ( image != null ) {
		if ( image.stories.length > 0 ) {
			if ( image.stories.indexOf( this.currentStory ) == -1 ) {
				//view.log( 'current story: ' + (( this.currentStory == null ) ? '' : this.currentStory.getDisplayTitle()) );
				this.currentStory = image.stories[ Math.floor( Math.random() * image.stories.length ) ];
			}
		} else {
			this.currentStory = null;
		}
	}
}

SurfacingView.prototype.findLocalCables = function( ) {
	
	var i, j, n, o, cable, place, sibling;
	
	if ( this.currentCable == null ) {
		var containerCables = [];
		if ( this.currentPlace != null ) {
			containerCables = this.currentPlace.getRelatedNodes( 'path', 'incoming' ); // does this get any other things besides cables?
		}
		this.localCables = [];
		n = containerCables.length;
		for ( i = 0; i < n; i++ ) {
			cable = containerCables[ i ];
			if ( cable.cableGroup != null ) {
				this.localCables = this.localCables.concat( cable.cableGroupSiblings );
			} else {
				this.localCables.push( cable );
			}
		}
	} else {
		if ( this.currentCable.cableGroup != null ) {
			this.localCables = this.currentCable.cableGroupSiblings.concat();
		} else {
			this.localCables = [ this.currentCable ];
		}
	}
	
	this.localCablePlaces = [];
	n = this.localCables.length;
	for ( i = 0; i < n; i++ ) {
		cable = this.localCables[ i ];
		places = [];
		if ( cable.cableGroup != null ) {
			o = cable.cableGroupSiblings.length;
			for ( j = 0; j < o; j++ ) {
				sibling = cable.cableGroupSiblings[ j ];
				places = places.concat( sibling.getRelatedNodes( 'path', 'outgoing' ) );
			}
		} else {
			places = cable.getRelatedNodes( 'path', 'outgoing' );
		}
		o = places.length;
		for ( j = 0; j < o; j++ ) {
			place = places[ j ];
			if ( this.localCablePlaces.indexOf( place ) == -1 ) {
				this.localCablePlaces.push( place );
			}
		}
	}

}

function SurfacingStories() {

	this.canvasWidth = window.innerWidth;
	this.canvasHeight = window.innerHeight;
	
	var color = d3.scale.category20();
	
	this.force = d3.layout.force()
	    .chargeDistance( Math.max( this.canvasWidth, this.canvasHeight ) )
	    .charge( -400 )
	    .linkDistance( 300 )
	    .friction( 0.5 )
	    .size( [ this.canvasWidth, this.canvasHeight ] );

	/*this.svg = d3.select( "body" ).append( "svg" )
		.attr( 'id', 'stories-view' )
	    .attr( "width", this.canvasWidth )
	    .attr( "height", this.canvasHeight )
	    .style( 'position', 'absolute' )
	    .style( 'left', '0' )
	    .style( 'top', '0' );*/
	    
	this.canvas = d3.select( 'body' );
	    
	this.nodeElements = this.canvas.selectAll( '.item' );
	this.linkElement = this.canvas.selectAll( '.link' );
	
	this.force.on( 'tick', function() {
	
		d3.selectAll( '.item' )
			.style( 'left', function( d ) { return d.x+'px'; } )
			.style( 'top', function( d ) { return d.y+'px'; } );
			
		d3.selectAll( '.image-item' )
			.style( 'opacity', function ( d ) {
				var targetOpacity;
				
				if ( d.opacity == null ) {
					d.opacity = parseFloat( $( this ).css( 'opacity' ) );
				}
	
				var i, story, targetStoryItem,
					oneStoryIsOpen = false,
					allStoryItemsAreOpen = true,
					allStoriesAdded = true,
					n = d.node.stories.length;
					
				//console.log( '----' );
				for ( i = 0; i < n; i++ ) {
					story = d.node.stories[ i ];
					//console.log( story.getDisplayTitle() + ' index = ' + view.stories.storyInventory.indexOf( story ) );
					if ( view.stories.storyInventory.indexOf( story ) == -1 ) {
						allStoriesAdded = false;
						break;
					}
					targetStoryItem = view.stories.getStoryItemForStory( story, view.stories.storyItems );
					if ( targetStoryItem != null ) {
						if ( targetStoryItem.isOpen ) {
							oneStoryIsOpen = true;
							break;
						}
						/*if ( !targetStoryItem.isOpen || ( targetStoryItem.node != story ) ) {
							allStoryItemsAreOpen = false;
						} else {
							oneStoryIsOpen = true;
							break;
						}*/
					}
				}
				
				//console.log( 'image: ' + d.node.getDisplayTitle() + ' stories added? ' + allStoriesAdded );
				/*console.log( d.node );
				console.log( 'one story is open: ' + oneStoryIsOpen );*/
				
				if ( allStoriesAdded ) {
					//if ( oneStoryIsOpen ) {
						targetOpacity = 1.0;
					/*} else {
						targetOpacity = 0.66;
					}*/
					/*if ( !d.hasBeenViewed ) {
						d.hasBeenViewed = true;
					}*/
				} else {
					/*if ( !d.hasBeenViewed && ( d.node != view.currentImage )) {
						targetOpacity = 0.0;
					} else {*/
						targetOpacity = 0.33;
					//}
				}
				d.opacity += ( targetOpacity - d.opacity ) * .1;
				return d.opacity;
			} )
			.style( '-webkit-transform', function( d ) {
				var scale;
				if ( d.oneStoryIsOpen ) {
					var scale = 0.5 + ( d.opacity * .5 );
				} else {
					var scale = 0.25 + ( d.opacity * .5 );
				}
				if ( d.scale == null ) {
					d.scale = scale;
				} else {
					d.scale += ( scale - d.scale ) * .1;
				}
				return 'scale( ' + d.scale + ',  ' + d.scale + ' )';
			} );
			
	});
	
	this.items = [];
				
	// this is a temporary fix until FTP access is restored
	//this.localThumbnails = ["1900MainLineSchematicMG4071.jpg", "Balikpapan_5426-2.jpg", "BaltimoreCableTankIMGL1255.jpg", "BaltimoreHomeportIMGL1180.jpg", "BaltimoreSplicingTableIMGL1143.jpg", "BaltimoreSupervisorySystemsIMGL1201.jpg", "BandjarmasinHarbor19081920compiled.jpg", "BanjoewangieInstrumentRoomImage054.jpg", "Belitung_10007213.jpg", "BoninIslandsIMG6994.jpg", "BroomeNativesIMG6364.jpg", "BusanCLS.jpg", "CapeStJamesStationIMGL2648.jpg", "CheratingStation.jpg", "ChikuraBeach.jpg", "ChikuraSign.jpg", "ChongmingRoad.jpg", "ChongmingWetlands.jpg", "ChumHongKokStationIMGL2200.jpg", "ColomboPostcard.jpg", "ColomboStreet1910.jpg", "ConDaoLandingIMGL2675.jpg", "ConDaoPrisonIMGL2739.jpg", "ConDaoPrisonIMGL2744.jpg", "DanangBridgeIMGL2425.jpg", "DanangCableStationIMGL2336.jpg", "DanangLandingPointIMGL2341.jpg", "DeepWaterBayStationInteriorIMGL2137.jpg", "DeepWaterBayViewIMGL2130.jpg", "EmiCoast.jpg", "FanningIslandAttackIMG6402.jpg", "FanningIslandEntry1926CableMapRelayIMG4176.jpg", "FoochowStationImage026.jpg", "FukuokaCityDestructionOctober1945.jpg", "HongKongStationIMGL2083.jpg", "HueLandingIMGL2481.jpg", "KeojeCableStation.jpg", "KitaibarakiEarthquakeDamage.jpg", "KitaibarakiLanding.jpg", "KitaibarakiMeditationRetreat.jpg", "KitakyushuJapan01s3SteelWorks.jpg", "LabuanMessVerandah1926image017.jpg", "LabuanTennisCourtimage018.jpg", "Macau-SS-1999.jpg", "MacauAirportIMGL2293.jpg", "MacauTelegraphLandingIMGL2238.jpg", "MadrasIndiaIOCOMFDC.jpg", "ManilaInstrumentRoomImage034.jpg", "MaruyamaRosemaryPark.jpg", "MaruyamaWindmill.jpg", "MatrixSingaporeLanding.jpg", "MauritiusCableLandingimage041.jpg", "MelakaTour.jpg", "MiuraBeach.jpg", "MiyazakiTower.jpg", "MogiNagasaki32921045.jpg", "NinomiyaHokusaiPrint.jpg", "PalauAirstrikeWWII1944.jpg", "PalauCableChartIMG5215.jpg", "PantaiMutiaraJakartastation.jpg", "PenangCableWarning.jpg", "PenangSingaporeCableBite.jpg", "PenangStaffQuarters1921image014.jpg", "PenangTerrestrialRouteIMG6566.jpg", "PerthInternationalTelecommunications.jpg", "PhetchaburiStation.jpg", "PiracyTestFiring.jpg", "QingdaoOlympics.jpg", "ReihokuCoalPlant73125048.jpg", "RodriguesOfficeImage043.jpg", "ShantouLanding.jpg", "ShimaBeach.jpg", "SihanoukvilleBeachIMGL2750.jpg", "SihanoukvillePortIMGL2795.jpg", "SingaporeCableDepotFactoryimage012.jpg", "SingaporeNauticalChartIMG5244.jpg", "SingaporeSeacomTerminalBuildingImage008.jpg", "SingaporeTennisParty1920image004.jpg", "SouthLantauBuildingIMGL1977.jpg", "SouthLantauLandingIMGL2046.jpg", "SouthLantauStationIMGL2034.jpg", "SouthLantauTempleIMGL2000.jpg", "Surabaya192030.jpg", "SuvaAucklandCableVoltageIMG6439.jpg", "TelegraphBayLandingIMGL2101.jpg", "TernateView1760.jpg", "TouchengHDD.jpg", "VungTauBeachIMGL2512.jpg", "VungTauStatueIMGL2585.jpg", "VungTauTowerIMGL2597.jpg", "WadaWhaleUtilization.jpg", "WeiHaiWeiScrapbookImage050.jpg", "WeiHaiWeiViewFromOfficeImage049.jpg", "YokohamaCustomHouse.jpg", "YokohamaEarthquake.jpg", "YokohamaWharf.jpg"];

}

SurfacingStories.prototype.canvasWidth = null;
SurfacingStories.prototype.canvasHeight = null;
SurfacingStories.prototype.canvas = null;
SurfacingStories.prototype.force = null;
SurfacingStories.prototype.nodeElements = null;
SurfacingStories.prototype.linkElements = null;
SurfacingStories.prototype.items = null;
SurfacingStories.prototype.links = null;
SurfacingStories.prototype.imageInventory = null;
SurfacingStories.prototype.storyItems = null;
SurfacingStories.prototype.storyGroupInventory = null;
SurfacingStories.prototype.storyInventory = null;
SurfacingStories.prototype.imageItems = null;
SurfacingStories.prototype.lastOpenedStory = null;

SurfacingStories.prototype.update = function() {

	var me = this;
	
	if (( view.targetState == ViewState.Story ) || ( view.targetState == ViewState.Image ) || ( view.targetState == ViewState.Theme )) {

		// persist current data unless reset
		if ( this.items.length == 0 ) {
		
			var i, j, k, n, o, p, story, stories, storyGroup, images, image, storyItem, storyGroupSiblings,
				imageItem, themeItem, item;
			
			this.storyItems = [],
			this.imageItems = [];
			this.themeItems = [];
			this.links = [];
				
			// these allow us to quickly see if a particular story group, story, or image is being tracked
			// since the arrays above wrap the raw objects inside other objects
			this.storyGroupInventory = [];
			this.storyInventory = [];
			this.imageInventory = [];
			this.themeInventory = [];
			
			if ( view.targetState == ViewState.Theme ) {

				if ( view.currentTheme != null ) {
				
					// add all the stories that annotate the current image
					n = view.currentTheme.stories.length;
					for ( i = 0; i < n; i++ ) {
						story = view.currentTheme.stories[ i ];
						storyGroup = model.getStoryGroupFromStory( story );
						if ( this.storyGroupInventory.indexOf( story ) == -1 ) {
							this.storyItems.push( {
								'name': story.getDisplayTitle(),
								'node': story,
								'type': 'story',
								'isOpen': false,
								'isSibling': false
							} );
							this.storyGroupInventory.push( storyGroup );
							this.storyInventory.push( story );
						}
					}
				}
				
				this.items = this.storyItems.concat();
				
			} else {
				
				if ( view.currentImage != null ) {
				
					// add all the stories that annotate the current image
					n = view.currentImage.stories.length;
					for ( i = 0; i < n; i++ ) {
						story = view.currentImage.stories[ i ];
						storyGroup = model.getStoryGroupFromStory( story );
						if ( this.storyGroupInventory.indexOf( story ) == -1 ) {
							this.storyItems.push( {
								'name': story.getDisplayTitle(),
								'node': story,
								'type': 'story',
								'isOpen': false,
								'isSibling': false
							} );
							this.storyGroupInventory.push( storyGroup );
							this.storyInventory.push( story );
						}
					}
				}
				
				n = this.storyItems.length;
				for ( i = 0; i < n; i++ ) {
				
					storyItem = this.storyItems[ i ];
					
					// add all of the additional images annotated by each of the current image's stories
					this.addImagesForStory( storyItem.node, storyItem, this.imageItems, this.imageInventory );
					
					// add all of the themes linked to the current story
					this.addThemesForStory( storyItem.node, storyItem, this.themeItems, this.themeInventory );
					
					/*stories = storyItem.node.getStoryGroupSiblingsFromStory( storyItem.node );
					o = stories.length;
					for ( j = 0; j < o; j++ ) {
						story = stories[ j ];
						storyItems.push( {
							'name': model.getStoryGroupTitleFromStory( story ),
							'node': story,
							'type': 'story',
							'isOpen': false,
							'isSibling': true
						} );
					}*/
					
					// add all of the images annotated by each story's siblings within its story group
					storyGroupSiblings = model.getStoryGroupSiblingsFromStory( storyItem.node );
					o = storyGroupSiblings.length;
					for ( j = 0; j < o; j++ ) {
						story = storyGroupSiblings[ j ];
						this.addImagesForStory( story, storyItem, this.imageItems, this.imageInventory );
					}				
				}
			
				this.items = this.storyItems.concat( this.imageItems );
				this.items = this.items.concat( this.themeItems );
			}
			
		} else {
		
			if ( view.targetState != ViewState.Theme ) {
				n = this.storyItems.length;
				for ( i = 0; i < n; i++ ) {
					storyItem = this.storyItems[ i ];
					if ( this.items.indexOf( storyItem ) == -1 ) {
						this.items.push( storyItem );
					}
					this.addImagesForStory( storyItem.node, storyItem, this.imageItems, this.imageInventory );
					this.addThemesForStory( storyItem.node, storyItem, this.themeItems, this.themeInventory );
				}
				
				n = this.imageItems.length;
				for ( i = 0; i < n; i++ ) {
					imageItem = this.imageItems[ i ];
					if ( this.items.indexOf( imageItem ) == -1 ) {
						this.items.push( imageItem );
					}
				}
			
				n = this.themeItems.length;
				for ( i = 0; i < n; i++ ) {
					themeItem = this.themeItems[ i ];
					if ( this.items.indexOf( themeItem ) == -1 ) {
						this.items.push( themeItem );
					}
				}
			}
		
		}

		n = this.items.length;
		for ( i = 0; i < n; i++ ) {
			item = this.items[ i ];
			if ( item.x == null ) {
				item.x = this.canvasWidth * .5;
				item.y = this.canvasHeight * .5;
			}
		}
		
		//view.log( this.storyItems.length + ' story items, ' + this.imageItems.length + ' image items, ' + this.themeItems.length + ' theme items' );

		/*console.log( "ITEMS" );
		n = this.items.length;
		for ( i = 0 ; i < n; i++ ) {
			console.log( this.items[ i ].name );
			console.log( this.items[ i ] );
		}

		console.log( "LINKS" );
		n = this.links.length;
		for ( i = 0 ; i < n; i++ ) {
			console.log( this.links[ i ].source.name + " to " + this.links[ i ].target.name );
			console.log( this.links[ i ].target );
		}*/

		this.force.nodes( this.items )
			.links( this.links )
			.linkDistance( 300 )
			.linkStrength( 0.5 )
			.start();

		this.nodeElements = this.canvas.selectAll( '.item' ).data( this.items, function( d ) { return d.node.slug; } );

		this.nodeElements.exit().remove();

		var nodeEnter = this.nodeElements.enter();
		
		/*console.log( '----------' );
		console.log( 'UPDATE' );
		console.log( this.nodeElements );
		console.log( 'ENTER' );
		console.log( nodeEnter );*/
					
		var divs = nodeEnter.append( 'div' );
		
		var startStoryDrag;
		var startStoryPos;
		var endStoryPos;
		
		// this alternate drag behavior allows extremely brief drag motions to be registered
		// as clicks, which helps the floating elements feel more responsive
		var storyDrag = d3.behavior.drag()
			.origin( function(d) { return d; } )
			.on( "dragstart", function( d ) {
				d3.event.sourceEvent.stopPropagation(); // silence other listeners
				d.fixed |= 2; // set bit 2
				startStoryDrag = new Date().getTime();
				startStoryPos = null;
			})
			.on( "drag", function( d ) {
				d.px = d3.event.x, d.py = d3.event.y;
 				if ( startStoryPos == null ) {
 					startStoryPos = { x: d3.event.x, y: d3.event.y };
 				} else {
  					endStoryPos = { x: d3.event.x, y: d3.event.y };
				}
   				me.force.resume(); // restart annealing
			})
			.on( "dragend", function( d ) {
				d.fixed &= ~6; // unset bits 2 and 3
				if (( endStoryPos != null ) && ( startStoryPos != null )) {
					var dur = new Date().getTime() - startStoryDrag;
					var dist = Math.sqrt( Math.pow( endStoryPos.x - startStoryPos.x, 2 ), Math.pow( endStoryPos.y - startStoryPos.y, 2 ) );
					if (( dur < 200 ) && ( dist < 40 )) {
						handleStoryClick( d );
					}
				} else {
					handleStoryClick( d );
				}
			});
			
		function handleStoryClick( d ) {
			//console.log( 'clicked on ' + d.name + ' at index ' + i + ' or ' + view.stories.items.indexOf( d ) );
			if ( d3.event.defaultPrevented ) return;
			if ( !d.isOpen ) {
				view.stories.closeAllStories();
				d.isOpen = !d.isOpen; 
				//view.stories.updateStories();
				view.stories.force.alpha( 0.1 );
				view.stories.lastOpenedStory = d.node;
				view.stories.addStoryGroupSiblings( model.getStoryGroupFromStory( d.node ) );
				if ( view.targetState != ViewState.Story ) {
					var story = d.node;
					view.stories.resetStories();
					view.setState( ViewState.Story );
					var images = d.node.getRelatedNodes( 'annotation', 'outgoing' );
					if ( images.indexOf( view.currentImage ) == -1 ) {
						console.log( images );
						view.selectImage( images[ Math.floor( Math.random() * images.length ) ] );
					}
					view.currentTheme = null;
					view.stories.showStory( story.slug );
					view.stories.update(); // this shouldn't be necessary, but it is to get themes to show up
				} else {
					view.stories.update();
				}
				view.updateURL();
			} else {
				d.isOpen = !d.isOpen; 
				view.stories.updateStories();
				view.stories.force.alpha( 0.1 );
				view.stories.lastOpenedStory = null;
			}
			if ( d3.event.preventDefault != null ) {
				d3.event.preventDefault();
			}
			me.force.resume();
		}
		
		// create the story boxes
		divs.filter( function( d ) { /*console.log( d.name + ' ' + d.type );*/ return d.type == 'story'; } )
			.attr( 'class', 'item story-item' )
			//.call( this.force.drag )
			.call( storyDrag )
			.style( 'opacity', '1.0' )
			/*.on( 'click', handleStoryClick )*/;
			
		// left over items aren't getting cleared out
			
		// create the images
		divs.filter( function( d ) { return d.type == 'image'; } )
			.attr( 'class', 'item image-item' )
			.call( this.force.drag )
			/*.style( 'opacity', '1.0' )*/;
		
		var startThemeDrag;
		var startThemePos;
		var endThemePos;
		
		var themeDrag = d3.behavior.drag()
			.origin( function(d) { return d; } )
			.on( "dragstart", function( d ) {
				d3.event.sourceEvent.stopPropagation(); // silence other listeners
				d.fixed |= 2; // set bit 2
				startThemeDrag = new Date().getTime();
				startThemePos = null;
			})
			.on( "drag", function( d ) {
				d.px = d3.event.x, d.py = d3.event.y;
				//view.log( "drag" );
				//view.log( startThemePos );
 				if ( startThemePos == null ) {
 					startThemePos = { x: d3.event.x, y: d3.event.y };
 				} else {
 					//view.log( "end theme" );
  					endThemePos = { x: d3.event.x, y: d3.event.y };
				}
   				me.force.resume(); // restart annealing
			})
			.on( "dragend", function( d, i ) {
				d.fixed &= ~6; // unset bits 2 and 3
				if (( endThemePos != null ) && ( startThemePos != null )) {
					var dur = new Date().getTime() - startThemeDrag;
					var dist = Math.sqrt( Math.pow( endThemePos.x - startThemePos.x, 2 ), Math.pow( endThemePos.y - startThemePos.y, 2 ) );
					if (( dur < 200 ) && ( dist < 40 )) {
						handleThemeClick( d, i );
					}
				} else {
					handleThemeClick( d, i );
				}
			});

		function handleThemeClick( d, i ) {
			if ( d3.event.defaultPrevented ) return;
			if ( d.parentNode != null ) {
				var images = d.parentNode.getRelatedNodes( 'annotation', 'outgoing' );
				if ( images.indexOf( view.currentImage ) == -1 ) {
					if ( model.getThemesForPlace( view.currentImage.places[ 0 ] ).indexOf( d.node ) == -1 ) {
						view.selectImage( images[ Math.floor( Math.random() * images.length ) ] );
					}
				}
			}
			view.selectTheme( d.node, true, true );
			/*view.currentTheme = d.node;
			view.stories.resetStories();*/
			//view.setState( ViewState.Theme );	
			me.force.resume();		
		}
			
		// create the themes
		divs.filter( function( d ) { /*console.log( d.name + ' ' + d.type );*/ return d.type == 'theme'; } )
			.attr( 'class', 'item theme-item' )
			.call( themeDrag )
			.on( "click", handleThemeClick )
			/*.on( 'click', function( d, i ) {
				//console.log( d3.event );
				if ( d3.event.defaultPrevented ) return;
				var images = d.parentNode.getRelatedNodes( 'annotation', 'outgoing' );
				if ( images.indexOf( view.currentImage ) == -1 ) {
					if ( model.getThemesForPlace( view.currentImage.places[ 0 ] ).indexOf( d.node ) == -1 ) {
						view.selectImage( images[ Math.floor( Math.random() * images.length ) ] );
					}
				}
				view.selectTheme( d.node, true );
			} )*/;

		this.updateStories();
		
		if (( view.targetState == ViewState.Image ) || ( view.targetState == ViewState.Theme )) {
			$( '.story-item' ).show();
			$( '.image-item' ).hide();
			$( '.theme-item' ).hide();
		} else {
			$( '.item' ).show();
		}
		
	} else {
		this.force.stop();
		$( '.item' ).hide();
	}
	
	/*n = this.storyInventory.length;
	var storyText = '';
	for ( i = 0; i < n; i++ ) {
		storyText += this.storyInventory[ i ].getDisplayTitle() + ' ';
	}
	console.log( 'story inventory: ' + storyText );*/

}

SurfacingStories.prototype.addImagesForStory = function( story, storyItem, imageItems, imageInventory ) {

	//console.log( 'addImagesForStory ' + story.getDisplayTitle() );

	var i, n, image, item, inventoryIndex,
		images = story.getRelatedNodes( 'annotation', 'outgoing' );
	n = images.length;
	
	//console.log( story.getDisplayTitle() + ' has ' + n + ' images' );
	
	for ( i = 0; i < n; i++ ) {
		image = images[ i ];
		item = this.getImageItemForImage( image, imageItems );
		/*if ( item != null ) {
			if ( item.parent != storyItem ) {
				imageItems.push( {
					'name': image.getDisplayTitle(),
					'node': image,
					'type': 'image',
					'isOpen': false,
					'parent': storyItem,
					'parentNode': story,
					'hasBeenViewed': false
				} );
				imageInventory.push ( image );
			}
		} else {*/
		if ( item == null ) {
			item = {
				'name': image.getDisplayTitle(),
				'node': image,
				'type': 'image',
				'isOpen': false,
				'parent': storyItem,
				'parentNode': story,
				'hasBeenViewed': false
			}
			imageItems.push( item );
			imageInventory.push ( image );
		}
		this.links.push( {
			source: storyItem,
			target: item
		} );
	}

}

SurfacingStories.prototype.addThemesForStory = function( story, storyItem, themeItems, themeInventory ) {

	//console.log( 'addThemesForStory ' + story.getDisplayTitle() );

	var i, n, theme, item, inventoryIndex,
		themes = story.themes;
	n = themes.length;
	
	//console.log( story.getDisplayTitle() + ' has ' + n + ' images' );
	
	for ( i = 0; i < n; i++ ) {
		theme = themes[ i ];
		item = this.getThemeItemForTheme( theme, themeItems );
		/*if ( item != null ) {
			if ( item.parent != storyItem ) {
				imageItems.push( {
					'name': image.getDisplayTitle(),
					'node': image,
					'type': 'image',
					'isOpen': false,
					'parent': storyItem,
					'parentNode': story,
					'hasBeenViewed': false
				} );
				imageInventory.push ( image );
			}
		} else {*/
		if ( item == null ) {
			item = {
				'name': theme.getDisplayTitle(),
				'node': theme,
				'type': 'theme',
				'parent': storyItem,
				'parentNode': story
			}
			themeItems.push( item );
			themeInventory.push ( theme );
		}
		this.links.push( {
			source: storyItem,
			target: item
		} );
	}

}

SurfacingStories.prototype.getImageItemForImage = function( image, imageItems ) {

	var i, n, item;
	
	n = imageItems.length;
	for ( i = 0; i < n; i++ ) {
		item = imageItems[ i ];
		if ( item.node == image ) {
			return item;
		}
	}
	
	return null;
}

SurfacingStories.prototype.getThemeItemForTheme = function( theme, themeItems ) {

	var i, n, item;
	
	n = themeItems.length;
	for ( i = 0; i < n; i++ ) {
		item = themeItems[ i ];
		if ( item.node == theme ) {
			return item;
		}
	}
	
	return null;
}

SurfacingStories.prototype.getStoryItemForStory = function( story, storyItems ) {

	var i, n, item/*, storyGroup, stories*/;
	
	//storyGroup = model.getStoryGroupFromStory( story );
	//stories = storyGroup.getRelatedNodes( 'tag', 'outgoing' );
	
	//if ( storyGroup != null ) {
		n = storyItems.length;
		for ( i = 0; i < n; i++ ) {
			item = storyItems[ i ];
			if ( item.node == story ) {
				return item;
			}
			/*if ( stories.indexOf( item.node ) != -1 ) {
				return item;
			}*/
		}
	//}
	
	return null;
}

SurfacingStories.prototype.resetStories = function() {

	//console.log( 'resetStories' );

	this.items = [];
	this.nodeElements
		.classed( { 'story-item': false, 'image-item': false, 'theme-item': false, 'item': true } )
		/*.on( '.drag', null )*/;
	
}

SurfacingStories.prototype.updateStories = function() {

	//console.log( 'updateStories' );

	this.nodeElements.filter( function( d ) { return d.type == 'story'; } )
		.attr( 'class', 'item story-item' )
		.html( function( d, i ) {
			var content = '',
				index = view.stories.items.indexOf( d );
			if ( d.isOpen ) {
				content += '<h1>' + d.name + '&nbsp;<img src="images/arrow_dn_blk.png" title="Down arrow"/></h1>';
				content += '<div class="desc">' + d.node.current.content + '</div>';
				/*var siblings = model.getStoryGroupSiblingsFromStory( d.node );
				if ( siblings.length > 0 ) {
					for ( var j in siblings ) {
						//view.log( 'sibling: ' + siblings[ j ].slug + ' at index: ' + index );
						content += '<p><a href="javascript:view.stories.showStory(\'' + siblings[ j ].slug + '\', ' + index + ');">More about ' + d.name + '</a><a style="float: right;" href="javascript:view.stories.closeStoryAtIndex(' + index + ');">Close</a></p>';
					}
				} else {
					content += '<p><a style="float: right;" href="javascript:view.stories.closeStoryAtIndex(' + index + ');">Close</a></p>';
				}*/
			} else {
				content += '<h1>' + d.name + '&nbsp;<img src="images/arrow_rt_blk.png" title="Right arrow"/></h1>';
			}
			return content;
		} )
		.style( 'opacity', '1.0' )
		.style( '-webkit-transform', 'scale( 1.0, 1.0 )' );

	this.nodeElements.filter( function( d ) { return d.type == 'theme'; } )
		.attr( 'class', 'item theme-item' )
		.html( function( d, i ) {
			return d.name;
		} )
		/*.style( 'opacity', '0.5' )*/;
		
	this.nodeElements.filter( function( d ) { return d.type == 'image'; } )
		.attr( 'class', function( d ) {
			var i, story, targetStoryItem, classStr,
				n = d.node.stories.length;
			d.oneStoryIsOpen = false;
			for ( i = 0; i < n; i++ ) {
				story = d.node.stories[ i ];
				targetStoryItem = view.stories.getStoryItemForStory( story, view.stories.storyItems );
				if ( targetStoryItem != null ) {
					if ( targetStoryItem.isOpen ) {
						d.oneStoryIsOpen = true;
						break;
					}
				}
			}
			classStr = 'item image-item';
			if ( d.oneStoryIsOpen ) {
				classStr += ' highlighted';
			}
			return classStr;
		} )
		.html( function( d, i ) {
			var content = '',
				temp = d.node.current.sourceFile.split( 'media/' );
				// this is a temporary fix until FTP access is restored
				/*if ( view.stories.localThumbnails.indexOf( temp[ temp.length - 1 ] ) != -1 ) {
					url = "thumbnails/" + temp[ temp.length - 1 ];
				} else {*/
					url = temp.join( 'media/thumbnails/' ); // this is how we should be doing it
				//}
				imageItemIndex = view.stories.imageItems.indexOf( d ),
				storyItemIndex = view.stories.storyItems.indexOf( d.parent );
			content += '<a href="javascript:view.stories.handleImageClick(\'' + d.parentNode.slug + '\', ' + imageItemIndex + ', ' + storyItemIndex + ');"><img src="' + url + '"/></a>';
			//console.log( 'self: ' + d.node.slug + ' parent: ' + d.parent.node.slug + ' parent node: ' + d.parentNode.slug );
			return content;
		} );
		
	/*this.nodeElements.enter()
		.style( 'opacity', '0.0' );*/

}

SurfacingStories.prototype.handleImageClick = function( slug, imageItemIndex, storyItemIndex ) {

	var i, n, sibling, storyGroups, storyGroup, story, stories, targetStoryItem, 
		allStoryItemsAreOpen = true,
		allStoriesAdded = true,
		oneStoryIsOpen = false;
		addCount = 0;
	
	var storyItem = this.storyItems[ storyItemIndex ];
	var imageItem = this.imageItems[ imageItemIndex ];
	
	// loop through all of the stories linked to this image
	n = imageItem.node.stories.length;
	//console.log( 'image ' + imageItem.node.getDisplayTitle() + ' has ' + n + ' stories' );
	for ( i = 0; i < n; i++ ) {
		story = imageItem.node.stories[ i ];
		
		// if any stories are not currently being shown, add them
		if ( view.stories.storyInventory.indexOf( story ) == -1 ) {
			allStoriesAdded = false;
			view.stories.storyItems.push( {
				'name': story.getDisplayTitle(),
				'node': story,
				'type': 'story',
				'isOpen': false,
				'isSibling': false
			} );
			view.stories.storyInventory.push( story );
		}
		
		targetStoryItem = this.getStoryItemForStory( story, this.storyItems );
		if ( targetStoryItem != null ) {
			if ( targetStoryItem.isOpen ) {
				oneStoryIsOpen = true;
				break;
			}
			//view.stories.addStoryGroupSiblings( model.getStoryGroupFromStory( story ) );
			/*if ( !targetStoryItem.isOpen || ( targetStoryItem.node != imageItem.parentNode ) ) {
				allStoryItemsAreOpen = false;
			}*/
		}
	}
	
	// if no new stories were added and one story is already open, then go to the image
	if ( allStoriesAdded && oneStoryIsOpen ) {
		if ( view.currentImage != imageItem.node ) {
			view.setImageAsBackground( null );
		}
		view.setState( ViewState.Image );
		view.selectImage( imageItem.node );
		view.updateURL();
		
	// otherwise, show the story
	} else {
		this.showStory( story.slug );
		view.stories.update();
	}
	
	/*
	// if the story group is open and its currently display content is the parent of the image, then
	if ( allStoryItemsAreOpen ) {
	
		// get the story fragment
		var story = scalarapi.getNode( slug );
		if ( story != null ) {
		
			storyGroups = model.getStoryGroupsFromImage( imageItem.node );
			n = storyGroups.length;
			//view.log( 'found ' + n + ' story groups' );
			
			for ( i = 0; i < n; i++ ) {
				storyGroup = storyGroups[ i ];
				if ( this.addStoryGroupSiblings( storyGroup ) ) {
					addCount++;
				}
			}	
			
			// if we added anything, just update the story display
			if ( addCount > 0 ) {
				view.stories.update();
				
			// if not, then go to the place for the image
			} else {
				/view.setImageAsBackground( null );
				view.setState( ViewState.Image );
				view.selectImage( imageItem.node );
				view.updateURL();*
			}
		}
		
	// open all story groups associated with the mage
	} else {
		var newStories = [];
		n = imageItem.node.stories.length;
		for ( i = 0; i < n; i++ ) {
			story = imageItem.node.stories[ i ];
			storyGroup = model.getStoryGroupFromStory( story );
			if ( this.addStoryGroupSiblings( storyGroup ) ) {
				addCount++;
			}
			targetStoryItem = this.getStoryItemForStory( story, this.storyItems );
		}
		if ( addCount > 0 ) {
			view.stories.update();
		}
		for ( i = 0; i < n; i++ ) {
			story = imageItem.node.stories[ i ];
			this.showStory( story.slug );
		}
	}*/

}

SurfacingStories.prototype.addStoryGroupSiblings = function( storyGroup ) {

	var i, n, story
		storiesAdded = false;
	
	if ( storyGroup != null ) {
		stories = storyGroup.getRelatedNodes( 'tag', 'outgoing' );
		n = stories.length;
		for ( i = 0; i < n; i++ ) {
			story = stories[ i ];
			if ( this.storyInventory.indexOf( story ) == -1 ) {
				this.storyItems.push( {
					'name': story.getDisplayTitle(),
					'node': story,
					'type': 'story',
					'isOpen': false,
					'isSibling': false
				} );
				this.storyInventory.push( story );
				storiesAdded = true;
			}
		}
	}

	return storiesAdded;
}

SurfacingStories.prototype.addStoryGroup = function( storyGroup ) {

	if ( this.storyGroupInventory.indexOf( storyGroup ) == -1 ) {
		var stories = storyGroup.getRelatedNodes( 'tag', 'outgoing' );
		this.storyItems.push( {
			'name': stories[ 0 ].getDisplayTitle(),
			'node': stories[ 0 ],
			'type': 'story',
			'isOpen': false,
			'isSibling': false
		} );
		this.storyGroupInventory.push( storyGroup );
		this.storyInventory.push( stories[ 0 ] );
		return true;
	}

	return false;
}

SurfacingStories.prototype.closeAllStories = function( ) {

	var i, storyItem,
		n = this.storyItems.length;
		
	for ( i = 0; i < n; i++ ) {
		storyItem = this.storyItems[ i ];
		storyItem.isOpen = false;
	}

}

SurfacingStories.prototype.closeStoryAtIndex = function( index ) {

	this.items[ index ].isOpen = false;
	this.updateStories();
	this.force.alpha( 0.1 );
	this.lastOpenedStory = null;

}

SurfacingStories.prototype.showStory = function( slug ) {

	var storyItem,
		story = scalarapi.getNode( slug );
	
	if ( story != null ) {
		storyItem = this.getStoryItemForStory( story, this.storyItems );
		
		if ( storyItem != null ) {
			storyItem.node = story;
			this.closeAllStories();
			storyItem.isOpen = true;
			this.updateStories();
			this.force.alpha( 0.1 );
			this.lastOpenedStory = story;
			view.updateURL();
		}
	}
	
}

SurfacingStories.prototype.showStoryItem = function( storyItem ) {

	if ( storyItem != null ) {
		this.closeAllStories();
		storyItem.isOpen = true;
		this.updateStories();
		this.force.alpha( 0.1 );
	}
	
}

function SurfacingVisualization() {

	var me = this;

	this.canvasWidth = window.innerWidth;
	this.canvasHeight = window.innerHeight;
	
	this.scale = {
		orthographic: 380,
		stereographic: 380,
		gnomonic: 380,
		equidistant: 380 / Math.PI * 2,
		equalarea: 380 / Math.SQRT2
	}; 

	this.landOpacityKeyframes = [
		{ key: 4.5, value: 0.0 },
		{ key: 4.0, value: 1.0 },
		{ key: 3.0, value: 1.0 },
		{ key: 2.5, value: 0.0 }
	];

	this.thumbnailScaleKeyframes = [
		{ key: 4.5, value: 0.0 },
		{ key: 4.0, value: 0.0 },
		{ key: 3.0, value: 1.0 },
		{ key: 2.5, value: 0.0 }
	];
	
	this.themeOpacityKeyframes = [
		{ key: 5.0, value: 1.0 },
		{ key: 4.5, value: 0.0 },
		{ key: 1.5, value: 0.0 },
		{ key: 1.0, value: 0.5 },
		{ key: 0.0, value: 1.0 }
	];
	
	this.projectionScaleKeyframes = [
		{ key: 6.0, value: 30.0 },
		{ key: 5.0, value: 2.5 },
		/*{ key: 4.51, value: 1.0 },
		{ key: 4.5, value: 60.0 },*/
		{ key: 4.0, value: 3.5 },
		{ key: 3.0, value: 60.0 },
		{ key: 2.0, value: 70.0 },
		{ key: 1.0, value: 30.0 },
		{ key: 0.0, value: 2.5 }
	];
	
	this.projections = {};
	this.nearestPlaceCables = [];
	this.nearestPlaceCablePlaces = [];
	
	/*this.projections.aitoff = d3.geo.aitoff();
	this.projections.august = d3.geo.august();
	this.projections.azimuthalequalarea = d3.geo.azimuthalEqualArea();
	this.projections.azimuthalequidistant = d3.geo.azimuthalEquidistant();
	this.projections.baker = d3.geo.baker();
	this.projections.boggs = d3.geo.boggs();
	this.projections.bonne = d3.geo.bonne();
	this.projections.bromley = d3.geo.bromley();
	this.projections.collignon = d3.geo.collignon();
	this.projections.conicconformal = d3.geo.conicConformal();
	this.projections.conicequalarea = d3.geo.conicEqualArea();
	this.projections.conicequidistant = d3.geo.conicEquidistant();
	this.projections.craster = d3.geo.craster();
	this.projections.cylindricalStereographic = d3.geo.fahey();
	this.projections.cylindricalEqualArea = d3.geo.cylindricalEqualArea();
	this.projections.eckert1 = d3.geo.eckert1();
	this.projections.eckert1 = d3.geo.eckert1();
	this.projections.eckert2 = d3.geo.eckert2();
	this.projections.eckert3 = d3.geo.eckert3();
	this.projections.eckert4 = d3.geo.eckert4();
	this.projections.eckert5 = d3.geo.eckert5();
	this.projections.eckert6 = d3.geo.eckert6();
	this.projections.eisenlohr = d3.geo.eisenlohr();
	this.projections.equirectangular = d3.geo.equirectangular();
	this.projections.fahey = d3.geo.fahey();
	this.projections.homolosine = d3.geo.homolosine();
	this.projections.ginzburg4 = d3.geo.ginzburg4();
	this.projections.ginzburg5 = d3.geo.ginzburg5();
	this.projections.ginzburg6 = d3.geo.ginzburg6();
	this.projections.ginzburg8 = d3.geo.ginzburg8();
	this.projections.ginzburg9 = d3.geo.ginzburg9();
	this.projections.gringorten = d3.geo.gringorten();
	this.projections.gnomonic = d3.geo.gnomonic();
	this.projections.guyou = d3.geo.guyou();
	this.projections.hammer = d3.geo.hammer();
	this.projections.hill = d3.geo.hill();
	this.projections.kavrayskiy7 = d3.geo.kavrayskiy7();
	this.projections.lagrange = d3.geo.lagrange();
	this.projections.larrivee = d3.geo.larrivee();
	this.projections.laskowski = d3.geo.laskowski();
	this.projections.loximuthal = d3.geo.loximuthal();
	this.projections.mercator = d3.geo.mercator();
	this.projections.miller = d3.geo.miller();
	this.projections.mtFlatPolarParabolic = d3.geo.mtFlatPolarParabolic();
	this.projections.mtFlatPolarQuartic = d3.geo.mtFlatPolarQuartic();
	this.projections.mtFlatPolarSinusoidal = d3.geo.mtFlatPolarSinusoidal();
	this.projections.mollweide = d3.geo.mollweide();
	this.projections.naturalEarth = d3.geo.naturalEarth();
	this.projections.nellHammer = d3.geo.nellHammer();
	this.projections.orthographic = d3.geo.orthographic();
	this.projections.polyconic = d3.geo.polyconic();
	this.projections.rectangularPolyconic = d3.geo.rectangularPolyconic();
	this.projections.robinson = d3.geo.robinson();
	this.projections.sinuMollweide = d3.geo.sinuMollweide();
	this.projections.sinusoidal = d3.geo.sinusoidal();
	this.projections.stereographic = d3.geo.stereographic();
	this.projections.times = d3.geo.times();
	this.projections.vanDerGrinten = d3.geo.vanDerGrinten();
	this.projections.vanDerGrinten2 = d3.geo.vanDerGrinten2();
	this.projections.vanDerGrinten3 = d3.geo.vanDerGrinten3();
	this.projections.vanDerGrinten4 = d3.geo.vanDerGrinten4();
	this.projections.wagner4 = d3.geo.wagner4();
	this.projections.wagner6 = d3.geo.wagner6();
	this.projections.wagner7 = d3.geo.wagner7();
	this.projections.winkel3 = d3.geo.winkel3();
	
	this.projections.satellite = d3.geo.satellite()
	    .distance(1.1)
	    .scale(2500)
	    .rotate([76.00, -34.50, 32.12])
	    .center([-2, 5])
	    .tilt(25)
	    .clipAngle(Math.acos(1 / 1.1) * 180 / Math.PI - 1e-6)
	    .precision(.1);*/
	    
	var ratio = window.devicePixelRatio || 1;

	/*for ( var i in this.projections ) {
		$( '#projection_select' ).append( '<option value="' + i + '">' + i + '</option>' );
		if ( i != 'satellite' ) {
			this.projections[ i ].scale(250) //450
				.translate([this.canvasWidth / 2, this.canvasHeight / 2]);
		}
	}*/
	    
	/*this.currentProjection = view.stateData[ view.targetState ].projection
		.translate([this.canvasWidth / 2, this.canvasHeight / 2]);*/
		
	this.currentProjection = d3.geo.projection(function(λ, φ) {
			return view.stateData[ view.targetState ].projection([λ, -φ]);
		})
		.translate([this.canvasWidth / 2, this.canvasHeight / 2]);
	
	this.targetRotation = this.currentProjection.rotate();
	    
	/*this.currentProjection = d3.geo.azimuthal()
	    .scale(380)
	    .origin([-71.03,42.37])
	    .mode("orthographic")
	    .translate([640, 400]);*/
	
	this.path = d3.geo.path()
	    .projection(this.currentProjection);
	
	/*var λ = d3.scale.linear()
	    .domain([0, this.canvasWidth])
	    .range([-180, 180]);
	
	var φ = d3.scale.linear()
	    .domain([0, this.canvasHeight])
	    .range([90, -90]);*/


	var drag = d3.behavior.drag()
		.on("dragstart", function() {
			// Adapted from http://mbostock.github.io/d3/talk/20111018/azimuthal.html and updated for d3 v3
			var proj = me.currentProjection.rotate();
			m0 = [d3.event.sourceEvent.pageX, d3.event.sourceEvent.pageY];
			o0 = [-proj[0],-proj[1]];
		})
		.on("drag", function() {
			if (( view.targetState == ViewState.Map ) || ( view.targetState == ViewState.Theme )) {

				view.hasBeenDragged = true;

				if (m0) {
					var m1 = [d3.event.sourceEvent.pageX, d3.event.sourceEvent.pageY],
					    o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
					me.currentProjection.rotate([-o1[0], -o1[1]]);
				}

				// Update the map
				me.path = d3.geo.path().projection(me.currentProjection);
				d3.selectAll("path").attr("d", path);
			}
		});

	this.svg = d3.select("body").append("svg")
	    .attr("width", this.canvasWidth)
	    .attr("height", this.canvasHeight)
    	.call( drag ); 
	
	d3.json("data/world-110m.json", function(error, world) {
		me.svg.append("path")
			.datum(topojson.feature(world, world.objects.land))
			.attr("class", "land")
			.attr( 'stroke', 'none' );
	});
	
}

SurfacingVisualization.prototype.canvasWidth = null;
SurfacingVisualization.prototype.canvasHeight = null;
SurfacingVisualization.prototype.projections = null;
SurfacingVisualization.prototype.currentProjection = null;
SurfacingVisualization.prototype.path = null;
SurfacingVisualization.prototype.svg = null;
SurfacingVisualization.prototype.arcs = null;
SurfacingVisualization.prototype.cableTopology = null;
SurfacingVisualization.prototype.scale = null;
SurfacingVisualization.prototype.themePaths = null;
SurfacingVisualization.prototype.themeVoronoi = null;
SurfacingVisualization.prototype.filteredPlaces = null;
SurfacingVisualization.prototype.targetRotation = null;
SurfacingVisualization.prototype.mouseMovedThisFrame = null;
SurfacingVisualization.prototype.renderedThisFrame = null;
SurfacingVisualization.prototype.themeColors = null;
SurfacingVisualization.prototype.landOpacityKeyframes = null;
SurfacingVisualization.prototype.projectionScaleKeyframes = null;

SurfacingVisualization.prototype.setupPlaces = function() {

	var i, j, n, o, place, images, image, point, temp, url
		me = this;

	n = me.filteredPlaces.length;
	for ( i = 0; i < n; i++ ) {
	
		place = me.filteredPlaces[ i ];
		
		o = place.images.length;
		for ( j = 0; j < o; j++ ) {
		
			image = place.images[ j ];
			
			point = {
				"type": "Point",
				"coordinates": [ place.longitude + image.angleOffset[ 0 ], place.latitude + image.angleOffset[ 1 ] ],
				'image': image
			};
			
			temp = image.current.sourceFile.split( 'media' );
			url = temp.join( 'media/thumbnails' );
			
			/*this.svg.append( 'image' )
				.datum( point )
				.attr( 'xlink:href', url )
				.attr( 'width', 40 )
				.attr( 'height', 30 )
				.attr( 'x', function( d ) { return me.path.projection()( d.coordinates )[0] - 20; } )
				.attr( 'y', function( d ) { return me.path.projection()( d.coordinates )[1] - 15; } )
				.on( 'click', function( d ) { 
					if ( view.localCablePlaces.indexOf( d.image.places[ 0 ] ) != -1 ) {
						view.selectImage( d.image );
					}
					/*me.currentImage = d.image;
					$( '#background' ).css( 'background-image', 'url(' + me.currentImage.current.sourceFile + ')' );
					if ( view.targetState != ViewState.Place ) {
						me.rotateTo( d.coordinates, ViewState.Place );
					}*
				} );*/
			
		}
		
		// arc generator
		this.arcs = d3.svg.arc()
			.startAngle(function(d) { return ( d.theme == view.currentTheme ) ? 0 : model.places.indexOf( d.place ) * ( Math.PI * .2 ); })
 			.endAngle(function(d) { return ( d.theme == view.currentTheme ) ? ( Math.PI * 2 ) : ( model.places.indexOf( d.place ) + 1 ) * ( Math.PI * .2 ); })
 			.innerRadius(function(d) { return ( d.theme == view.currentTheme ) ? d.localIndex * 20 + 5 : d.localIndex * 20; })
			.outerRadius(function(d) { return ( d.theme == view.currentTheme ) ? ( d.localIndex + 1 ) * 20 - 5 : ( d.localIndex + 1 ) * 20; });
			
		var theme;
		o = place.themes.length;
		for ( j = 0; j < o; j++ ) {
			theme = place.themes[ j ];
			this.svg.append( 'svg:path' )
				.datum( { place: place, theme: theme, localIndex: j } )
				.attr( 'class', 'theme-arc' )
				.attr( 'd', this.arcs )
				.attr( 'transform', function( d ) { return 'translate(' + me.path.projection()( [ d.place.longitude, d.place.latitude ] )[0] + ',' + me.path.projection()( [ d.place.longitude, d.place.latitude ] )[1] + ')'; } )
				.attr( 'cursor', 'pointer' )
				.style( 'fill', function( d, i ) { return me.themeColors( model.themes.indexOf( d.theme ) ); } )
				.on( 'click', function( d ) {
					var currentTheme = view.currentTheme;
					var currentPlace = view.currentPlace;
					view.selectPlace( d.place );
					if (( currentTheme != d.theme ) || ( d.place != currentPlace )) {
						//view.currentTheme = d.theme;
						view.selectTheme( d.theme );
					} else {
						view.updateURL();
						view.update();
					}
				} );
		}
			
		/*for ( j = 0; j < o; j++ ) {
			theme = place.themes[ j ];
			this.svg.append("circle")
				.datum( { place: place, theme: theme } )
				.attr( 'cx', function( d ) { return me.path.projection()( [ d.place.longitude, d.place.latitude ] )[0]; } )
				.attr( 'cy', function( d ) { return me.path.projection()( [ d.place.longitude, d.place.latitude ] )[1]; } )
				.attr("class", "theme-ring")
				.attr("r", function ( d ) {
					return ( j + 1 ) * 10;
				} )
				.attr( 'stroke', function( d ) {
					return me.themeColors( model.themes.indexOf( d.theme ) );
				} );
		}*/
		
		this.svg.append("circle")
			.datum( place )
			.attr( 'cx', function( d ) { return me.path.projection()( [ d.longitude, d.latitude ] )[0]; } )
			.attr( 'cy', function( d ) { return me.path.projection()( [ d.longitude, d.latitude ] )[1]; } )
			.attr("class", "place")
			.attr("r", 5)
			.on( 'click', function( d ) {
				var themes = model.getThemesForPlace( d );
				if ( themes.length > 0 ) {
					view.selectTheme(  themes[ Math.floor( Math.random() * themes.length ) ] );
					//view.currentTheme = themes[ Math.floor( Math.random() * themes.length ) ];
				}
				view.selectPlace( d );
				view.updateURL();
			} );
	
	}

}

SurfacingVisualization.prototype.rotateTo = function( coordinates, newState, callback ) {
	var me = this;
	d3.transition()
		.duration( 1250 )
		.tween( 'rotate', function() {
			var p = coordinates,
				r = d3.geo.interpolate( me.currentProjection.rotate(), [ -p[ 0 ], -p [ 1 ] ] );
			return function( t ) {
				me.currentProjection.rotate( r( t ) );
				me.redraw( d3.geo.path().projection( me.currentProjection ), true );
			}
		})
		.each( 'end', function() {
			if ( newState != null ) {
				view.setState( newState );
				view.updateURL();
				me.redraw( d3.geo.path().projection( me.currentProjection ) );
			}
			callback();
		} );
}

SurfacingVisualization.prototype.setupCables = function() {

	var i, j, n, o, cable, stations, station, lineString;
	
	this.cableTopology = {
		"type": "Topology",
		"objects": {
			"cables": {
				"type": "GeometryCollection",
				"geometries": []
			}
		}
	};
	
	n = model.cables.length;
	for ( i = 0; i < n; i++ ) {
	
		cable = model.cables[i];
		stations = cable.getRelatedNodes('path', 'outgoing');
		lineString = {
			"type": "LineString",
			"coordinates": [],
			"cable": cable
		};
		
		o = stations.length;
		for (j=0; j<o; j++) {
		
			station = stations[j];
			
			if (station.longitude) {
				lineString[ 'coordinates' ].push( [ station.longitude, station.latitude ] );
			}
			
		}
		if (cable.getRelatedNodes('tag', 'incoming').indexOf(model.ringTag) != -1) {
			station = stations[0];
			lineString[ 'coordinates' ].push( [ station.longitude, station.latitude ] );
		}
		
		/*this.svg.data( lineString )
			.enter().append( 'path' )
			.attr( 'class', 'cable' )
			.attr( 'd', this.path );*/
			
		this.svg.append( 'path' )
			.datum( lineString )
			.attr( 'fill', 'none' )
			.attr( 'class', 'cable' )
			.style( 'stroke-linecap', 'round' )
			.attr( 'd', this.path );
		
		this.cableTopology[ 'objects' ][ 'cables' ][ 'geometries' ].push( lineString );
		
	}

}

SurfacingVisualization.prototype.setupThemes = function() {

	var i, j, n, o, theme, places, place,
		me = this;
		
	n = model.themes.length;
	for ( i = 0; i < n; i++ ) {
		theme = model.themes[ i ];
		$( '#theme_select' ).append( '<option value="' + theme.slug + '">' + theme.getDisplayTitle() + '</option>' );
	}
	
	d3.select("#theme_select").on("change", function() {
		var index,
			theme = scalarapi.getNode( this.value );
		if ( theme != null ) {
			index = model.themes.indexOf( theme );
			me.themeIndex = index;
		}
		if ( !model.muteThemes ) {
			me.themePaths.style("fill", function(d, i) { 
					var i, theme, index,
						foundMatch = false;
						place = me.filteredPlaces[ i ],
						n = place.themes.length;
					for ( i = 0; i < n; i++ ) {
						theme = place.themes[ i ];
						index = model.themes.indexOf( theme );
						if ( index == me.themeIndex ) {
							foundMatch = true;
							break;
						}
					}
					if ( foundMatch ) {
						return color( me.themeIndex );
					} else {
						return 'none';
					}
				});
		}
	});
		
	this.filteredPlaces = [];
	n = model.places.length;
	var coords = [];
	var combo;
	for ( i = 0; i < n; i++ ) {
		place = model.places[ i ];
		combo = place.latitude + place.longitude;
		if (( place.longitude != null ) && 
			( coords.indexOf( combo ) == -1 ) && 
			( isNaN( parseInt( place.getDisplayTitle().split( '_' )[ 0 ] ))) && 
			/*( model.getThemesForPlace( place ).length > 0 ) && */
			(( model.getStoriesFromPlace( place ).length > 0 ) || ( place.images.length > 0 ))) {
			this.filteredPlaces.push( place );
			coords.push( combo );
		}
	}
		
	this.themeColors = d3.scale.category20();
	
	if ( !model.muteThemes ) {

		this.themeVoronoi = d3.geom.voronoi()
						.clipExtent( [ [ 0, 0 ], [ window.innerWidth, window.innerHeight ] ] )
						.x( function( d ) { return me.path.projection()( [ d.longitude, d.latitude ] )[ 0 ]; } )
						.y( function( d ) { return me.path.projection()( [ d.longitude, d.latitude ] )[ 1 ]; } );
		
		this.themePaths = this.svg.append( 'g' ).selectAll( '.theme' );
		
		this.themePaths = this.themePaths.data( this.themeVoronoi( this.filteredPlaces ) );
		
		//this.themeIndex = 8;
		
		this.themePaths.enter().append( 'path' )
			.attr( 'class', 'theme' )
			.style("fill", function(d, i) { 
				var j, theme, index,
					foundMatch = false;
					place = me.filteredPlaces[ i ],
					n = place.themes.length;
				for ( j = 0; j < n; j++ ) {
					theme = place.themes[ j ];
					index = model.themes.indexOf( theme );
					if ( index == me.themeIndex ) {
						foundMatch = true;
						break;
					}
				}
				if ( foundMatch ) {
					return me.themeColors( index );
				} else {
					return 'none';
				}
			})
			.attr( 'd', function( d, i ) { 
				return "M" + d.join("L") + "Z"; 
			} );

	}
	
	/*n = model.themes.length;
	for ( i = 0; i < n; i++ ) {
		
		theme = model.themes[ i ];
		places = model.getPlacesFromTheme( theme );
		o = places.length;
		for ( j = 0; j < o; j++) {
		
		}
		
	}*/
	
	// me.themeColors( model.themes.indexOf( theme )

}

/*SurfacingVisualization.prototype.pathTween = function( projection0, projection1, rotate ) {
	var me = this;
	projection0.rotate([0, 0, 0]);
	projection1.rotate([0, 0, 0]);
	var t = 0,
		projection = d3.geo.projection(function(λ, φ) {
			λ *= 180 / Math.PI, φ *= 180 / Math.PI;
			var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
			return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
		})
			.rotate(rotate)
			.scale(1)
			.translate([this.canvasWidth / 2, this.canvasHeight / 2])
			.clipAngle( projection0.clipAngle() ),
		path = d3.geo.path().projection(projection);
	return function() {
		return function(u) {
			t = u;
			me.redraw(path);
		};
	};
}

SurfacingVisualization.prototype.updateProjection = function( proj ) {
	console.log( 'do it' );
	var me = this,
		rotation = me.currentProjection.rotate();
	this.svg.transition()
		.duration(750)
		.attrTween( 'path', this.pathTween( this.currentProjection, this.currentProjection = proj, rotation ) )
		.each( 'end', function() {
			me.currentProjection.clipAngle( proj.clipAngle() );
			me.currentProjection.rotate( rotation );
			me.redraw( me.path );
		});
	this.path.projection( this.currentProjection );
}*/

SurfacingVisualization.prototype.findNearestPlace = function( ) {

	var centerPos = this.path.projection().rotate();
	
	var i, distance, place, nearestPlace, cable, places, j, o, sourcePlaces,
		minDistance = 99999;
		
	//if ( this.nearestPlace == null ) {
		sourcePlaces = model.nonBranchPlaces;
		//this.nearestPlace = sourcePlaces[ Math.floor( Math.random() * sourcePlaces.length ) ];
	 	n = sourcePlaces.length;
		for ( i = 0; i < n; i++ ) {
			place = sourcePlaces[ i ];
			distance = d3.geo.distance( [ -centerPos[0], -centerPos[1] ], [ place.longitude, place.latitude ] );
			if ( distance < minDistance ) {
				nearestPlace = place;
				minDistance = distance;
			}
		}
		this.nearestPlace = nearestPlace;
	/*} else {
		sourcePlaces = this.nearestPlaceCablePlaces;
	 	n = sourcePlaces.length;
		for ( i = 0; i < n; i++ ) {
			place = sourcePlaces[ i ];
			distance = d3.geo.distance( [ -centerPos[0], -centerPos[1] ], [ place.longitude, place.latitude ] );
			if ( distance < minDistance ) {
				nearestPlace = place;
				minDistance = distance;
			}
		}
		this.nearestPlace = nearestPlace;
	}*/
	
	this.nearestPlaceCables = this.nearestPlace.getRelatedNodes( 'path', 'incoming' ); // does this get any other things besides cables?
	
	this.nearestPlaceCablePlaces = [];
	n = this.nearestPlaceCables.length;
	for ( i = 0; i < n; i++ ) {
		cable = this.nearestPlaceCables[ i ];
		places = cable.getRelatedNodes( 'path', 'outgoing' );
		o = places.length;
		for ( j = 0; j < o; j++ ) {
			place = places[ j ];
			if ( this.nearestPlaceCablePlaces.indexOf( place ) == -1 ) {
				this.nearestPlaceCablePlaces.push( place );
			}
		}
	}
			
	//$( '#message-box' ).text( centerPos + ' nearest: ' + nearestPlace.getDisplayTitle() + ' ' + nearestPlace.longitude + ', ' + nearestPlace.latitude );

}

SurfacingVisualization.prototype.redraw = function( path, smooth ) {

	var me = this;
	var centerPos = path.projection().rotate();
		arc = d3.geo.greatArc();
	
	if ( !me.renderedThisFrame ) {
	
		me.renderedThisFrame = true;
		
		centerPos = [ -centerPos[ 0 ], -centerPos[ 1 ] ];	
		
		this.path = path;
		
		var interpolate = function( current, target, rate ) {
			//if ( smooth ) {
	 			return ( current + (( target - current ) * rate )).toString();
			/*} else {
				return target;
			}*/
		}	
		
		if ( !model.muteMap /*&& ( view.targetState != ViewState.Story )*/ ) {

			this.svg.selectAll( 'path' )
				.attr( 'd', path );

		}
			
		var landOpacity = interpolateKeyframes( this.landOpacityKeyframes, view.currentState );
		var thumbnailScale = interpolateKeyframes( this.thumbnailScaleKeyframes, view.currentState );
		var landDisplay = ( landOpacity < .05 ) ? 'none' : 'inline';
		this.svg.selectAll( '.land' )
			.attr( 'opacity', landOpacity )
			.attr( 'display', landDisplay );

	    /*this.svg.selectAll( 'image' )
	    	.attr( 'xlink:href', function( d ) { 
	    		/*if ( me.currentImage == d.image ) {
	    			return d.image.current.sourceFile;
	    		} else {*
		 			temp = d.image.current.sourceFile.split( 'media' );
					return temp.join( 'media/thumbnails' );
	   			//};
	    	})
	    	.attr( 'x', function( d ) { 
	    		//if ( me.currentImage != d.image ) {
	   				return path.projection()( d.coordinates )[0] - ( this.width.baseVal.value * .5 );
	   			/*} else {
	   				return interpolate( this.x.baseVal.value, 20, .3 );
	   			}*
	    	} )
	    	.attr( 'y', function( d ) { 
	     		//if ( me.currentImage != d.image ) {
	  				return path.projection()( d.coordinates )[1] - ( this.height.baseVal.value * .5 );
	   			/*} else {
	   				return interpolate( this.y.baseVal.value, 20, .3 );
	   			}*
	    	} )
	    	.attr( 'width', function( d ) { 
	    		/*var target = ( me.currentImage == d.image ) ? 800 : 40;
	    		return interpolate( this.width.baseVal.value, target, .3 );*
	    		//return 40;
	     		var dist = arc.distance( { source: d.coordinates, target: centerPos } );
	    		//dist = Math.pow( dist, 2 );
				return ( 80 * ( 1.0 - ( Math.min( dist, 1.57 ) / 1.57 ) ) ) * thumbnailScale;	   	
	  		} )
	    	/*.attr( 'height', function( d ) { 
	    		/*var target = ( me.currentImage == d.image ) ? 500 : 25;
	     		return interpolate( this.height.baseVal.value, target, .3 );
	     		return 25;
		   	} )
		   	.style( 'opacity', function( d ) {
	    		var dist = arc.distance( { source: d.coordinates, target: centerPos } );
	    		dist = Math.pow( dist, 2 );
				return 1.0 - ( Math.min( dist, 1.57 ) / 1.57 );	   	
		   	} )*/
			/*.attr( 'opacity', landOpacity )*
			.attr( 'display', function( d ) {
				return ( ( view.localCablePlaces.indexOf( d.image.places[ 0 ] ) != -1 ) && ( landDisplay == 'inline' ) ) ? 'inline' : 'none';
			} );
	    	/*.style( 'display', function( d ) {
	    		var dist = arc.distance( { source: d.coordinates, target: centerPos } );
	    		return ( ( dist > 1.57 ) || !$( '#image_control' )[0].checked || ( view.targetState == ViewState.Image ) || ( view.targetState == ViewState.Theme ) ) ? 'none' : 'inline';
	    	} )*;*/
			
		/*var themeOpacity, themeDisplay;
		if ( view.currentState > 4.5 ) {
			themeOpacity = ( 5 - view.currentState ) / .5;
			themeDisplay = 'inline';
		} else if ( view.currentState > 1.5 ) {
			themeOpacity = 0
			themeDisplay = 'inline';
		} else if ( view.currentState > .5 ) {
			landOpacity = ( Math.abs ( view.currentState - 1 ) / .5 );
			landDisplay = 'inline';
		} else if ( view.currentState > 2.5 ) {
			landOpacity = ( view.currentState - 2.5 ) / .5;
			landDisplay = 'inline';
		} else {
			landOpacity = 0;
			landDisplay = 'none';
		}*/
	    	
		//if ( !model.muteMap ) {
		if ( !model.muteThemes ) {
			var themeOpacity = interpolateKeyframes( this.themeOpacityKeyframes, view.currentState );
			var themeDisplay = ( themeOpacity < .05 ) ? 'none' : 'inline';
			this.themeVoronoi.x( function( d ) { return path.projection()( [ d.longitude, d.latitude ] )[ 0 ]; } )
				.y( function( d ) { return path.projection()( [ d.longitude, d.latitude ] )[ 1 ]; } );
			this.themePaths.data( this.themeVoronoi( this.filteredPlaces ) );
			this.themePaths
				.attr( 'd', function( d ) { return "M" + d.join("L") + "Z"; } )
				.style( 'display', themeDisplay )
				.style( 'opacity', themeOpacity );
		}
		//}
			
		this.svg.selectAll( '.place' )
			.style( 'fill', function( d ) { return ( d == view.currentPlace ) ? 'white' : 'black'; } ) // color was #ad325e
			.style( 'stroke', function( d ) { return ( d == view.currentPlace ) ? 'white' : '#aaa'; } )
			.attr( 'cx', function( d ) { return path.projection()( [ d.longitude, d.latitude ] )[0]; } )
			.attr( 'cy', function( d ) { return path.projection()( [ d.longitude, d.latitude ] )[1]; } )
			.style( 'display', function( d ) {
				if ( view.targetState == ViewState.Theme ) {
					if ( model.getThemesForPlace( d ).length > 0 ) {
						return 'inline';
					} else {
						return 'none';
					}
				} else if ( view.localCablePlaces.indexOf( d ) != -1 ) {
					return 'inline';
				} else {
					return 'none';
				}
			} )
			.attr( 'opacity', function( d ) {
				return Math.min( 1.0, Math.abs( view.currentState - ViewState.Image ) );
			} )
			.attr( 'r', function( d ) {
				if ( ( view.currentState >= ViewState.Place ) && ( view.currentState <= ViewState.Map ) ) {
					return ( 1 - ( view.currentState - ViewState.Place ) ) * 10 + 5;
				} else if ( view.targetState == ViewState.Theme ) {
					return ( d == view.currentPlace ) ? 7.5 : 5;
				} else {
					return 5;
				}
			} );
			
		this.svg.selectAll( '.theme-arc' )
			.style( 'stroke', function( d ) { return (( view.currentTheme == d.theme ) && ( view.currentPlace == d.place )) ? '#eee' : 'none'; } )
			.style( 'fill', function( d ) { return view.visualization.themeColors( model.themes.indexOf( d.theme ) ); } )
			.attr( 'd', this.arcs )
			.attr( 'transform', function( d ) { return 'translate(' + me.path.projection()( [ d.place.longitude, d.place.latitude ] )[0] + ',' + me.path.projection()( [ d.place.longitude, d.place.latitude ] )[1] + ')'; } )
			.style( 'display', function( d ) { return ( view.targetState == ViewState.Theme ) ? (( view.currentTheme == d.theme ) || (( view.currentPlace == d.place )) ? 'inline' : 'none' ) : 'none'; } );
			
		/*this.svg.selectAll( '.theme-ring' )
			.style( 'stroke', function( d ) { 
				return view.visualization.themeColors( model.themes.indexOf( d.theme ) ); 
			} )
			.attr( 'cx', function( d ) { return path.projection()( [ d.place.longitude, d.place.latitude ] )[0]; } )
			.attr( 'cy', function( d ) { return path.projection()( [ d.place.longitude, d.place.latitude ] )[1]; } )
			.style( 'display', function( d ) { return ( view.targetState == ViewState.Theme ) ? 'inline' : 'none'; } );*/
			
		this.svg.selectAll( '.cable' )
			/*.style( 'stroke', function( d ) { 
				return ( view.visualization.nearestPlaceCables.indexOf( d.cable ) != -1 ) ? 'white' : '#ad325e'; 
			} );*/
			.style( 'stroke-width', function( d ) {
				if ( view.currentState > 4 ) {
					return 1;
				} else if ( view.currentState > 3 ) {

					var shouldHighlight = false;

					// if this is the current cable, then highlight
					if ( view.currentCable == d.cable ) {	
						shouldHighlight = true;

					// otherwise if this cable belongs to the current cable's cable group, then highlight
					} else if ( view.currentCable != null ) {
						if ( view.currentCable.cableGroup != null ) {
							if ( view.currentCable.cableGroupSiblings.indexOf( d.cable ) != -1 ) {
								shouldHighlight = true;
							}
						}
					}

					if ( shouldHighlight ) {
						return 4;
					} else {
						return ( 1 - ( view.currentState - ViewState.Place ) ) * 10 + 1;
					}

				} else {
					return ( 1 - ( view.currentState - ViewState.Image ) ) * 10 + 11;
				}
				/*if ( ( view.currentState >= ViewState.Place ) && ( view.currentState <= ViewState.Map ) ) {
					return ( 1 - ( view.currentState - ViewState.Place ) ) * 10 + 1;
				} else {
					return 1;
				}*/
			} )
			.style( 'display', function( d ) { 
				return ( view.localCables.indexOf( d.cable ) != -1 ) ? 'inline' : 'none'; 
			} )
			.attr( 'opacity', landOpacity );
		
	}
}

SurfacingVisualization.prototype.perFrame = function( overrideThrottle ) {
		
	// http://stackoverflow.com/questions/17045826/how-to-do-smooth-transition-for-map-reprojection-in-d3-js
	// http://www.jasondavies.com/maps/transition/ <- this is what is used below
	this.renderedThisFrame = false;

	//$( '#message-box' ).text( this.targetRotation + ' ' + this.currentProjection.rotate() );

	//$( '#message-box' ).append( view.lowState + ' ' + ( Math.round( view.currentState * 100 ) / 100.0 ) + ' ' + view.highState + ' ' + view.targetState + '<br/>' );
		
	if ( this.isMouseDown ) {
	    var currentRot = this.currentProjection.rotate();
		// TODO: Adjust so it's frame rate independent
	    var newRot = [
    		currentRot[ 0 ] + ( this.targetRotation[ 0 ] - currentRot[ 0 ] ) * .2,
    		currentRot[ 1 ] + ( this.targetRotation[ 1 ] - currentRot[ 1 ] ) * .2
    	];
	    this.currentProjection.rotate( newRot );
		if ( !this.mouseMovedThisFrame ) {
			this.redraw( d3.geo.path().projection( this.currentProjection ) );
		}
	}
	    
	/*} else*/ if ( ( Math.abs( view.currentState - view.targetState ) < .0005 ) && !overrideThrottle ) {
		//view.currentState == view.targetState;
		
	} else {

		var t,
			projection0 = view.stateData[ view.lowState ].projection,
			projection1 = view.stateData[ view.highState ].projection,
			rotation = this.currentProjection.rotate();
			
		if ( ( view.lowState - view.highState ) > 1 ) {
			if ( view.targetState == view.highState ) {
				t = view.currentState
			} else {
				t = view.currentState - view.lowState;
			}
		/*} else if ( view.lowState > view.highState ) {
			t = view.currentState;*/
		} else {
			t = view.currentState - view.lowState;
		}
		
		//view.log( view.lowState + ' - ' + view.highState + ' - ' + t + ' ' + view.currentState, true );
					
		/*var projectionA = projection0
			.rotate(rotation)
			.translate([this.canvasWidth / 2, this.canvasHeight / 2]);*/
			
		var projectionB = d3.geo.projection(function(λ, φ) {
				λ *= 180 / Math.PI, φ *= 180 / Math.PI;
				var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
				//return [ p0[ 0 ] + ( ( p1[ 0 ] - p0[ 0 ] ) * t ),  p0[ 1 ] + ( ( p1[ 1 ] - p0[ 1 ] ) * t )];
				return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
				//return p0;
			})
			.rotate(rotation)
			.scale( interpolateKeyframes( this.projectionScaleKeyframes, view.currentState ) )
			.translate([this.canvasWidth / 2, this.canvasHeight / 2])
			.clipAngle( projection1.clipAngle() );
			
		//$( '#message-box' ).text( projectionA([ 45, 20 ]) + ' ' + projectionB([ 45, 20 ]) + ' ' + projection0([ 45, 20 ]) );
		
		this.currentProjection = projectionB;
	
		this.redraw( d3.geo.path().projection( this.currentProjection ) );
		
	}
		
		/*var temp = view.stateData[ view.targetState ].projection
			.translate([this.canvasWidth / 2, this.canvasHeight / 2]);

		$( '#message-box' ).text( temp([ 0, 0 ]) + ' ' + projection0([ 0, 0 ]) + ' ' + this.currentProjection([ 0, 0 ]) );*/

	this.mouseMovedThisFrame = false;
	
}

SurfacingVisualization.prototype.update = function() {
			
	var i, n, backgroundZoom, opacity, storyX, storyZ, storyOpacity, imageZ, imageOpacity, node,
		processedNodes = [],
		storyImages = [],
		me = this;
			
	switch ( view.targetState ) {
	
		case ViewState.Title:
		break;
		
		case ViewState.Theme:
		backgroundZoom = 1.0;
		opacity = 0;
		storyOpacity = 0;
		storyZ = -100;
		storyX = 60;
		imageZ = -300;
		imageOpacity = 0;
		break;
		
		case ViewState.Map:
		backgroundZoom = 1.05;
		opacity = 0.35;
		storyOpacity = 0;
		storyZ = 100;
		storyX = 80;
		imageZ = -300;
		imageOpacity = 0;
		break;
		
		case ViewState.Place:
		backgroundZoom = 1.1;
		opacity = 0.5;
		storyOpacity = 0;
		storyZ = 30;
		storyX = 80;
		imageZ = -300;
		imageOpacity = 0;
		break;
		
		case ViewState.Image:
		backgroundZoom = 1.2;
		opacity = 1.0;
		storyOpacity = 0.5;
		storyZ = 40;
		storyX = 80;
		imageZ = 300;
		imageOpacity = 0;
		break;
		
		case ViewState.Story:
		backgroundZoom = 1.1;
		opacity = 0.0;
		storyOpacity = 1;
		storyZ = 0;
		storyX = 60;
		imageZ = 0;
		imageOpacity = 1;
		break;
	
	}
	
	/*
	storyImages = model.getStoryGroupImagesFromStory( view.currentStory );
	
	var index = storyImages.indexOf( view.currentImage );

	images = d3.select( 'body' ).selectAll( '.story-image' ).data( storyImages )
		.attr( 'src', function( d ) { 
			var temp = d.current.sourceFile.split( 'media' );
			//var url = temp.join( 'media/medium' ); // this is the real deal
			var url = 'media' + temp[ temp.length - 1 ]; // this is temporary for local images
			return url;
		} );
	
	images.enter().append( 'img' )
		.attr( 'class', 'story-image' )
		.attr( 'src', function( d ) { 
			var temp = d.current.sourceFile.split( 'media' );
			//var url = temp.join( 'media/medium' ); // this is the real deal
			var url = 'media' + temp[ temp.length - 1 ]; // this is temporary for local images
			return url;
		} )
		.attr( 'width', 240 )
		/*.attr( 'style', function() {
			var x = Math.round( window.innerWidth * Math.random() );
			var y = Math.round( window.innerWidth * Math.random() );
			return '-webkit-transform: translate3d( ' + x + 'px, ' + y + 'px, 0 ); -moz-transform: translate3d( ' + x + 'px, ' + y + 'px, 0 );';
		} )
		.on( 'click', function( d ) {
			alert( 'select image' );
			view.selectImage( d );
		} );
		
	if ( storyImages.length > 4 ) {
		alert( 'lots of images: ' + storyImages.length );
	}
	
	$( '.story-image' ).each( function( i ) {
		var finalOpacity = imageOpacity;
		if ( i >= storyImages.length ) {
			finalOpacity = 0;
		}
		var x = Math.round( ( window.innerWidth * .25 ) + (( window.innerWidth * .2 ) * Math.random()) - ( window.innerWidth * .1 ) );
		var y = Math.round(( window.innerHeight / ( storyImages.length + 1 )) * ( i + 1 )) - 95;
		//var y = Math.round( ( window.innerHeight * .5 ) + (( window.innerHeight * .4 ) * Math.random()) - ( window.innerHeight * .2 ) );
		var z = Math.round( 100 * Math.random() );
		var scale = 1.0 + ( Math.random() * .5 );
		var rotation = Math.round( 20 * Math.random() - 10 );
		var transform;
		if ( $( this ).attr( 'src' ) == $( this ).data( 'lastSrc' ) ) {
			var lastPos = $( this ).data( 'lastPos' );
			transform = 'rotateZ( ' + lastPos.r + 'deg ) translate3d( ' + lastPos.x + 'px, ' + lastPos.y + 'px, ' + imageZ + 'px ) scale( ' + lastPos.s + ' )';
			$( this ).attr( 'style', '-webkit-transform: ' + transform +'; -moz-transform: ' + transform + '; opacity: ' + finalOpacity + ';' );
		} else {
			transform = 'rotateZ( ' + rotation + 'deg ) translate3d( ' + x + 'px, ' + y + 'px, ' + imageZ + 'px ) scale( ' + scale + ' )';
			$( this ).attr( 'style', '-webkit-transform: ' + transform + '; -moz-transform: ' + transform + '; opacity: ' + finalOpacity + ';' );
		}
		//alert( transform );
		$( this ).data( 'lastSrc', $( this ).attr( 'src' ) );
		$( this ).data( 'lastPos', { x: x, y: y, r: rotation, s: scale } );
	});*/
		
	//alert( 'translate3d( ' + Math.round( Math.random() * 90 ) + '%, ' + Math.round( Math.random() * 90 ) + '%, 0 )' );
		
	/*images.transition().duration( 1000 ).style( 'top', function( d, i ) { 
		if ( d == view.currentImage ) {
			return '-170px';
		} else {
			if (( index != -1 ) && ( i > index )) {
				return ( 10 + ( ( i - 1 ) * 160 )) + 'px'; 
			} else {
				return ( 10 + ( i * 160 )) + 'px'; 
			}
		}
	} );*/
		
	//images.exit().transition().duration( 1000 ).style( 'top', '-170px' ).remove();
	//images.exit().remove();

	// this replaces references to cables that are in cable groups with the cable
	// groups themselves, making sure there are no duplicates
	n = view.relatedNodes.length;
	for ( i = 0; i < n; i++ ) {
		node = view.relatedNodes[ i ];
		if ( node.cableGroup != null ) {
			node = node.cableGroup;
		}
		if ( processedNodes.indexOf( node ) == -1 ) {
			processedNodes.push( node );
		}
	}	
	
	// draw the chips
	var chips = d3.select( '#chips' ).selectAll( '.chip' ).data( processedNodes, function( d ) { return d.slug; } );
		
	chips.enter().append( 'div' )
		.attr( 'class', function( d ) {

			var chipClass = "chip";
			if ( view.currentCable != null ) {
				if (( view.currentCable == d ) || ( view.currentCable.cableGroup == d )) {
					chipClass = 'chip highlight';
				}
			}
			if ( view.currentTheme == d ) {
				chipClass = "chip highlight";
			}
			return chipClass;

			/*if (( view.currentCable == d ) || ( view.currentTheme == d )) {
				return 'chip highlight';
			} else {
				return 'chip';
			}*/
		} )
		.style( 'background-color', function( d ) {
			var index = model.themes.indexOf( d );
			return ( index != -1 ) ? me.themeColors( index ) : 'black';
		} )
		.style( 'color', function( d ) {
			return ( model.themes.indexOf( d ) != -1 ) ? 'black' : 'white'
		} )
		.filter( function( d ) { return (( model.cables.indexOf( d ) != -1 ) || ( model.cableGroupNames.indexOf( d.slug ) != -1 ) || ( model.themes.indexOf( d ) != -1 )); } )
		.style( 'cursor', 'pointer' )
		.on( 'click', function( d ) {

			// if this is is a cable group, then
			if ( model.cableGroupNames.indexOf( d.slug ) != -1 ) {
				var cables = d.children;
				var i, cable,
					n = cables.length;
				for ( i = 0; i < n; i++ ) {
					cable = cables[ i ];
					if ( view.relatedNodes.indexOf( cable ) != -1 ) {
						if ( view.currentCable == cable ) {
							view.selectCable( null );
						} else {
							view.selectCable( cable );	
						}
						break;
					}
				}

			// if this is a cable, then
			} else if ( model.cables.indexOf( d ) != -1 ) {
				if ( view.currentCable == d ) {
					view.selectCable( null );
				} else {
					view.selectCable( d );
				}

			// otherwise
			} else {
				if ( view.currentTheme == d ) {
					//view.currentTheme = null;
					view.selectTheme( null );
				} else {
					//view.currentTheme = d;
					view.selectTheme( d );
					view.stories.updateStories();
				}
				//view.stories.resetStories();
				//view.updateURL();
				//view.update();
			}
		} );
		
	chips.attr( 'class', function( d ) {
				var chipClass = "chip";
				if ( view.currentCable != null ) {
					if (( view.currentCable == d ) || ( view.currentCable.cableGroup == d )) {
						chipClass = 'chip highlight';
					}
				}
				if ( view.currentTheme == d ) {
					chipClass = "chip highlight";
				}
				if ( view.currentPlace == d ) {
					chipClass = 'chip place';
				}
				return chipClass;
			} )
		.html( function( d ) {
		
			// if this is a story, then just show its title
			if ( model.stories.indexOf( d ) != -1 ) {
				return '<b>' + model.getStoryGroupTitleFromStory( d ) + ' </b>';
				
			// if this is a cable, then
			} else if ( model.cables.indexOf( d ) != -1 ) {
			
				var cable;

				// if it's the selected cable, then show its details
				if ( view.currentCable == d ) {

					if ( d.current.content == null ) {
						return '<b>' + d.getDisplayTitle() + '</b>';
					} else {
						return '<h1>' + d.getDisplayTitle() + ' &nbsp;<img src="images/arrow_dn_wht.png" title="Down arrow"/></h1>' + '<p>' + d.current.content + '</p>';
					}
					
				//otherwise, just show its title
				} else {

					/*if ( d.current.content == null ) {
						return '<b>' + model.getStoryGroupTitleFromStory( d ) + '</b>';
					} else {
						return '<b>' + model.getStoryGroupTitleFromStory( d ) + ' &nbsp;<img src="images/arrow_rt_wht.png" title="Right arrow"/></b>';
					}*/

					if ( d.current.content == null ) {
						return '<b>' + d.getDisplayTitle() + '</b>';
					} else {
						return '<b>' + d.getDisplayTitle() + ' &nbsp;<img src="images/arrow_rt_wht.png" title="Right arrow"/></b>';
					}
				}

			} else if ( d.children != null ) {
			
				var cable;

				// if it's the selected cable, then show its details
				if ( d.children.indexOf( view.currentCable ) != -1 ) {

					if ( d.current.content == null ) {
						return '<b>' + d.getDisplayTitle() + '</b>';
					} else {
						return '<h1>' + d.getDisplayTitle() + ' &nbsp;<img src="images/arrow_dn_wht.png" title="Down arrow"/></h1>' + '<p>' + d.current.content + '</p>';
					}
					
				//otherwise, just show its title
				} else {

					/*if ( d.current.content == null ) {
						return '<b>' + model.getStoryGroupTitleFromStory( d ) + '</b>';
					} else {
						return '<b>' + model.getStoryGroupTitleFromStory( d ) + ' &nbsp;<img src="images/arrow_rt_wht.png" title="Right arrow"/></b>';
					}*/

					if ( d.current.content == null ) {
						return '<b>' + d.getDisplayTitle() + '</b>';
					} else {
						return '<b>' + d.getDisplayTitle() + ' &nbsp;<img src="images/arrow_rt_wht.png" title="Right arrow"/></b>';
					}
				}

				
			// for anything else, show details
			} else {

				return '<h1>' + d.getDisplayTitle() + '</h1>' + ( ( d.current.content == null ) ? '' : ( '<p>' + d.current.content + '</p>' ) );
			}
			
		} )
		.transition().duration( 500 ).style( 'max-height', function( d ) {
			if ( view.targetState == ViewState.Image ) {
				return '300px';
			} else {
				return '600px';
			}
		} );
			
	chips.exit().transition().duration( 500 ).style( 'max-height', '0px' ).remove();
	
	/*$( '#expanded-story' ).css( {
		'-webkit-transform': 'translate3d( ' + storyX + '%, 40%, ' + storyZ + 'px )',
		'opacity': storyOpacity
	} );
	
	if ( view.currentStory != null ) {
		$( '#expanded-story' ).html( '<div id="story-container"><h1>' + model.getStoryGroupTitleFromStory( view.currentStory ) + '</h1>' + model.getStoryGroupTextFromStory( view.currentStory ) + '</div>' );
	}*/
	
	// update themes
	/*this.themePaths.style( 'fill', function( d, i ) { 
		var j, theme, index,
			foundMatch = false;
			place = me.filteredPlaces[ i ],
			o = place.themes.length;
			
		for ( j = 0; j < o; j++ ) {
			theme = place.themes[ j ];
			if ( theme == view.currentTheme ) {
				foundMatch = true;
				break;
			}
		}
		if ( foundMatch ) {
			return me.themeColors( model.themes.indexOf( theme ) );
		} else {
			return 'none';
		}
	});*/
	
	// zoom + fade background image
	$( '#background' ).css( {
		'-webkit-transform': 'scale( ' + backgroundZoom + ', ' + backgroundZoom + ' )', 
		'-moz-transform': 'scale( ' + backgroundZoom + ', ' + backgroundZoom + ' )',
		'-o-transform': 'scale( ' + backgroundZoom + ', ' + backgroundZoom + ' )',
		'-ms-transform': 'scale( ' + backgroundZoom + ', ' + backgroundZoom + ' )',
		'transform': 'scale( ' + backgroundZoom + ', ' + backgroundZoom + ' )',
		'opacity': opacity
	} );

}
