/* a Row holds one or more entities, often related by another entity */

function Row(browser, entity){
	// PARENTS
	this.browser = browser;
	this.entity = entity;

	// DOM
	this.$container;
	this.$scroller;
	this.timeline = new Timeline(this);


	// LAYOUT
	this.width = 0;
	this.scrollDragRange = 40;
	this.entityWidth = 0;
	this.oldEntityWidth = 0;
	this.minWidth = 1;
	this.hiddenWidth = this.browser.hiddenWidth;
	this.snapFactor = 0.90;
	this.scaleFactor = 0.75;
	this.zoomFactor = 2.0;
	this.relatedEntitiesFactor = 1;
	this.filterEntityMinSize = 100;
	this.filterActive = false;

	// STATUS
	this.removed =false;
	this.scrollLeft = 0;
	this.snapEntity = false;
	this.showFilter = false;
	this.currentEntity = null;
	this.forceTouch = false;
	this.relatedTimer = null;
	this.docked = false;
	this.relatedness = '';
	this.animationDuration = this.browser.animationDuration;
	this.allowAnimation = this.browser.allowAnimation;
	this.type = '';
	this.zoomTimer = 0;
	this.filter = null;

	// ENTITIES
	this.entities = [];
	this.entityIndex = [];
	this.visibleEntities = [];

	this.init();
}

/* INIT */

/* create Row object */
Row.prototype.init = function(){
	this.build();
	this.$container.data('browser',browser);
	this.$container.data('row',this);
	this.$scroller.data('row',this);
	this.initInteraction();
}

/* build html */

Row.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('row').addClass('entities').addClass('loading');
	this.$scroller = $(document.createElement('div')).addClass('scroller').data('width',window.innerWidth);
}

Row.prototype.addBody = function(){
	this.$container.append(this.$scroller);
	this.$container.append(this.timeline.getContainer());
}


/* INTERACTION */

/* init interaction */

Row.prototype.initInteraction = function(){
	this.zoomListener();
	this.dragListener();
	this.entityListener();
}




Row.prototype.entityListener = function(){

	/* grow entity */
	this.$container.on('click', '.header', function(e){
		if (this.gestureAction){ return; }
		var entity = $(this).closest('.entity').data('entity');
		if (entity.getRow().getScroller().hasClass('ui-draggable-dragging') || entity.hidden ){
			return;
		}
		entity.getRow().growEntity(entity, true);
	});


	/* buttons */
	this.$container.on('click','.buttons .button', function(e){
		e.preventDefault();
		e.stopPropagation();
		var entity = $(this).data('entity');
		entity.showContent($(this).data('content'));
	});


	/* buttons */
	this.$container.on('click','.filters input', function(e){
		var filter = $(this).closest('.filters').data('filter');
		filter.initAutoComplete();
	});

	/* scaler button */
	this.$container.on('click','.scaler', function(e){
		e.preventDefault();
		e.stopImmediatePropagation();
		var entity = $(this).data('entity');
		entity.getRow().growEntity(entity, false);
		entity.togglePresentation();
	});

	/* sources links */
	this.$container.on('click','.sources span', function(e){
		e.preventDefault();
		e.stopPropagation();
		document.location.href = $(this).text();
	});



	/* play-button */
	this.$container.on('click', '.player-button', function(e){
		var visual = $(this).data('visual');
		visual.playButtonClick();
		visual.entity.getRow().growEntity(visual.entity, false);
		e.preventDefault();
		e.stopPropagation();
	});


	/* go-left*/
	this.$container.on('click', '.go-left', function(e){
		this.goLeft();
		e.preventDefault();
		e.stopPropagation();
	}.bind(this));

	/* go-right*/
	this.$container.on('click', '.go-right', function(e){
		this.goRight();
		e.preventDefault();
		e.stopPropagation();
	}.bind(this));



}



Row.prototype.calcRelated = function(){
	if (!this.entities) { return; }

	this.totalRelations = 0;
	var preloadedEntities = 0;
	for (var i=0, len=this.entities.length; i<len;i++){
		if (this.entities[i].relatedEntitiesCount > -1){
			this.totalRelations += this.entities[i].relatedEntitiesCount;
			preloadedEntities++;
		}
	}

	if (this.entity){
		this.entity.updateIndirectCount(this.totalRelations);
	} else{
		Global.search.filter.setIndirect(this.totalRelations);
	}
	// apply if total || step of 25 entities
	if (preloadedEntities != this.entities.length && preloadedEntities % 2 != 0) { return; }


	// make changes to dom
	this.relatedEntitiesFactor = this.totalRelations / preloadedEntities;

	if (preloadedEntities == this.entities.length){
		this.loadAutoComplete();
	}

	if (!this.zoomTimer){
		// default call (only once in 200 ms allowed)
		this.zoomTimer = setTimeout(function() { this.zoomAction(1,window.innerWidth / 2, true); }.bind(this), 200);
	} else{
		// direct call if all entities have been preloaded
		if (preloadedEntities == this.entities.length){
			this.zoomAction(1,window.innerWidth / 2, true);
		}
	}

}


