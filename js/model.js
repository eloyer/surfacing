/**
 * SurfacingModel and related classes
 * Part of the Surfacing website
 * developed for Nicole Starosielski
 * by Erik Loyer
 */
 
var model = new SurfacingModel();

/**
 * Creates a new SurfacingModel. This is called automatically and the resulting instance
 * placed in the global variable model.
 */
function SurfacingModel() {

	this.muteViz = false;
	this.muteMap = false;
	this.muteThemes = false;

}

SurfacingModel.prototype.images = null;				// Array of all images in the project
SurfacingModel.prototype.places = null;				// Array of all places in the project
SurfacingModel.prototype.nonBranchPlaces = null;	// Array of all places in the project that aren't branches
SurfacingModel.prototype.startingPoints = null;		// Array of all starting point places in the project
SurfacingModel.prototype.stories = null;			// Array of all stories in the project
SurfacingModel.prototype.storyGroups = null;		// Array of all story groups in the project
SurfacingModel.prototype.cables = null;				// Array of all cables in the project
SurfacingModel.prototype.cableGroups = null;		// Array of all cable groups in the project
SurfacingModel.prototype.cableGroupNames = null;
SurfacingModel.prototype.branchPointTag = null;		// Tag applied to all branch points
SurfacingModel.prototype.themes = null;				// Array of all themes in the project
SurfacingModel.prototype.ringTag = null;			// Tag applied to all ring cables
SurfacingModel.prototype.muteViz = null;			// Should the geo visualization be muted?
SurfacingModel.prototype.muteMap = null;			// Should the country outlines only be muted?
SurfacingModel.prototype.muteThemes = null;			// Should the theme regions only be muted?

SurfacingModel.prototype.postProcessPlaces = function() {

	var i, j, k, n, o, p, place, secondaryPlaces, secondaryPlace, image, angleUnit, angle, xdiff, ydiff, cable, isBranch;
	
	this.nonBranchPlaces = [];
	
	n = this.places.length;
	for ( i = 0; i < n; i++ ) {
	
		place = this.places[ i ];
		
		isBranch = false;
		var tags = place.getRelatedNodes( 'tag', 'incoming' );
		o = tags.length;
		for ( j = 0; j < o; j++ ) {
			if ( tags[ j ].slug == 'branching-point' ) {
				isBranch = true;
			}
		}
		if ( !isNaN( parseInt( place.getDisplayTitle().split( '_' )[ 0 ] )) ) {
			isBranch = true;
		}
		if ( !isBranch ) {
			this.nonBranchPlaces.push( place );
		}
		
		// geographic coordinates
		if (place.current.properties['http://purl.org/dc/terms/coverage']) {
			var temp = place.current.properties['http://purl.org/dc/terms/coverage'][0].value.split(',');
			//console.log( place.getDisplayTitle() );
			if ( i != 91 ) {
				place.latitude = parseFloat(temp[0]);
				place.longitude = parseFloat(temp[1]);
				if ( isNaN( place.latitude ) || isNaN( place.longitude ) ) {
					place.latitude = 30;
					place.longitude = 30;
					console.log( place.getDisplayTitle() );
				}
				if (place.longitude >= 0) {
					place.posLongitude = place.longitude;
				} else {
					place.posLongitude = 360 + place.longitude;
				}
				if (place.latitude >= 0) {
					place.posLatitude = place.latitude;
				} else {
					place.posLatitude = 360 + place.latitude;
				}
			} else {
				/*console.log( place.getDisplayTitle() );
				console.log( parseFloat(temp[0]) + ' ' + parseFloat(temp[1]) );
				place.latitude = parseFloat(temp[0]);
				place.longitude = parseFloat(temp[1]);
				if (place.longitude >= 0) {
					place.posLongitude = place.longitude;
				} else {
					place.posLongitude = 360 + place.longitude;
				}
				if (place.latitude >= 0) {
					place.posLatitude = place.latitude;
				} else {
					place.posLatitude = 360 + place.latitude;
				}
				console.log( place );*/
			}
		}
		
		// related images
		place.images = place.getRelatedNodes( 'annotation', 'outgoing' );
		
		// offset so images appear to be arrayed in a circle around the place
		o = place.images.length;
		if ( o == 1 ) {
			image = place.images[ 0 ];
			image.places.push( place );
			image.angleOffset = [ 0, 0 ];
			
		} else {
			angleUnit = ( 2 * Math.PI ) / o;
			for ( j = 0; j < o; j++ ) {
				image = place.images[ j ];
				image.places.push( place );
				angle = angleUnit * j;
				image.angleOffset = [ 0.25 * Math.cos( angle ), 0.25 * Math.sin( angle ) ];
				
			}
		}
		
		// cables that pass through this place
		var containerCables = place.getRelatedNodes( 'path', 'incoming' ); // does this get any other things besides cables?
		place.localCables = [];
		o = containerCables.length;
		for ( j = 0; j < o; j++ ) {
			cable = containerCables[ j ];
			if ( cable.cableGroup != null ) {
				place.localCables = place.localCables.concat( cable.cableGroupSiblings );
			} else {
				place.localCables.push( cable );
			}
		}

		// other places that the cables that pass through this place touch
		place.localCablePlaces = [];
		o = place.localCables.length;
		for ( j = 0; j < o; j++ ) {
			cable = place.localCables[ j ];
			secondaryPlaces = [];
			if ( cable.cableGroup != null ) {
				o = cable.cableGroupSiblings.length;
				for ( j = 0; j < o; j++ ) {
					sibling = cable.cableGroupSiblings[ j ];
					secondaryPlaces = secondaryPlaces.concat( sibling.getRelatedNodes( 'path', 'outgoing' ) );
				}
			} else {
				secondaryPlaces = cable.getRelatedNodes( 'path', 'outgoing' );
			}
			p = secondaryPlaces.length;
			for ( k = 0; k < p; k++ ) {
				secondaryPlace = secondaryPlaces[ k ];
				if ( place.localCablePlaces.indexOf( secondaryPlace ) == -1 ) {
					place.localCablePlaces.push( secondaryPlace );
				}
			}
		}
		
	}
	
}

