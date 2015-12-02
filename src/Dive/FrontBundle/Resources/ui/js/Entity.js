/* Entity is the main object class for showing DIVE objects*/

function Entity(browser){
	// PARENTS
	this.row;
	this.browser = browser;

	// ELEMENTS
	this.$container;
	this.$header;
	this.$infobar;
	this.$scaler;
	this.$title;
	this.$relatedness;
	this.$buttons;
	this.$contentHolder;
	this.$indicator;
	this.$player;
	this.marker;
	this.$flippers;
	this.$goLeft;
	this.$goRight;
	this.$titleSpan;
	this.visual = new Visual(this);
	this.$commentIndicator = false;
	this.filter=null;

	// STATUS
	this.coloring = false;
	this.docked = false;
	this.inScreen = false;
	this.visualVisible = false;
	this.removed =false;
	this.focus = false;
	this.hidden = false;
	this.animating = false;
	this.STATUS_INROW = 0;
	this.STATUS_PRESENTATION = 1;
	this.status = this.STATUS_INROW;
	this.showTitle = false;

	this.animationComplete = 0;
	this.animationStart = 0;
	this.animationStep = 0;

	/*this.details = new Details(this);
	this.collections = new Collections(this);
	this.comments = new Comments(this);
	this.europeana = new Europeana(this);
	this.share = new Share(this);*/

	// DATA

	this.data = [];

	// LAYOUT

	this.width = this.minWidth;
	this.minWidth = 10;
	this.hiddenWidth = this.browser.hiddenWidth;

	this.relatedEntitiesCount = -1;
	this.relatedEntitiesFactor = 1;
	this.collectionCount = 0;

	this.left = 0;
	this.headerHeight = 240;

	// Helpers
	this.semanticZoomTimer;
	// finally
	this.init();
	this.hideImageFactor = (Global.touchSupport) ? 15 : 5;

	this.setSemantics();
}

// set semantic zoom levels, after init
Entity.prototype.setSemantics = function(){

	this.semantics = [
	[this.visual.getContainer(), this.hiddenWidth * this.hideImageFactor,false],
	[this.$infobar,200,false],
	[this.$buttons,500,false],
	[this.$scaler,window.innerWidth < 900 ? window.innerWidth - 25 : 900,false],
	//[this.filter.getContainer(),window.innerWidth-1,false],// < 675 ? window.innerWidth - 25 : 675,false],
	[this.$contentHolder, window.innerWidth < 900 ? window.innerWidth - 25 : 900,false],
	[this.$flippers, window.innerWidth - 25,false]
	];
	this.invertedSemantics = [
		[this.$indicator,window.innerWidth,false]
	];
}
/* INIT ENTITY */

/* init main */

Entity.prototype.init = function(){
	this.build();
	if (false && this.browser.allowAnimation){
		//this.$header.css('height',0).stop().show().velocity({ height: this.headerHeight}, this.browser.animationDuration);
	} else{
		this.$header.css('height',this.headerHeight);
	}
}


/* INTERACTION */

/* all interaction has been moved to row-level */


/* BUILD/HTML/LAYOUT */

/* build entity html */

