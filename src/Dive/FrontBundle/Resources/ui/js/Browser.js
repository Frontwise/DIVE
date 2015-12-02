/* Browser holds the browser main object */

function Browser(container){
	this.$container = $(container);
	this.ready = false;
	this.rows = [];
	this.data = Global.data;
	this.parser = Global.parser;
	this.offline = window.location.hash == '#random' || window.location.hash == '#disney';
	this.resizeTimer;
	this.scrollTimer;
	this.animationDuration = Global.animationDuration;
	this.allowAnimation = Global.allowAnimation;
	this.hiddenWidth = 5;
	this.entityLimit = Global.data.entityLimit;
	this.$rowHolder;
	this.$scrollUpButton;
	this.$scrollDownButton;
	this.init();
}

/* INIT */


/* init browser */
Browser.prototype.init = function(){
	this.build();
}


/* build browser html */

Browser.prototype.build = function(){
	this.$rowHolder = $(document.createElement('div')).addClass('row-holder');
	this.$container.append(this.$rowHolder);
	this.$scrollUpButton = $(document.createElement('div')).attr('id','scrollup-button').addClass('scrollButton');
	this.$scrollDownButton = $(document.createElement('div')).attr('id','scrolldown-button').addClass('scrollButton');
	this.$container.append(this.$scrollUpButton);
	this.$container.append(this.$scrollDownButton);


	this.$container.attr('unselectable','on')
	.css({'-moz-user-select':'-moz-none',
		'-moz-user-select':'none',
		'-o-user-select':'none',
		'-khtml-user-select':'none',
		'-webkit-user-select':'none',
		'-ms-user-select':'none',
		'user-select':'none'
	}).bind('selectstart', function(){ return false; });

}

/* init interactions */

Browser.prototype.initInteraction = function(){
	/* listen to window resize*/
	$(window).resize(this.resize.bind(this));
	$(window).on('deviceorientation',this.resize.bind(this));
	/* listen to topbar*/
	$('#topbar').on('click',this.scrollTo.bind(this,0));
	/* listen to scrollupbutton*/
	this.$scrollUpButton.on('click',this.scrollRowUp.bind(this));
	/* listen to scrolldownbutton*/
	this.$scrollDownButton.on('click',this.scrollRowDown.bind(this));
	/* listen to window scroll */
	$(window).scroll(this.scrollEvent.bind(this));
	this.ready = true;
}


/* listen to window resize */

Browser.prototype.resize = function(){
	clearTimeout(this.resizeTimer);
	this.resizeTimer = setTimeout(function(){
		for (var i=0, len = this.rows.length; i<len;i++){
			this.rows[i].calcMinWidth(false);
			this.rows[i].calcWidth();
			this.rows[i].zoomAction(1, 0);
			if(this.rows[i].currentEntity){
				this.rows[i].growEntity(this.rows[i].currentEntity);
			}
			this.dockRows();
		}
	}.bind(this),250);
}


/* User is updated (login/logout) */
Browser.prototype.userUpdate =function(){
	for(var i =0, len = this.rows.length; i< len; i++){
		for (var j =0, elen = this.rows[i].entities.length; j<elen; j++){
			if (this.rows[i].entities[j].comments) { this.rows[i].entities[j].comments.userUpdate(); }
			if (this.rows[i].entities[j].collections){ this.rows[i].entities[j].collections.userUpdate(); }
		}
	}
}



/* clear browser */

Browser.prototype.clear = function(){
	while(this.rows.length){
		this.removeRow(this.rows[0]);
	}
	this.rows = [];
	$('body').css('background-image','none');
	this.$rowHolder.empty();
}



/* get container */

Browser.prototype.getContainer = function(){
	return this.$container;
}

/* ROWS */

/* add a new row  */

Browser.prototype.addRow = function(entity){
	// if entity row is not the last row, remove previous rows
	if (entity){
		var position = this.rows.indexOf(entity.getRow());
		var len = this.rows.length;
		while(position < --len){
			
			this.rows[len].remove();
			this.rows.splice(len,1);
		}
	} else{
		/* clear browser */
		this.clear();
	}
	var row = new Row(this, entity);
	this.rows.push(row);
	this.$rowHolder.append(row.getContainer());
	this.dockRows();
	return row;
}

/* remove a row */

Browser.prototype.removeRow = function(row){
	row.remove();
	var position = this.rows.indexOf(row);
	this.rows.splice(position,1);
}


/* DOCK ROWS */