/* auto complete */
Row.prototype.loadAutoComplete = function(){
	var list = [];
	for (var i=0, len=this.entities.length; i<len;i++){
		if (list.indexOf(this.entities[i].getTitle()) == -1){
			list.push(this.entities[i].getTitle());
		}
	}
	if (!this.filter){
		this.setFilter();
	}
	if (this.filter){
		this.filter.loadAutoComplete(list);
	}
}


/* zoom entities by a factor */

Row.prototype.zoomAction = function(factor, midPos, animate){
	// clear zoom timer
	clearTimeout(this.zoomTimer);


	this.zoomTimer = 0;

	if (!this.entities){ return; }

	// undock on zoom
	if (this.docked){
		this.undock();
	}
	// variables
	animate = animate && this.allowAnimation;
	midPos = midPos || window.innerWidth / 2;
	var curWidth = 0;
	var newWidth = 0;
	var width = Math.round(this.entityWidth * factor);

	// limit width
	if (width < this.minWidth){
		width = this.minWidth;
	}
	if (width > window.innerWidth * this.snapFactor && factor >= 1 && !this.gestureAction){
		useCenter = true;
		width = window.innerWidth;
		this.snapEntity = true;
		if (!this.showFilter){
			for (var i=0, len = this.entities.length; i<len; i++){
				this.entities[i].getFilter().show();
			}
		}
		this.showFilter = true;
	} else{
		this.snapEntity = false;
		if (this.showFilter){
			for (var i=0, len = this.entities.length; i<len; i++){
				this.entities[i].getFilter().hide();
			}
		}
		this.showFilter = false;

	}

	if (this.filterActive && width < this.filterEntityMinSize){
		console.info('filtering');
		width = this.filterEntityMinSize;
	}

	this.setEntityWidth(width);

	var innerWidthRatio = this.entityWidth / window.innerWidth;

	var midEntity = null;
	var midEntityDistance = window.innerWidth;
	var startPos = 0;
	var midNewWidth = 0;
	var midCurWidth = 0;
	this.scrollLeft = parseInt(this.$scroller.css('left'));
	// stop animation, refresh width
	for (var i=0, len = this.entities.length; i<len; i++){
		if (!this.entities[i].hidden && this.entities[i].animating){
			this.entities[i].refreshWidth();
		}
	}
	// apply zoom to entities
	for (var i=0, len = this.entities.length; i<len; i++){
		if (this.entities[i].hidden){
			curWidth += this.entities[i].hiddenWidth;
			newWidth += this.entities[i].hiddenWidth;
			startPos = Math.abs(this.scrollLeft + curWidth - (this.entities[i].hiddenWidth / 2) - midPos);
		} else{
			curWidth += this.entities[i].width;
			startPos = Math.abs(this.scrollLeft + curWidth - (this.entities[i].width / 2) - midPos);
			// calc related entity factor
			if (this.relatedEntitiesFactor != 1 && this.relatedEntitiesFactor > 0 && this.entities[i].relatedEntitiesCount > -1){
				fwidth = width * ((1.5 + (this.entities[i].relatedEntitiesCount/this.relatedEntitiesFactor))/2.5);
				fwidth = innerWidthRatio * width + (1-innerWidthRatio) * fwidth;
			} else{
				fwidth = width;
			}
			if (fwidth > window.innerWidth){ fwidth = window.innerWidth; }

			if (this.filterActive && fwidth < this.filterEntityMinSize){
				fwidth = this.filterEntityMinSize;
			}
			newWidth += fwidth;
			// set width
			this.entities[i].setWidth(fwidth,animate);
		}
		// get center entity
		if (startPos < midEntityDistance){
			midEntityDistance = startPos;
			midEntity = this.entities[i];
			midNewWidth = newWidth;
			midCurWidth = curWidth;
		}
		// set entity left
		this.entities[i].setLeft(newWidth);
		//this.entities[i].$container.css('transform','scale(0.90)');
	}

	//if (midEntity){
	//	midEntity.$container.css('transform','scale(1)');
	//}
	this.width = newWidth;
	this.semanticZoom();
	/* set row left */
	var left = this.scrollLeft;
	var dWidth = (midCurWidth - midNewWidth);
	var factor = (left + (window.innerWidth)/2) / midCurWidth;
	factor = (-left + midPos) / midCurWidth;
	this.setLeft(left + factor * dWidth, animate);

		// animate entity width
		this.animateEntityWidth();

	}


	Row.prototype.setEntityWidth = function(width){
		this.oldEntityWidth = this.entityWidth;
		this.entityWidth = width;
	}


	/* listen to mouse/touch drag events on row */
	Row.prototype.dragListener = function(){
		if (this.forceTouch || Global.touchSupport){
			this.lastDrag = 0;
			var options = {
				dragLockToAxis: true,
				dragBlockHorizontal: true
			};
			this.$container
			.hammer({
				drag: true,
				dragBlockHorizontal: false,
				dragBlockVertical: false,
				dragDistanceCorrection: true,
				/*dragLockMinDistance: 25,*/
				dragLockToAxis: true,
				dragMaxTouches: 1,
				dragMinDistance: 0,
				preventDefault: false
			})
			.on("dragleft dragright", function(e){
				var newLeft = parseInt(this.$scroller.css('left')) + (e.gesture.deltaX - this.lastDrag);
				this.$scroller.stop().css('left',newLeft);
				this.lastDrag = e.gesture.deltaX;
				e.gesture.preventDefault();
			}.bind(this))
			.on("dragstart",function(e){
				if (this.docked){ return false;}
				this.lastDrag = 0;
			}.bind(this))
			.on("dragend",function(e){
				this.setLeft(parseInt(this.$scroller.css('left')),true)
			}.bind(this))
			;
		} else{
			this.dragY = 0;
			this.dragX = 0;
			this.dragScroll = false;

			this.$scroller.draggable({
				axis: "x",
				start: function(e) {
					$('body').addClass('drag-scrolling');
					this.dragScroll = true;
					this.dragY = e.clientY;
					this.dragX = e.clientX;
					this.$scroller.stop();
				}.bind(this),
				drag: function(e){
					if (this.docked || (this.dragScroll && Math.abs(e.pageX - this.dragX) < this.scrollDragRange))
					{
						var scrollAmount = this.dragY - e.clientY;
						this.browser.scrollBy(scrollAmount);
						this.dragY = e.clientY;
					} else{
						this.dragScroll = false;
					}
				}.bind(this),
				stop: function(e){
					$('body').removeClass('drag-scrolling');
					$(this).data('row').setLeft(parseInt($(this).css('left')),true);
				}
			});
		}
	}


	/* listen to scrollwheel/pinch events on row */

	Row.prototype.zoomListener = function(){
		var scrollEvent = 'mousewheel';
// mouse scroll event
if (this.forceTouch || Global.touchSupport){
	this.lastScale = 1;
	this.focusScale = 1;
	this.scaleTimer = null;
	this.gestureAction = false;
	this.gestureCenter = null;
	var options = {
		preventDefault: false
	}
	this.$container
	.hammer(options)
	.on("pan", function() { } )
	.on("gesturestart ", function(e){
		clearTimeout(this.relatedTimer);
		this.lastDrag = 0;
		this.lastScale = 1;
		this.gestureAction = true;
		this.$container.addClass('gesture-pinch')
		clearTimeout(this.scaleTimer);
	}.bind(this))
	.on("pinch", function(e){
		clearTimeout(this.relatedTimer);
		e.gesture.preventDefault();
		this.scaleFactor = 1;
		this.focusScale = e.gesture.scale;
		var factor = 1 + (this.focusScale - this.lastScale);// * this.scaleFactor;
		this.lastScale = this.focusScale;
		this.zoomAction(factor, e.gesture.center.clientX, false);
	}.bind(this))
	.on('gestureend',function(e){
		this.scaleTimer = setTimeout(function(){
			this.gestureAction = false;
			this.zoomAction(1,window.innerwidth /2, false);
		}.bind(this), 100);
		this.$container.removeClass('gesture-pinch');
		for(var i = 0, len = this.visibleEntities.length; i < len; i++){
			//this.visibleEntities[i].addVisual();
			//this.visibleEntities[i].semanticZoom(this.visibleEntities[i].width);
		}
	}.bind(this));

} else{
	this.$container.on(scrollEvent,function(e){
		// todo, limit max amount of event for apple mice
		var row = $(this).data('row');
		var factor = row.zoomFactor - (row.zoomFactor / 10) *  (row.entityWidth / ( 0.4 * window.innerWidth));
		if (e.originalEvent.wheelDelta < 0){
			factor = 1/factor;
		}
		row.zoomAction(factor,e.pageX,true);
		e.preventDefault();
		e.stopImmediatePropagation();
	});
}

}