Entity.prototype.build = function(){
	// container
	this.$container =$(document.createElement('div')).addClass('entity preloading').css('width',this.minWidth).data('entity',this);
	this.width = this.minWidth;
	this.animationComplete = 1;
	this.animationStart = this.width;
	this.animationStep = 0;
	// container.header
	this.$header = $(document.createElement('div')).addClass('header entity-color');
	this.$header.html(this.visual.getContainer());

	// flippers
	this.$flippers = $(document.createElement('div')).addClass('flippers-holder');
	this.$goLeft = $(document.createElement('div')).addClass('go-left flipper');
	this.$goRight = $(document.createElement('div')).addClass('go-right flipper');
	this.$flippers.html(this.$goLeft).append(this.$goRight);
	this.$header.append(this.$flippers);
	// container.header.infobar
	this.$infobar = $(document.createElement('div')).addClass('infobar');
	this.$icon = $(document.createElement('div')).addClass('icon entity-color');
	this.$infobar.html(this.$icon);
	this.$titleSpan = $(document.createElement('span')).addClass('t');
	this.$title = $(document.createElement('div')).addClass('title').html(this.$titleSpan);
	this.$relatedness = $(document.createElement('span')).addClass('entity-color r');
	this.$title.append(this.$relatedness);

	this.$infobar.append(this.$title);

	this.$buttons = $(document.createElement('div')).addClass('buttons').hide();

	for (var i=0, len = Global.config.contentButtons.length; i< len; i++){
		var $button = $(document.createElement('div')).addClass('button button-'+ Global.config.contentButtons[i][0].toLowerCase() + ' icon-'+ Global.config.contentButtons[i][0].toLowerCase()).data('content',Global.config.contentButtons[i][0].toLowerCase()).data('entity',this).attr('title',Global.config.contentButtons[i][1]);
		switch (Global.config.contentButtons[i][0]){
			case 'Comments':
			this.$commentCount = $('<span/>').addClass('count').text('0');
			$button.html(this.$commentCount);
			break;
			case 'Collections':
			this.$collectionCount = $('<span/>').addClass('count').text('0');
			$button.html(this.$collectionCount);
			break;
		}
		this.$buttons.append($button);
	}
	this.$infobar.append(this.$buttons);
	this.$header.append(this.$infobar);

	// container.header.scaler
	this.$scaler = $(document.createElement('div')).addClass('scaler').data('entity',this);

	this.$header.append(this.$scaler);

	this.$container.html(this.$header);

	// container.content
	this.$contentHolder = $(document.createElement('div')).addClass('content-holder');
	this.$container.append(this.$contentHolder);

	this.$indicator = $(document.createElement('div')).addClass('indicator entity-color');
	this.$container.append(this.$indicator);


}


/* WIDTH */

/* set minimum width */

Entity.prototype.setMinWidth = function(minWidth){
	this.minWidth = minWidth;
}

/* refresh width */
Entity.prototype.refreshWidth = function(){
	this.$container.velocity('stop');
	this.width = this.animationStart + (this.animationStep * this.animationComplete);
	this.animating = false;
	this.animationComplete = 1;

	if (this.animating){
	//	this.width = parseInt(this.$container.get(0).offsetWidth);
	}

}



/* get width */
Entity.prototype.getWidth = function(){
	if (this.hidden){
		return this.hiddenWidth;
	}
	return this.width;
}




/* set entity width */
Entity.prototype.setWidth = function(width, animate){
	if (this.hidden){
		this.width = width;
		return;
	}
	if (animate && this.row.allowAnimation){

 		this.animationStep = width - this.width;
 		this.animationStart = this.width;
 		this.animationComplete = 0;
		this.animating = true;
		this.width = width;

		// animation code moved to row level
		/*this.$container.velocity({tween: 1}, { // 'width': this.width
			easing: Global.easing,
			duration: this.getRow().animationDuration,
			progress: function(elements, percentComplete, timeRemaining, timeStart, tweenValue) {
                  this.animationComplete = tweenValue;
                  // set entity width
                  this.width = this.animationStart + (this.animationStep * this.animationComplete);
                  this.$container.css({ 'width': this.width });
            }.bind(this),
			complete: function(elements){
				this.animating = false;
				this.animationComplete = 1;
			}.bind(this)
		});*/
	} else{
		this.width = width;
		this.$container.stop().css({ 'width': this.width });
	}
}

Entity.prototype.applyWidth = function(percent){
	if (this.animating){
	this.width = this.animationStart + (this.animationStep * this.animationComplete);
    this.$container.css({ 'width': this.width });
	}
}