Browser.prototype.dockRows = function(){
	for(var i=0,len = this.rows.length; i<len; i++){
		if (i < len - 2){
			this.rows[i].dock();
		} else{
			this.rows[i].undock();
		}
	}
}



// /* INIT */

// Browser.prototype.getData = function(){
// 	return this.data;
// }

/* Add a row with related entities for an entity */

Browser.prototype.addRelated = function(entity){
	console.log('add related');
	if (this.offline) { this.addRandom(entity); return; }
	var row = this.addRow(entity);
	if (entity.isCollection()){
		// load collection
		this.data.getCollection(entity.data.uid.replace('Collection:',''),row.addResults.bind(row));
	} else{
		// check for preloaded related entities
		if (entity.data.relatedEntities){
			// reuse preloaded related entities
			row.addResults({data:entity.data.relatedEntities});
		} else{
			// request new related entities
			this.data.getRelated(entity.data.uid,0,this.entityLimit,row.addResults.bind(row),row, true);
		}
	}
}

/* Add a row with search results for some keywords */

Browser.prototype.addSearch = function(keywords){
	if (this.offline) { this.addRandom(); return; }
	var row = this.addRow();
	if (keywords == 'My collections'){
		//row.relatedness = 'My collections';
		row.relatedness = 'Search';
		Global.data.getSearchCollections(Global.search.keywords,0,this.entityLimit,row.addCollectionResults.bind(row),row.finishedLoading.bind(row));
	} else{
		if (keywords.indexOf('Collection:')==0){
			//row.relatedness = 'Collection';
			row.relatedness = 'Search';
			Global.data.getSearchCollections(Global.search.keywords,0,this.entityLimit,row.addCollectionResults.bind(row),row.finishedLoading.bind(row));
		} else 
		{ if (keywords.indexOf('Entity:')==0){
			row.relatedness = 'Search';
			var entity = new Entity(this);
			entity.setData(new DataEntity());
			row.entity = entity;
			row.entity.data.uid = (Global.search.keywords.replace('Entity:',''));
			console.log(row.entity.data);
			Global.data.getEntity(row.entity.data.uid,row.addResults.bind(row),true);
		} else{
			row.relatedness = 'Search';
			this.data.getSearch(keywords,0,this.entityLimit,row.addResults.bind(row));
		}
	}
}
}


/* Add a row with a manual selected entity/entities from a collection */

Browser.prototype.addEntities = function(entities){
	var row = this.addRow();
	row.relatedness = 'Collection';
	for(var i =0, len = entities.length; i< len; i++){
		var entity = new Entity(this);
		entity.setData(entities[i]);
		if (!row.hasEntity(entity)){
			if (!row.addEntity(entity)){
				break;
			}
		}
	}
	row.finishedLoading();
	if (entities.length == 1){
		row.growEntity(row.entities[0],true);
	}
}

/* dev: add random entities */

Browser.prototype.addRandom = function(entity){
	var row = this.addRow(entity);
	setTimeout(function(){
		for(var i =0; i< 10 + Math.random() * 15; i++){
			var entity = new Entity(this);
			entity.setData(row.getBrowser().parser.populateEntityData({}));
			if (!row.hasEntity(entity)){
				if (!row.addEntity(entity)){
					break;
				}
			}
		}
		row.finishedLoading();
	}.bind(this), 400);
	if (entity && entity.status == entity.STATUS_INROW){
		this.scrollToBottom();
	}
}


/* SCROLLING */

/* scroll to bottom */

Browser.prototype.scrollToBottom = function(){
	if ($('body').hasClass('scrolling') || $('body').hasClass('drag-scrolling')){  return; }
	this.scrollTo(document.body.scrollHeight);
}

/* scroll vertically a certain amount */

Browser.prototype.scrollBy = function(scroll){
	if ($('body').hasClass('scrolling')){  return; }
	window.scrollBy(0,scroll);
}

/* scroll vertical to a certain scrolltop position */

Browser.prototype.scrollTo = function(scrollTop){

	if ($('body').hasClass('scrolling')){  return; }
	if ($(window).scrollTop() == scrollTop){ return;}
	$('body').addClass('scrolling');
	if (this.allowAnimation){
		$('html, body').stop().animate({
			scrollTop: scrollTop
		}, this.animationDuration, function(){
			$('body').removeClass('scrolling');
		});
	} else{
		$('html, body').scrollTop(scrollTop);
		$('body').removeClass('scrolling');
	}
}

/* scroll up a row or a screen (?) */