/* HELPERS */

Row.prototype.setType = function(s){
	this.type = s;
	this.$container.find('')
}

Row.prototype.getType = function(){
	return type;
}

Row.prototype.setTitle = function(s){
	this.$title.text(s);
}

Row.prototype.getTitle = function(){
	this.$title.text();
}

Row.prototype.getContainer = function(){
	return this.$container;
}

Row.prototype.getScroller = function(){
	return this.$scroller;
}

Row.prototype.remove = function(){
	console.info("removed",this);
	this.$container.remove();
	this.removed = true;
	// set entities to removed for call back functions
	for(var i=0,len=this.entities.length; i<len;i++){
		this.entities[i].removed = true;
	}
	this.entities = [];
}

Row.prototype.getBrowser = function(){
	return this.browser;
}

/* returns related entity (if entities are related items of another entity) */

Row.prototype.getEntity = function(){
	return this.entity;
}

/* ENTITIES */

/* add entity to the row */
Row.prototype.addEntity = function(entity){
	if (!this.entities){ return false; }
	this.entityIndex[entity.data.uid] = entity;
	this.entities.push(entity);
	entity.setRow(this);
	this.$scroller.append(entity.$container);
	return entity;
}

/* check if entity exist in row */

Row.prototype.hasEntity = function(entity){
	if (typeof(this.entityIndex[entity.getUID()]) != 'undefined'){
		return true;
	}
	return false;
}