/* entity left in row */
Entity.prototype.setLeft = function(left){
	this.left = left;
}

/* check if current entity is a collection */
Entity.prototype.isCollection = function(){
	if (this.data.uid.indexOf('Collection:') > -1){
		return parseInt(this.data.uid.substr(11));
	} else{
		return false;
	}
}

/* SEMANTIC ZOOM */

// Entity.prototype.requestSemanticZoom = function(timeout){
// 	clearTimeout(this.semanticZoomTimer);
// 	this.semanticZoomTimer = setTimeout(this.semanticZoom.bind(this,this.width), timeout);
// }


/* handle semantic zoom for html elements */

Entity.prototype.semanticZoom = function (){
	var width = this.width;

	/* coloring mode adds color to entities*/
	if (width < 3){
		if (!this.coloring){
			this.$container.addClass('color-' + this.getType());
			this.coloring =true;
		}
	}else{
		if (this.coloring){
			this.$container.removeClass('color-' + this.getType());
			this.coloring = false;
		}
	}

	// row entitywidth
/*	if (this.row){
		if (this.row.filterActive && !this.hidden){
			width = this.width;
		} else{
			width = this.row.entityWidth;
		}
	}
*/

	if(this.hidden){
		width = this.hiddenWidth;
	}

	//this.setHeaderHeight(width);

	this.addVisual();

	// smallest mode
	if (width < 400){
		if (!this.showTitle) {
			this.$container.attr('title',this.getTitle());
			this.showTitle = true;
		}
	} else{
		if (this.showTitle){
			this.$container.removeAttr('title');
			this.showTitle = false;
		}
		if (this.status == this.STATUS_PRESENTATION && width < 0.99 * window.innerWidth){
			this.stopPresentation();
		}
	}

	var visible;

	// items to be hidden when width > x
	for(var i=0, len=this.invertedSemantics.length; i< len; i++){
		visible = width < this.invertedSemantics[i][1];
		if (this.invertedSemantics[i][2] != visible){
			this.showSemantic(this.invertedSemantics[i][0], visible)
			this.invertedSemantics[i][2] = visible;
		}
	}

	// items to be showed when width > x
	for(var i=0, len=this.semantics.length; i< len; i++){
		visible = width > this.semantics[i][1];
		if (this.semantics[i][2] != visible){
			this.showSemantic(this.semantics[i][0], visible)
			this.semantics[i][2] = visible;
		}
	}

	this.visual.semanticZoom(width);
}


Entity.prototype.addVisual = function(){
	/* request visual */
	if (this.getWidth() <= 10 * this.hideImageFactor){
		if (this.visualVisible){
			this.$header.addClass('entity-color');
			this.visualVisible = false;
		}
	} else{
		if (!this.visualVisible){
			this.$header.removeClass('entity-color');
			this.visualVisible = true;
		}
		if (this.row && !this.row.gestureAction){
			if (!this.visual.body && this.inScreen) { this.visual.addBody(); }
		}
	}
}


Entity.prototype.setHeaderHeight = function(width){
	var newHeight = 0;
	// if (this.hidden && width > 675){
	// newHeight = 59;
	// }
	// link width to row width
	//width = this.row.entityWidth * 1.5;
	width *= 1.5;
	// cap width
	if (width < 300){
		width = 300;
	}
	if (width > 600){
		width = 600;
	}
	var performScroll = false;
	if (this.status == this.STATUS_PRESENTATION){
		newHeight += window.innerHeight - 45;
		performScroll = true;
	} else{
		if (this.docked){
			newHeight += 140;
		} else{
			newHeight += width * 0.8;
		}
		// if (newHeight > this.headerHeight){
		// 	performScroll = true;
		// }
	}

	this.headerHeight = newHeight;

	/*if (false && this.row.allowAnimation){
		this.$header.velocity('stop').velocity({'height': this.headerHeight}, {
			easing: Global.easing,
			duration:this.browser.animationDuration
		});
	} else{*/
		this.$header.css('height',this.headerHeight);
	/*}*/

	if (performScroll){
		if (this.row.isLast()){
			this.row.browser.scrollToBottom();
		}
	}
}