SurfacingModel.prototype.postProcessImages = function() {

	var i, j, n, o, nodes, node, image;
	
	n = this.images.length;
	for ( i = 0; i < n; i++ ) {
		image = this.images[ i ];
		image.stories = [];
		nodes = image.getRelatedNodes( 'annotation', 'incoming' );
		o = nodes.length;
		for ( j = 0; j < o; j++ ) {
			node = nodes[ j ];
			if ( this.stories.indexOf( node ) != -1 ) {
				image.stories.push( node );
				node.images.push( image );
			}
		}
	}

}

SurfacingModel.prototype.postProcessThemes = function() {

	var i, j, n, o, nodes, node, theme;

	n = this.themes.length;
	for ( i = 0; i < n; i++ ) {
		theme = this.themes[ i ];
		theme.stories = [];
		theme.places = [];
		nodes = theme.getRelatedNodes( 'tag', 'outgoing' );
		o = nodes.length;
		for ( j = 0; j < o; j++ ) {
			node = nodes[ j ];
			if ( model.stories.indexOf( node ) != -1 ) {
				node.themes.push( theme );
				theme.stories.push( node );
			}
		}
	}
	
	this.addThemesToPlaces();

}

SurfacingModel.prototype.postProcessCables = function() {

	var i, j, n, o, nodes, node, cable;

	n = this.cables.length;
	for ( i = 0; i < n; i++ ) {
		cable = this.cables[ i ];
		cable.cableGroupSiblings = [];
		nodes = cable.getRelatedNodes( 'tag', 'incoming' );
		o = nodes.length;
		for ( j = 0; j < o; j++ ) {
			node = nodes[ j ];
			//if ( model.cableGroups.indexOf( node ) != -1 ) {
			if ( model.cableGroupNames.indexOf( node.slug ) != -1 ) {
				if ( node.children == null ) {
					node.children = [];
				}
				node.children.push( cable );
				console.log( "Got cable group" );
				cable.cableGroup = node;
				cable.cableGroupSiblings = node.getRelatedNodes( 'tag', 'outgoing' );
				break;
			}
		}
	}

}

SurfacingModel.prototype.getStoryGroupTitleFromStory = function(story) {

	if (model.storyGroups != null) {
		var tags = story.getRelatedNodes('tag', 'incoming');
		for (var i in tags) {
			if (model.storyGroups.indexOf(tags[i]) != -1) {
				return tags[i].getDisplayTitle();
			}
		}
	}
	
	var title = story.getDisplayTitle();
	
	return (title == null) ? '' : title;
}

SurfacingModel.prototype.getStoryGroupTextFromStory = function(story) {

	var storyGroupText = '';
	var text;

	if (model.storyGroups != null) {
		var tags = story.getRelatedNodes('tag', 'incoming');
		for (var i in tags) {
			if (model.storyGroups.indexOf(tags[i]) != -1) {
				var stories = tags[i].getRelatedNodes('tag', 'outgoing');
				for (var j in stories) {
					text = stories[j].current.content;
					if (text == null) text = '';
					storyGroupText += text+'<br/><br/>';
				}
				break;
			}
		}
	}
	
	return storyGroupText;
}

SurfacingModel.prototype.getStoryGroupImagesFromStory = function(story) {

	var storyGroupImages = [];

	if ( story != null ) {
		if (model.storyGroups != null) {
			var tags = story.getRelatedNodes('tag', 'incoming');
			for (var i in tags) {
				if (model.storyGroups.indexOf(tags[i]) != -1) {
					var stories = tags[i].getRelatedNodes('tag', 'outgoing');
					for (var j in stories) {
						storyGroupImages = storyGroupImages.concat( stories[ j ].getRelatedNodes( 'annotation', 'outgoing' ) );
					}
					break;
				}
			}
		}
	}
	
	return storyGroupImages;
}

