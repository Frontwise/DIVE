/* Share tab can be used to share an entity */
/* This tab is currently not in use, and not functional */

function Share(entity){
	this.$container;
	this.$description;
	this.$action;
	this.entity = entity;
	this.loaded = false;
	this.partialLoaded = false;
	this.init();
}

/* INIT */

/* init Details objects */

Share.prototype.init = function(){
	this.build();
}

/* build html */

Share.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('content').addClass('content-share').data('content',this);
}

Share.prototype.addBody = function(){
	// this.$action = $(document.createElement('div')).addClass('action');
	// this.$container.append(this.$action);

	// this.$relatedness = $(document.createElement('div')).addClass('relations');
	// this.$container.append(this.$relatedness);

	// this.$sources = $(document.createElement('div')).addClass('sources');
	// this.$container.append(this.$sources);

	// this.$description = $(document.createElement('div')).addClass('description');
	// this.$container.append(this.$description);

}

/* HELPERS */

Share.prototype.getContainer = function(){
	return this.$container;
}

Share.prototype.show = function(){
	if (!this.loaded){
		this.load();
	}
}

/* DATA */

/* Load details from API */
Share.prototype.load = function(){
	if (this.loaded){
		return;
	}
	this.loaded = true;

	this.addBody();
	this.showContainer();
}

Share.prototype.showContainer = function (){
	this.$container.velocity('stop').velocity("slideDown",  {
		queue: false,
		easing: Global.easing,
		duration: Global.animationDuration
	});
}