/* indicate if the entity is visible in the screen */

Entity.prototype.setInScreen = function (inScreen){
	this.inScreen = inScreen;
	if (inScreen){
		this.addVisual();
	}
}

/* show or hide elements, called from semanticZoom() */

Entity.prototype.showSemantic = function(item,show,animate){
	if (item){
		if(show) {
			item.show();

		}else{
			item.hide();
		}
	}
}

/* unfocus an entity */

Entity.prototype.unFocus = function(){
	this.hideFlippers();
	this.focus = false;
	this.$container.removeClass('focus').addClass('unfocus');
	this.hideContent();
	this.visual.stop();
	this.showFilter();
}


/* focus an entity */

Entity.prototype.setFocus = function(){
	this.focus = true;
	if (this.width == window.innerWidth){
		this.showFlippers();
	}
	this.$container.removeClass('unfocus').addClass('focus');
	// show filters
	this.showFilter();
	// show source material
	if (this.status == this.STATUS_PRESENTATION){
		this.visual.showSource();
	}
}


Entity.prototype.getFilter = function(){
	//check filter
	if (!this.filter){
		// create filter
		this.filter = new Filter(this);
		// container.filters
		this.$container.append(this.filter.getContainer());

	}
	return this.filter;
}

/* show filter */
Entity.prototype.showFilter = function(){
	if (this.row.showFilter){
		this.getFilter().show();
	} else{
		this.getFilter().hide();
	}
}

/* dock current entity */

Entity.prototype.dock = function(){
	this.docked = true;
	this.setHeaderHeight(this.width);
	this.hideFlippers();
	this.visual.stop();
}

/* undock current entity */

Entity.prototype.undock = function(){
	this.docked = false;
	this.setHeaderHeight(this.width);
	this.showFlippers();
}

/* show current entity */

Entity.prototype.show = function(){
	this.hidden = false;
	this.setWidth(this.width, true);
	this.$container.removeClass('hidden');
	if (this.marker){
		this.marker.show();
	}
}

/* hide current entity */

Entity.prototype.hide = function(){
	this.hidden = true;
	this.semanticZoom(this.hiddenWidth);
    this.visual.stop();
	if (this.row.allowAnimation){
		this.$container.velocity('stop').velocity({ 'width': this.hiddenWidth },  {
			easing: Global.easing,
			duration:this.browser.animationDuration
		} );
	} else{
		this.$container.css('width', this.hiddenWidth);
	}
	this.$container.addClass('hidden');
	if (this.marker){
		this.marker.hide();
	}
}

/* FLIPPERS */

/* hide flippers */
Entity.prototype.hideFlippers = function(){
	this.$flippers.hide();
	this.semantics[5][2] = false;
}

/* show flippers */
Entity.prototype.showFlippers = function(){
	this.semantics[5][2] = true;
	this.$flippers.show();
	this.$goLeft.show();
	this.$goRight.show();
	var index = this.row.visibleEntities.indexOf(this);
	if (index == 0){
		this.$goLeft.hide();
	}
	if (index == this.row.visibleEntities.length - 1){
		this.$goRight.hide();
	}
}


/* PRESENTATION MODE */

/* Toggle presentation mode  */

Entity.prototype.togglePresentation = function(){
	if (this.status == this.STATUS_PRESENTATION){
		this.row.setPresentation(false,this);
		this.stopPresentation();
		console.log("Entity Presentation Stop");
		AjaxLog.info('Entity Presentation Stop','Entity: ' + this.getUID());
	} else{
		this.row.browser.scrollTo($(this.row.getContainer()).position().top - $('#topbar').height() + $('#content').position().top);
		this.startPresentation();
		this.row.setPresentation(true, this);
		this.visual.start();
		console.log("Entity Presentation start");
		AjaxLog.info('Entity Presentation Start','Entity: ' + this.getUID());
	}
}