SurfacingModel.prototype.getStoryGroupFromStory = function( sourceStory ) {

	if ( model.storyGroups != null ) {
		var tags = sourceStory.getRelatedNodes( 'tag', 'incoming' );
		for ( var i in tags ) {
			if ( model.storyGroups.indexOf( tags[ i ] ) != -1 ) {
				return tags[ i ];
			}
		}
	}
	
	return null;

}

SurfacingModel.prototype.getStoryGroupSiblingsFromStory = function( sourceStory ) {

	var story,
		siblings = [];

	if ( model.storyGroups != null ) {
		var tags = sourceStory.getRelatedNodes( 'tag', 'incoming' );
		for ( var i in tags ) {
			if ( model.storyGroups.indexOf( tags[ i ] ) != -1 ) {
				var stories = tags[i].getRelatedNodes( 'tag', 'outgoing' );
				for ( var j in stories ) {
					story = stories[ j ];
					if (( story != sourceStory ) && ( siblings.indexOf( story ) == -1 )) {
						siblings.push( story );
					}
				}
			}
		}
	}
	
	return siblings;
}

SurfacingModel.prototype.getStoryGroupsFromImage = function( image ) {

	var nodes, story, stories, storyGroup,
		storyGroups = [];
	
	if ( image != null ) {
		if (model.storyGroups != null) {
			nodes = image.getRelatedNodes( 'annotation', 'incoming' );
			for ( var i in nodes ) {
				story = nodes[ i ];
				if ( model.stories.indexOf( story ) != -1 ) {
					storyGroup = model.getStoryGroupFromStory( story );
					if ( storyGroups.indexOf( storyGroup ) == -1 ) {
						storyGroups.push( storyGroup );
					}
				}
			}
		}
	}
	
	return storyGroups;
}

SurfacingModel.prototype.getStoriesFromPlace = function( place ) {

	var i, j, image, node, nodes, storyGroup,
		stories = [];

	if ( place != null ) {
		if ( model.storyGroups != null ) {
			for ( i in place.images ) {
				image = place.images[ i ];
				nodes = image.getRelatedNodes( "annotation", "incoming" );
				for ( j in nodes ) {
					node = nodes[ j ];
					if ( model.stories.indexOf( node ) != -1 ) {	
						if ( stories.indexOf( node ) == -1 ) {
							stories.push( node );
						}
					}
				}
			}
		}
	}

	return stories;
}

SurfacingModel.prototype.getPlacesForTheme = function( theme ) {

	var i, j, k, n, o, p, items, item, images, image, annotations, annotation,
		places = [];
	
	// get items tagged by the theme
	items = theme.getRelatedNodes( 'tag', 'outgoing' );
	n = items.length;
	for ( i = 0; i < n; i++ ) {
	
		// if an item is a story, then
		item = items[ i ];
		if ( model.stories.indexOf( item ) != -1 ) {
		
			// get images annotated by the story
			images = item.getRelatedNodes( 'annotation', 'outgoing' );
			o = images.length;
			for ( j = 0; j < o; j++ ) {
			
				// get all annotations for the image
				image = images[ j ];
				annotations = image.getRelatedNodes( 'annotation', 'incoming' );
				p = annotations.length;
				for ( k = 0; k < p; k++ ) {
				
					// if an annotation is a place, then store it
					annotation = annotations[ k ];
					if ( model.places.indexOf( annotation ) != -1 ) {
						places.push( annotation );
					}
				
				}
			}
		}
		
	}

	return places;
}

SurfacingModel.prototype.addThemesToPlaces = function() {

	var i, j, n, o, place, themes, theme;
	
	n = this.places.length;
	for ( i = 0; i < n; i++ ) {
		place = this.places[ i ];
		themes = this.getThemesForPlace( place );
		place.themes = themes;
		o = themes.length;
		for ( j = 0; j < o; j++ ) {
			themes[ j ].places.push( place );
		}
	}

}

SurfacingModel.prototype.getThemesForPlace = function( place ) {

	var i, j, k, n, o, p, items, item, images, image, annotations, annotation,
		themes = [];

	if ( place != null ) {
		images = place.getRelatedNodes( 'annotation', 'outgoing' );
		n = images.length;
		for ( i = 0; i < n; i++ ) {
		
			image = images[ i ];
			annotations = image.getRelatedNodes( 'annotation', 'incoming' );
			o = annotations.length;
			for ( j = 0; j < o; j++ ) {
				
				annotation = annotations[ j ];
				
				if ( this.stories.indexOf( annotation ) != -1 ) {
					
					items = annotation.getRelatedNodes( 'tag', 'incoming' );
					p = items.length;
					for ( k = 0; k < p; k++ ) {
					
						item = items[ k ];
						if ( this.themes.indexOf( item ) != -1 ) {
							if ( themes.indexOf( item ) == -1 ) {
								themes.push( item );
							}
						}
					}
				}
			}
		}
	}

	return themes;
}