/* check if entity uid exist in row */

Row.prototype.hasEntityUID = function(uid){
	if (typeof(this.entityIndex[uid]) != 'undefined'){
		return true;
	}
	return false;
}


/* get list of entitiy UIDS */

Row.prototype.getEntityUIDS = function(){
	var uids = new Array();
	for(var i=0, len = this.entities.length; i<len; i++){
		uids.push(this.entities[i].getUID());
	}
	return uids;
}


/* DATA */

/* retrieve data and add resulting entities to the row */

Row.prototype.addResults = function(data){
	if (this.removed) { return; }
	if (data && data.data){

		var ms = +new Date();
		var mid;
		var results = data.data;
		var entity;
		var index = 0;
		console.log(data);
		var len = data.data.length;
		var processStart = +new Date();
		var processNow = processStart;

		var processDuration = 100;
		var that = this;

		var minWidth = window.innerWidth / data.data.length;


		function eventSort(a,b) {return (a.event > b.event) ? 1 : ((b.event > a.event) ? -1 : 0);}

		/* sort data by related event*/
		if (data.data && data.data.sort){
			data.data.sort(eventSort );
		}


		function doneLoading(){
			console.log('Row building took: ' , +new Date() - ms , 'ms for ', that.entities ? that.entities.length : null, ' entities. Per entity: ',that.entities.length > 0 ?(+new Date() - ms) / that.entities.length : null );
			that.loadCollections();
		}



		function processEntities(){

			// loop array
			while(index<len && processStart-processNow < processDuration){
				if(!that.hasEntityUID(data.data[index].uid)){
					entity = new Entity(this.browser);
					entity.minWidth = this.minWidth;
					entity.setData(data.data[index]);
					that.addEntity(entity);
				}
				index++;
				processDuration = +new Date();
			}
			// check to continue or finish up
			if (index<len){
				setTimeout(processEntities,2);
			} else{
				doneLoading();
			}
		}
		// call process entities
		processEntities();

	}

}

Row.prototype.checkAllowAnimation = function(){
	if (Global.allowAnimation && this.entities && this.entities.length > 100){
		this.allowAnimation = false;
	} else{
		this.allowAnimation = this.browser.allowAnimation;
	}
}

Row.prototype.fromSearch = function(){
	return this.relatedness == 'Search';
}

Row.prototype.loadCollections = function(){
	if (this.fromSearch()){
		Global.data.getSearchCollections(Global.search.keywords,0,this.entityLimit,this.addCollectionResults.bind(this),this.finishedLoading.bind(this));
	} else{
		Global.data.getEntityCollections(this.entity.getUID(),0,this.entityLimit,this.addCollectionResults.bind(this),this.finishedLoading.bind(this));
	}
}


Row.prototype.checkSingleItem = function(){
	// only 1 entity? make it the current entity
	if (this.entities.length == 1){
		if(Global.preload.rowPreload){
			this.setCurrentEntity(this.entities[0],true);
			Global.preload.rowPreload = false;
		} else{
			this.makeCurrentEntity(this.entities[0]);
		}
	}
	Global.preload.rowPreload = false;
}