/* Set presentation mode */
Entity.prototype.setPresentation = function(enabled){
	if (enabled){
		this.startPresentation();
	} else{
		this.stopPresentation();
	}
}

/* Start presentation */
Entity.prototype.startPresentation = function(){
	this.status = this.STATUS_PRESENTATION;
	this.setHeaderHeight(this.width);
}

/* Stop presentation */
Entity.prototype.stopPresentation = function(){
	this.status = this.STATUS_INROW;
	this.setHeaderHeight(this.width);
}

/* HELPERS */

/* Get unique id of entity (http://purl.org/collections/nl/dive/MY_UID) */

Entity.prototype.getUID = function(){
	return this.data.uid;
}

/* Remove any existing entity class from container */

Entity.prototype.removeEntityClass = function(){
	this.$container.attr('class',
		function(i, c){
			if (!c){ return false;}
			return c.replace(/\bentity-\S+/g, '');
		});
}


/* set data type */
Entity.prototype.setType = function(s){
	if (this.data['type'] != s){
		this.$container.removeClass('entity-' + this.data['type']).addClass('entity-' + s);
	}
	this.data['type']  = s;
}

/* get data type */
Entity.prototype.getType = function(){
	return this.data['type'];
}

/* get startDate */
Entity.prototype.getStartDate = function(){
	return typeof this.data.date.start == 'object' ? this.data.date.start : moment(this.data.date.start);
}

/* get endDate */
Entity.prototype.getEndDate = function(){
	return typeof this.data.date.end == 'object' ? this.data.date.end : (this.data.date.end ? moment(this.data.date.end) : this.getStartDate());
}



/* get data */
Entity.prototype.getData = function(){
	return this.data;
}

/* set title */

Entity.prototype.setTitle = function(s){
	this.$titleSpan.text(s);
	this.$container.attr('title',s);
}

/* get entity title */

Entity.prototype.getTitle = function(){
	return this.data.title;
}

/* get entity container */

Entity.prototype.getContainer = function(){
	return this.$container;
}

/* remove entity */

Entity.prototype.remove = function(){
	this.$container.remove();
}

/* set row that holds the entity */

Entity.prototype.setRow = function(row){
	this.row = row;
	this.$container.data('row', this.row);
}

/* get row the holds the entity */

Entity.prototype.getRow = function(){
	return this.row;
}

/* set timeline marker that represents this entity */
Entity.prototype.setMarker = function(marker){
	this.marker = marker;
}


/* DATA */


/* Update title, description and public info of entities */

Entity.prototype.update = function(title,description,parameter){

	this.data.title = title;
	this.$title.text(title);
	
	this.data.description = description;
	if (this.details.$description) {	this.details.$description.text(description ? description : 'no-description'); }
	if (this.data.type == 'Collection'){
		this.data['public'] = parameter;	
	} else{
		this.setType(parameter);
	}
	
}

/* Set data and apply changes to entity html */

Entity.prototype.setData = function(data){
	this.data = data;
	this.$container.removeClass('preload');
	this.visual.update();
	this.setTitle(data.title);
	this.$title.attr('title','DEV UID: ' + data.uid);
	this.removeEntityClass();
	this.$container.addClass('entity-' + data.type);
}





/* COUNTERS */

/* Show comment count in infobar */