Browser.prototype.scrollRowUp = function(){
	var newTop = 0;
	var scrollTop = $(window).scrollTop();
	var position;
	var contentTop = $('#content').position().top;
	for (var i=0, len = this.rows.length; i <len; i++){
		position = this.rows[i].getContainer().position()
		if (position.top + contentTop < scrollTop){
			newTop = position.top + contentTop;
		}
	}
	this.scrollTo(newTop - $('#topbar').height());
}

/* scroll up a row */

Browser.prototype.scrollRowDown = function(){
	var newTop = 0;
	var scrollTop = $(window).scrollTop();
	var position;
	var topbarHeight = $('#topbar').height();
	var contentTop = $('#content').position().top;
	for (var i=0, len = this.rows.length; i <len; i++){
		position = this.rows[i].getContainer().position();
		if (position.top + contentTop  > scrollTop + topbarHeight){
			newTop = position.top + contentTop;
			break;
		}
	}
	if(!newTop){
		newTop = position.top;
	}
	this.scrollTo(newTop - topbarHeight);
}

/* listen to browser scroll, change scroll button colors */

Browser.prototype.scrollEvent = function(){
	clearTimeout(this.scrollTimer);
	this.scrollTimer = setTimeout(this.checkScroll.bind(this),200);
}

Browser.prototype.checkScroll = function(){
	/* show/hide scroll buttons */
	var scrollTop = $(window).scrollTop();
	if (scrollTop > 50){
		this.$scrollUpButton.show();
		this.$scrollDownButton.show();
	}
	/* get prev/next items to set scroll button border colors */
	//if (this.rows.length < 1){ return;}
	var prevRow = false, nextRow = false;
	var position;
	var topbarHeight = $('#topbar').height();
	var contentTop = $('#content').position().top;
	for (var i=0, len = this.rows.length; i <len; i++){
		position = this.rows[i].getContainer().position();
		if (position.top + contentTop > scrollTop){
			if (i < this.rows.length - 1){
				nextRow = this.rows[i+1];
			} else{
				nextRow = false;
			}
			if (!prevRow && scrollTop < 100){
				nextRow = this.rows[0];
			}
			break;
		}
		prevRow = this.rows[i];
	}

	this.$scrollUpButton.removeClass(this.getBorderClass.bind(this));
	this.$scrollUpButton.addClass(prevRow ? (prevRow.currentEntity ? 'border-' + prevRow.currentEntity.getType() : 'border-Search') : 'border-None');
	this.$scrollDownButton.removeClass(this.getBorderClass.bind(this));
	this.$scrollDownButton.addClass(nextRow ? (nextRow.currentEntity ? 'border-' + nextRow.currentEntity.getType() : 'border-Search') : 'border-None');
}

Browser.prototype.getBorderClass = function(index,css){
	return (css.match (/(^|\s)border-\S+/g) || []).join(' ');
}


Browser.prototype.show = function(){
	if (!this.ready){
		this.initInteraction();
	}
	$('#gallery').hide();
	Global.collectionMenu.$savePathButton.show();
	Global.user.refresh();
	$(this.$container).show();
}

/* update entity content of changed entity */
Browser.prototype.updateEntity = function(entityId,title,description,isPublic){
	var entity;
	for(var i = 0, len1 = this.rows.length; i < len1; i++){
		for(var j = 0, len2 = Global.browser.rows[i].entities.length; j < len2; j++){
			entity = this.rows[i].entities[j];
			if (entity.getUID() == entityId){
				entity.update(title,description,isPublic);
			}
		}
	}
}


/* update entity content of changed entity */
Browser.prototype.deleteEntity = function(entityId){
	var entity;
	for(var i = 0, len1 = this.rows.length; i < len1; i++){
		var removes = [];
		for(var j = 0, len2 = Global.browser.rows[i].entities.length; j < len2; j++){
			entity = this.rows[i].entities[j];
			if (entity.getUID() == entityId){
				entity.$container.remove();
				removes.push(entity);
			}
		}
		for (var r = 0, len3 = removes.length; r < len3; r++){
			for(var j = 0, len2 = Global.browser.rows[i].entities.length; j < len2; j++){
				if (removes[r] == Global.browser.rows[i].entities[j]){
					Global.browser.rows[i].entities.splice(j,1);
					break;
				}
			}
		}
		Global.browser.rows[i].showAllEntities();
	}
}



/* TESTS/DEV */

/* remove all images and put colors in place */

Browser.prototype.testColor = function(){
	$('.visual-holder').css('backgroundImage','none').each(function(){$(this).css('backgroundColor','rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')');});
}