Row.prototype.addCollectionResults = function(data){
	if (this.removed) { return; }
	var ms = +new Date();
	var mid;
	var results = data.data;
	var resultsAdded = false;
	var data, entity;

	if (results && results.length){
		/* populate data */
		for(var i=0, len = results.length; i<len && i < this.browser.entityLimit; i++){
			data = new DataEntity();
			data.uid= 'Collection:' + results[i].id;
			data.type = 'Collection';
			data.title = results[i].title;
			data.description = results[i].description;
			data.public = results[i]['public'];

			resultsAdded = true;
			entity = new Entity(this.browser);
			entity.setData(data);
			this.addEntity(entity);
		}
	}
	console.log('Row building took: ' , +new Date() - ms , 'ms for ', this.entities ? this.entities.length : null, ' entities. Per entity: ',this.entities ?(+new Date() - ms) / this.entities.length : null );

	this.checkSingleItem();

	if (!resultsAdded && this.entities.length == false){
		this.$scroller.append($(document.createElement('div')).addClass('noresults').text('No related entities found :(').css('width',window.innerWidth));
	}

	this.finishedLoading();
}


/* row finished loading new entities */

Row.prototype.finishedLoading = function(){
	this.checkSingleItem();
	if (!this.entities){
		return false;
	}
	this.setFilter();
	// set visible
	this.setVisibleEntities();
	// add body to DOM
	this.addBody();

	if (!this.entities.length){
		this.$container.removeClass('loading');
	} else {
		// calc hiddenWidth
		var minWidth  = window.innerWidth  / this.entities.length;
		if (minWidth < this.hiddenWidth){
			this.hiddenWidth = minWidth;
			for(var i =0, len = this.entities.length; i<len; i++){
				this.entities[i].hiddenWidth = minWidth;
				this.entities[i].minWidth = minWidth;
			}
		}
		// load timeline
		this.timeline.loadRow(this);
		this.timeline.show();
		// remove loader
		setTimeout(function(){
			this.$container.removeClass('loading');
		}.bind(this), this.animationDuration);
	}
	this.allowAnimation = false;
	// calculate minimum width
	this.calcMinWidth(true);

	this.checkAllowAnimation();

	// calculate entity width
	this.calcWidth();
	// scroll to bottom
	if (this.entity && this.entity.status == this.entity.STATUS_INROW){
		setTimeout(this.browser.scrollToBottom.bind(this.browser), 50);
	}
	// set left to 0 and fix entity layout
	this.setLeft(0);

	// load comment/collection count
	this.loadCounts();

	// preload related entities for each entity after a little timeout
	setTimeout(function(){this.preloadRelatedEntities();}.bind(this), this.animationDuration);
}

/* for each of the entities preload related entities */
Row.prototype.preloadRelatedEntities = function(){
	if (!this.entities) { return; }
	var index = 0;
	for (var len=this.entities.length, i = len-1; i >= 0; i--){
		//index = (len-i-1);
		if (this.entities[i].isCollection()){
			this.browser.data.getCollection(this.entities[i].getUID().replace('Collection:',''), this.entities[i].setRelated.bind(this.entities[i]));
		} else{
			this.browser.data.getRelated(this.entities[i].getUID(), 0,this.browser.entityLimit, this.entities[i].setRelated.bind(this.entities[i]),this,false, i!=0);
		}
	}
}

/* for each of the entities preload the number of related comments and collections */
Row.prototype.loadCounts = function(){
	if (!this.entities.length) { return; }
	this.browser.data.getEntityCounts(this.getEntityUIDS(), function(data){
		if (data.results){
			for (var i in data.data){
				this.entityIndex[i].setCommentCount(
					data.data[i]['comments']['count'],
					data.data[i]['comments']['owner']
					);
				this.entityIndex[i].setCollectionCount(
					data.data[i]['collections']['count'],
					data.data[i]['collections']['owner']
					);
			}
		}
	}.bind(this))
}


/* ENTITIES - VISIBILITY */

/* get a list of visible entities */

Row.prototype.setVisibleEntities =function(){
	this.visibleEntities = [];
	for (var i=0, len=this.entities.length; i < len; i++){
		if (!this.entities[i].hidden) {
			this.visibleEntities.push(this.entities[i]);
		}
	}
}

