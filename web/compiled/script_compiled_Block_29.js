/* Block shows a case in the gallery on the start screen */
function Block(showcase, entityId){
	this.$container;
	this.$title;
	this.$description;
	this.$visual;
	this.$icon;
	this.entity = new DataEntity();
	this.showcase = showcase;
	this.entityId = entityId;
	this.data;
	this.loaded = false;
	this.loadVisual = false;
	this.init();
}

/* INIT */
/* init Block object */
Block.prototype.init = function(){
	this.build();
}

/* build html */

Block.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('block').addClass('loading_white').hide().data('block',this);
	this.$visual = $(document.createElement('div')).addClass('visual');
	this.$icon = $(document.createElement('div')).addClass('icon');
	this.$title = $(document.createElement('h2'));
	this.$description = $(document.createElement('p'));
	this.$container.append(this.$visual).append(this.$title).append(this.$description).append(this.$icon);
}

/* HELPERS */

Block.prototype.getContainer = function(){
	return this.$container;
}

Block.prototype.show = function(){
	if (!this.loaded){
		this.load();
	}
	this.$container.show();//.css('opacity',0).velocity('fadeIn',{ duration: 350, delay: Math.random() * 500 });
	this.setVisual(this.entity.depicted_by.placeholder);
}

Block.prototype.hide = function(){
	this.$container.hide();
}


Block.prototype.makeLarge = function(){
	this.$container.addClass('large');
}

/* LOAD */

Block.prototype.load = function(){
	this.entity.uid = this.entityId;
	Global.data.getEntity(this.entityId, this.entityLoaded.bind(this),false);
	this.loaded = true;
}


Block.prototype.entityLoaded = function(data){
	if (!data || !data.data){ return; }
	if (data.data.length){
		this.entity = data.data[0];
		this.setType(this.entity.type);
		this.setTitle(this.entity.title);
		this.setDescription(this.entity.description);
		this.setVisual(this.entity.depicted_by.placeholder);
	} else{
		this.setTitle('Entity not found');
		this.setDescription(this.entityId);
		this.setType('Unknown');
	}
	this.$container.removeClass('loading_white');
}

/* POPULATE */

Block.prototype.setTitle = function(s){

	this.$title.text(s.trunc(45));
}

Block.prototype.setDescription = function(s){

	this.$description.text(s.trunc(190));
}

Block.prototype.setType = function(s){

	this.$icon.addClass('icon-'+s).addClass('color-'+s);
}

Block.prototype.setVisual = function(s){
	if (!s){
		s = Visual.searchImage(this.entity.title);
	}
	if (this.loadVisual){
		this.showcase.setVisual(s);
	}
	this.$visual.css('background-image','url(\''+s+'\')');
}