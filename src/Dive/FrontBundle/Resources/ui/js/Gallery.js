/* Gallery shows the highlighted gallery/showcases on the start screen */
function Gallery(container){
	this.$container = $(container);
	this.$goLeft;
	this.$goRight;
	this.$showcases;
	this.index = 0;
	this.loaded = false;
	this.showcases = [];
	this.init();
}

/* INIT */
/* init Gallery object */
Gallery.prototype.init = function(){
	this.build();
	this.initInteraction();
	this.load();
}

/* build html */

Gallery.prototype.build = function(){
	this.$showcases = $(document.createElement('div')).addClass('showcases').addClass('clearfix');
	this.$goLeft = $(document.createElement('div')).addClass('flipper').addClass('go-left').hide();
	this.$goRight = $(document.createElement('div')).addClass('flipper').addClass('go-right').hide();
	this.$bullets = $(document.createElement('div')).addClass('bullets');
	this.$container.append(this.$showcases).append(this.$goLeft).append(this.$goRight).append(this.$bullets);
}

/* interaction */
Gallery.prototype.initInteraction = function(){
	/* init go left */
	this.$goLeft.click(this.goLeft.bind(this));
	/* init go right */
	this.$goRight.click(this.goRight.bind(this));

	/* click on blocks, open entity in browser*/
	this.$showcases.on('click','.block',function(){
		Global.browser.show();
		Global.browser.addEntities([$(this).data('block').entity]);
	});

	/* click on icon or title, open collection in browser */
	this.$showcases.on('click','.load-collection',function(){
		Global.browser.show();
		var showcase = $(this).closest('.showcase').data('showcase');
		var entities = [];
		switch(showcase.caseType){
			case 'Related':
			entities.push(showcase.entity);
			break;
			default:
			for (var i =0, len = showcase.blocks.length; i < len; i++){
				if (showcase.blocks[i].entity.uid){
					entities.push(showcase.blocks[i].entity);
				}
			}
		}
		Global.browser.addEntities(entities);
	});

	/* click on blocks, open entity in browser*/
	this.$container.on('click','.bullet',function(){
		var showcase = $(this).data('showcase');
		showcase.gallery.index = showcase.index;
		showcase.gallery.loadActiveShowcase();
	});
}


/* NAVIGATION */

Gallery.prototype.hideAllShowcases = function(){
	for (var i =0, len = this.showcases.length; i < len; i++){
		this.showcases[i].hide();
	}
}

Gallery.prototype.goLeft = function(){
	this.index --;
	if (this.index == -1){
		this.index = this.showcases.length -1;
	}
	this.loadActiveShowcase();
}

Gallery.prototype.goRight = function(){
	this.index ++;
	if (this.index == this.showcases.length){
		this.index = 0;
	}
	this.loadActiveShowcase();
}

Gallery.prototype.loadActiveShowcase =function(){
	this.setVisual('');
	this.hideAllShowcases();
	this.setActiveBullet(this.index);
	this.showcases[this.index].show();
	// Log action
	AjaxLog.info('Load showcase',this.showcases[this.index].caseId);
}

Gallery.prototype.setActiveBullet = function(index){
	this.$bullets.find('.bullet.active').removeClass('active');
	this.$bullets.find('.bullet').eq(index).addClass('active');
}

Gallery.prototype.showFlippers = function(){
	if (this.showcases.length > 1){
		this.$goLeft.show();
		this.$goRight.show();
	}
}

/* HELPERS */

Gallery.prototype.getContainer = function(){
	return this.$container;
}

Gallery.prototype.show = function(){
	if (!this.loaded){
		this.load();
	}
}

Gallery.prototype.addShowcase = function(type, id){
	showcase = new Showcase(this, type, id);
	showcase.index = (this.showcases.push(showcase)) - 1;
	this.$showcases.append(showcase.getContainer());
	if (this.showcases.length == 1){
		//showcase.show();
		this.loadActiveShowcase();
	}
	this.addBullet(showcase);
}

Gallery.prototype.addBullet = function(showcase){
	var $bullet = $(document.createElement('div')).addClass('bullet').data('showcase',showcase);
	this.$bullets.append($bullet);
}

Gallery.prototype.load = function(){
	if (this.loaded){
		return;
	}
	// get frontpage collections
	// this.addShowcase('Collection','13');
	// this.addShowcase('Collection','1');
	for(var i =0, len = Global.config.galleryCases.length; i<len; i++){
		this.addShowcase(Global.config.galleryCases[i].caseType,Global.config.galleryCases[i].identifier);
	}

	// get a date collection (event related to a certain date, show entities related to that event?)

	this.showFlippers();
	this.loaded = true;
}


Gallery.prototype.setVisual = function(s){
	$('#main-ghost').css('background-image',"url('"+s+"')");
}