/* grow entity to viewport width and make it current selection */
Row.prototype.growEntity = function(entity, requestRelated){
	this.showFilter=true;
	if (this.gestureAction ){
		return;
	}
	// grow all entities to window width
	for (var i=0, len = this.visibleEntities.length; i<len; i++){
		this.visibleEntities[i].setWidth(window.innerWidth,true);
	}

	this.semanticZoom();

	entity.setFocus();
	this.calcWidth();
	this.snapEntity = true;
	// scroll to item;
	var left = 0;
	for (var i = 0, len = this.entities.length; i <len; i++){
		if (this.entities[i] == entity){
			break;
		} else{
			left += this.entities[i].getWidth();
		}
	}
	this.setLeft(-left, true);
	// animate entity width
	this.setEntityWidth(window.innerWidth);
	this.animateEntityWidth();
	this.setCurrentEntity(entity,requestRelated);
}
/* request related entities */
Row.prototype.requestRelated = function(entity){
	clearTimeout(this.relatedTimer);
	this.relatedTimer = setTimeout(
		function(){
			console.info('Requesting related items for: ', entity.getUID());
			this.getBrowser().addRelated(entity);
			AjaxLog.info('Related Entities',entity.getUID());
		}.bind(this),
		this.animationDuration * 1.2);
}

/* set current entity */
Row.prototype.setCurrentEntity =function(entity,requestRelated){
	this.showFilter = true;
	if (entity != this.currentEntity){
			// add visual
			entity.setInScreen(true);
			entity.addVisual();

			// set current entity
			this.currentEntity = entity;
			AjaxLog.info('Current Entity',entity.getUID());

			// manage focus
			this.unFocusAll();
			entity.setFocus();

			// request related entities
			if (requestRelated){
				this.requestRelated(entity);
			}

			// make current
			this.makeCurrentEntity(entity);
			entity.showFilter();
			// auto start image
			if (entity.status == entity.STATUS_PRESENTATION){
				entity.visual.delayedStart();
			}

			// add threshold to dragging
			if(!Global.touchSupport){
				this.$scroller.draggable( "option", "distance", 20 );
			}

			// call semantic zoom
			entity.semanticZoom(window.innerWidth);

			Global.hashPath.setEntity(entity);
		}
	}

	/* ENTITIES - FOCUS */

	/* make current entity */
	Row.prototype.makeCurrentEntity = function(entity){
		this.$container.find('.entity.current').removeClass('current');
		entity.$container.addClass('current');
	}



	/* unfocus all entities */

	Row.prototype.unFocusAll = function(){
		for (var i = 0, len = this.entities.length; i<len; i++){
			this.entities[i].unFocus();
		}
	}
	/* focus all entities */
	Row.prototype.focusAll = function(){
		if (this.currentEntity){
			this.unFocusAll();
			this.currentEntity.setFocus();
		} else{
			for (var i = 0, len = this.entities.length; i<len; i++){
				this.entities[i].setFocus();
			}
		}
	}


	/* ENTITIES - DOCKING */


	/* dock current row */

	Row.prototype.dock = function(){
		if (this.docked) { return; }
		this.docked = true;
		for (var i  =0, len = this.entities.length; i<len; i++){
			this.entities[i].dock();
		}
	}



	/* undock current row */

	Row.prototype.undock = function(){
		if (!this.docked) { return; }
		this.docked = false;
		for (var i  =0, len = this.entities.length; i<len; i++){
			this.entities[i].undock();
		}
	}


	/* ENTITIES - PHYSICAL */

	/* set left of entities, snap to viewport boundaries */
	Row.prototype.setLeft = function(left, animate, noRelated){
		animate = animate && this.allowAnimation;
		/*snap to entities*/
		if (this.snapEntity && this.visibleEntities.length > 0 && !this.gestureAction){

			/* calc new pos */
			var minLeft = Infinity;

			var itemLeft = 0;
			var scrollLeft = 0;
			var centerEntity = this.visibleEntities[0];
			for(var i=0, len = this.entities.length; i<len; i++){
				if (Math.abs(left + itemLeft) < minLeft && !this.entities[i].hidden){
					minLeft = Math.abs(left + itemLeft);
					scrollLeft = itemLeft;
					centerEntity = this.entities[i];
				}
				itemLeft += this.entities[i].getWidth();
			}
			left = -1 * scrollLeft;
			this.timeline.hide();
			this.makeCurrentEntity(centerEntity);
			if (this.visibleEntities.length > 1){
				this.setCurrentEntity(centerEntity,true);
			}
		} else{
			this.timeline.show();
		}

		/* check scroll boundaries*/
		if (left >= 0){
			left = 0;
		} else{
			var minLeft = -1 * (this.width - window.innerWidth);
			if (left < minLeft){
				left = minLeft;
			}
		}

		/* move scroller to calculated left*/
		if (animate){
			this.$scroller.velocity('stop').velocity({ 'left': left },
			{
				easing: Global.easing,
				duration: this.animationDuration
			});
		} else{
			this.$scroller.stop().css({ 'left': left });
		}

		this.scrollLeft = left;

		// indicate entity visibility in screen
		for(var i=0, len = this.entities.length; i<len; i++){
			this.entities[i].setInScreen(this.entityInScreen(this.entities[i]));
		}
	}

	/* Check if entity is visible in the current screen */
	Row.prototype.entityInScreen = function(entity){
		return entity.left + this.scrollLeft + entity.getWidth() >= 0 && entity.left + this.scrollLeft - entity.getWidth() <= window.innerWidth;
	}

	/* set entity width > results in correct header height for hidden entities*/
	Row.prototype.setEntityHeight = function(width){
		if (!this.entities){ return; }

		for (var i =0, len = this.entities.length; i<len;i++){
			this.entities[i].setHeaderHeight(width);
		}
	}

	/* calls semantic zoom on all entities */
	Row.prototype.semanticZoom = function(){
		for (var i=0, len = this.entities.length; i<len; i++){
			this.entities[i].semanticZoom();
		}
	}

	/* Calculate width of entities */
	Row.prototype.calcWidth = function(){
		var width = 0;
		for (var i=0, len = this.entities.length; i<len; i++){
			width += this.entities[i].getWidth();
		}
		this.width = width;
		return width;
	}

	/* animate entity width with only one callback */

	Row.prototype.animateEntityWidth = function(){
		if (!this.allowAnimation){
			this.setEntityHeight(this.entityWidth);
			if (this.isLast()) { this.browser.scrollToBottom(); }
			return;
		}
		this.isLastNow = this.isLast();
			this.$container.velocity('stop').velocity({tween: 1}, { // 'width': this.width
				easing: Global.easing,
				duration: this.animationDuration,
				progress: function(elements, percentComplete, timeRemaining, timeStart, tweenValue) {
                  // set entity width
                  var entity;
                  var headerHeight = this.oldEntityWidth + (this.entityWidth -this.oldEntityWidth) * tweenValue;
                  for(var i = 0, len = this.entities.length;i<len;i++){
                  	entity = this.entities[i];
                  	if (!entity.hidden && entity.animationStep){
                  		entity.animationComplete = tweenValue;
                  		entity.width = entity.animationStart + (entity.animationStep * entity.animationComplete);
                  		entity.$container.css({ 'width': entity.width });
                  	}
                  	entity.setHeaderHeight(headerHeight);
                  }
				  if (Math.round(percentComplete) % 10 == 0 && this.isLastNow) { this.browser.scrollToBottom(); }
              }.bind(this),
              complete: function(elements){
              	if (this.isLastNow) { this.browser.scrollToBottom(); }
              	var entity;
              	for(var i = 0, len = this.visibleEntities.length;i<len;i++){
              		entity = this.visibleEntities[i];

              		entity.animating = false;
              		entity.animationComplete = 1;
              	}
              }.bind(this)
          });
}