Entity.prototype.setCommentCount = function(count,owner){
	var $commentButton = this.$commentCount;
	$commentButton.html('').text(count);
	if (owner >0){
		$commentButton.prepend($('<span/>').addClass('owner').text(owner + ' / '));
	}

	// show comment indicator
	if (count > 0){
	if (!this.$commentIndicator){
		// create comment indicator
		this.$commentIndicator = $('<div/>').addClass('comment-indicator');
		this.$header.append(this.$commentIndicator);
		this.invertedSemantics.push([this.$commentIndicator,675,false]);
	}
	this.$commentIndicator.attr('title','Comments: ' + $commentButton.text());
	this.$commentIndicator.show();
} else{
	if (this.$commentIndicator){
		this.$commentIndicator.hide();
	}
}

}

/* Show collection count in infobar */
Entity.prototype.setCollectionCount = function(count,owner){
	var $collectionButton = this.$collectionCount;
	this.collectionCount = count;
	$collectionButton.html('').text(count);
	if (owner >0){
		$collectionButton.prepend($('<span/>').addClass('owner').text(owner + ' / '));
	}
	this.updateRelatedLabel();
}

/* CONTENT */

/* Show content container */
Entity.prototype.showContent = function(content){
	// create content holder
	switch(content){
			case "details": if (!this.details) { this.details = new Details(this); this.$contentHolder.append(this.details.getContainer()); } break;
			case "collections": if (!this.collections) { this.collections = new Collections(this); this.$contentHolder.append(this.collections.getContainer()); } break;
			case "comments": if (!this.comments) { this.comments = new Comments(this); this.$contentHolder.append(this.comments.getContainer()); } break;
			case "europeana": if (!this.europeana) { this.europeana = new Europeana(this); this.$contentHolder.append(this.europeana.getContainer()); } break;
			case "share": if (!this.share) { this.share = new Share(this); this.$contentHolder.append(this.share.getContainer()); } break;
	}
	// show
	if (this.$contentHolder.find('.content-'+content + '.active').length > 0){
		//hide current content
		this.$contentHolder.show().find('.active').removeClass('active').velocity('stop').velocity("slideUp",  {
			easing: Global.easing,
			duration:this.browser.animationDuration
		});
		this.$buttons.find('.button').removeClass('inactive');
	} else{
		// hide other content, show new content
		this.$buttons.find('.button').addClass('inactive');
		this.$buttons.find('.button-'+content).removeClass('inactive');
		this.$contentHolder.show().find('.active').removeClass('active').hide();
		var $contentElement = this.$contentHolder.find('.content-'+content).addClass('active').css('height','auto');
		var content = $contentElement.data('content');
		if (content.loaded){
			$contentElement.velocity('stop').velocity("slideDown",  {
			queue: false,
			easing: Global.easing,
			duration:this.browser.animationDuration
		});
		} else{
			//$contentElement.show();
		}
		content.show();
		AjaxLog.info('Content Show','Content: ' + content.constructor.name);
	}
}

/* Hide all content containers */
Entity.prototype.hideContent = function(){
	this.$buttons.find('.button').removeClass('inactive');
	this.$contentHolder.find('.active').removeClass('active').velocity('stop').velocity("slideUp",  {
		easing: Global.easing,
		duration:this.browser.animationDuration
	});
}


/* RELATEDNESS */

/* Related Preload */
Entity.prototype.setRelated = function(data){
	if (data && data.data){
		this.data.relatedEntities = data.data;
		this.relatedEntitiesCount = data.data.length;
		this.updateRelatedLabel();
		if (this.row){
			this.row.calcRelated();
		}
	}
	this.$container.removeClass('preloading');
}


/* update related count label */
Entity.prototype.updateRelatedLabel = function(){
	value = this.relatedEntitiesCount + this.collectionCount;
	this.$relatedness.text(value > 0 ? value : 0).show();
}

/* update indirect related counter in filter */
Entity.prototype.updateIndirectCount = function(value){
	this.getFilter().setIndirect(value > 0 ? value : 0);
}



function benchMark(func,loops,description){
	var start = new Date().getTime();
	for(var i = 0; i<loops;i++){
		func();
	}
	console.log("BenchMark: ",new Date().getTime()-start,"ms",description);

}