/* calculate minimal entity width, so the entities always fill the whole viewport width */
Row.prototype.calcMinWidth = function(apply, animate){
	animate = animate && this.allowAnimation;
	if (this.visibleEntities.length ==0){ return; }
	var minWidth= (window.innerWidth - (this.entities.length - this.visibleEntities.length) * this.hiddenWidth) / this.visibleEntities.length;
	this.minWidth = minWidth;
	if (this.minWidth <= this.hiddenWidth) {
		this.hiddenWidth = this.minWidth;
	}
	for (var i=0, len = this.entities.length; i<len; i++){
		this.entities[i].hiddenWidth = this.hiddenWidth;
	}

	if (!Global.touchSupport || this.visibleEntities.length == 0){
		for (var i=0, len = this.visibleEntities.length; i<len; i++){
			this.visibleEntities[i].setMinWidth(minWidth);
			if (apply) {
				this.visibleEntities[i].setWidth(minWidth, animate);
			}
		}
	}
	else{
		/* manual subpixel fix */
		var error = 0;
		for (var i=0, len = this.visibleEntities.length; i<len; i++){
			error += (minWidth - Math.floor(minWidth));
			if (error > 1){
				extra = 1;
				error -= 1;
			} else{
				extra = 0;
			}
			this.visibleEntities[i].setMinWidth(Math.floor(minWidth) + extra);
			if (apply) {
				this.visibleEntities[i].setWidth(this.visibleEntities[i].minWidth, animate);
			}
		}
	}

	if (apply){
				// animate entity width
				this.setEntityWidth(minWidth);
				this.animateEntityWidth();
				this.semanticZoom();
			}
		}


		/* enable/disable entities to presentation mode */
		Row.prototype.setPresentation = function(enabled, sender){
			for (var i=0, len = this.entities.length; i<len; i++){
				if (this.entities[i] != sender) {
					this.entities[i].setPresentation(enabled);
				};
			}
		// dis/enable dragging
		if (!Global.touchSupport){
			if (this.currentEntity && this.currentEntity.visual.isVideo && enabled){
				this.$scroller.draggable('disable');
			} else{
				this.$scroller.draggable('enable');
			}
		}
	}

	/* return if this row is the last row */
	Row.prototype.isLast = function(){
		return this.$container.is(':last-child');
	}

	/* ENTITIES - FILTERS */

	/* show all entities */
	Row.prototype.showAllEntities = function(){
		for (var i =0, len = this.entities.length; i< len; i++){
			this.entities[i].show();
		}
		this.setVisibleEntities();
		this.calcMinWidth(true);
	}

	/* show filtered entities based on type or keywords */
	Row.prototype.showFilteredEntities = function(type, keywords){
		if (!this.entities) { return; }
		var hides = [];
		var shows = [];
		var filtered = [];
		var index=0;
		this.snapEntity = false;

		// Type filter
		if (type){
			for (var i=0, len = this.entities.length; i<len; i++){
				if (this.entities[i].getType() == type){
					shows.push(this.entities[i]);
				} else{
					hides.push(this.entities[i]);
				}
			}
		} else{
			for (var i=0, len = this.entities.length; i<len; i++){
				shows.push(this.entities[i]);
			}
		}

		// add shows to filterd
		for (var i=0, len = shows.length; i<len; i++){
			filtered.push(shows[i]);
		}

		// keyword filter
		if (this.filter && keywords){
			for (var i=0, len = filtered.length; i<len; i++){
				// filter direct related entities
				if (this.filter.filterDirect){
					if (filtered[i].data.title.toLowerCase().indexOf(keywords.toLowerCase()) == -1){
						index = shows.indexOf(filtered[i]);
						if(index > -1){
							shows.splice(index,1);
							hides.push(filtered[i]);
						}
					}
				} else{
					index = shows.indexOf(filtered[i]);
					if(index > -1){
						shows.splice(index,1);
						hides.push(filtered[i]);
					}
				}
				// filter indirect related entities
				if (this.filter.filterIndirect && filtered[i].data.relatedEntities && filtered[i].data.relatedEntities.length > 0){
					for (var j=0, len2 = filtered[i].data.relatedEntities.length; j<len2; j++){
						if (filtered[i].data.relatedEntities[j].title.toLowerCase().indexOf(keywords.toLowerCase()) != -1){
								// undo hiding
								index = hides.indexOf(filtered[i]);
								if(index > -1){
									hides.splice(index,1);
									shows.push(filtered[i]);
								}
							}						
					}
				}
			}
		}

		// log
		if (type || keywords){
			AjaxLog.info('Filter Entities',this.entity ? this.entity.getUID() + ' type : ' + type + ', keywords : ' + keywords : 'Search, type : ' + type + ' keywords : ' + keywords);
		}

		// apply
		for(var i=0, len = hides.length; i<len; i++){
			hides[i].hide();
		}

		for(var i=0, len = shows.length; i<len; i++){
			shows[i].show();
		}

		console.log("Filter is showing ", shows.length , " and hiding " , hides.length , " entities");
		this.filterActive = hides.length > 1;

		if (this.filterActive){
			if (this.entityWidth < this.filterEntityMinSize){
				this.setEntityWidth(this.filterEntityMinSize);
			}
		}

		this.setVisibleEntities();

		this.calcMinWidth(true);
		// could load related (!);
		this.zoomAction(1,window.innerWidth / 2,true);
		this.setLeft(0, true);
	}

	Row.prototype.setFilter = function(){
		if (this.fromSearch()){
			this.filter =  Global.search.filter;
		}
		if (this.entity) { this.filter = this.entity.filter; }
		if (this.filter) { this.filter.setRow(this); }
	}

	/* ENTITIES - FLIPPER */


	/* go to previous entity */
	Row.prototype.goLeft = function(){
		if (!this.currentEntity){
			return;
		}
		var index = this.visibleEntities.indexOf(this.currentEntity);
		if (index > 0){
			var left = parseInt(this.$scroller.css('left'));
			this.setLeft(left+window.innerWidth, true);
		}
	}

	/* go to next entity */
	Row.prototype.goRight = function(){
		if (!this.currentEntity){
			return;
		}
		var index = this.visibleEntities.indexOf(this.currentEntity);
		if (index < this.visibleEntities.length - 1){
			var left = parseInt(this.$scroller.css('left'));
			this.setLeft(left-window.innerWidth, true);
		}
	}

	/* GLOBAL DEV IPAD helper function :) */
function objToString (obj) {
	var str = '';
	for (var p in obj) {
		if (obj.hasOwnProperty(p)) {
			str += p + '::' + obj[p] + '\n';
		}
	}
	return str;
}


