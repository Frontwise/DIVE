/* Showcase shows a case in the gallery on the start screen */
function Showcase(gallery, caseType, caseId){
	this.$container;
	this.$icon;
	this.$title;
	this.$subtitle;
	this.blocks = [];
	this.$blocks;
	this.entity;
	this.gallery = gallery;
	this.loaded = false;
	this.caseType= caseType;
	this.caseId = caseId;
	this.entityIndex = [];
	this.makeLarge = window.innerWidth <= 1024 ? 0 : -1;
	this.init();
	this.index = -1;
}

/* INIT */
/* init Showcase object */
Showcase.prototype.init = function(){
	this.build();
}

/* build container */

Showcase.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('showcase').addClass('loading').addClass('clearfix').data('showcase',this).hide();
}

/* add body */

Showcase.prototype.addBody = function(){
	this.$icon = $(document.createElement('div')).addClass('load-collection').addClass('icon');
	this.setType(this.caseType);
	this.$container.append(this.$icon);
	this.$title = $(document.createElement('h1')).addClass('load-collection').addClass('title');
	this.$container.append(this.$title);
	this.$subtitle = $(document.createElement('h2')).addClass('load-collection').addClass('subtitle');
	this.$container.append(this.$subtitle);
	this.$blocks = $(document.createElement('div')).addClass('blocks');
	this.$container.append(this.$blocks);
}

/* HELPERS */

Showcase.prototype.getContainer = function(){
	return this.$container;
}


/* show showcase, and load if not loaded */
Showcase.prototype.show = function(){
	if (!this.loaded){
		this.load();
	} else{
		for(var i = 0, len = this.blocks.length; i < len; i++){
			this.blocks[i].hide();
			this.blocks[i].show();
		}
		if (this.caseType == 'Collection'){
			if (this.blocks && this.blocks[0] && this.blocks[0].loadVisual){
				this.blocks[0].show();
			}
		} else{
			if (this.entity){
				this.setVisual(this.entity.depicted_by.placeholder != '' ?  this.entity.depicted_by.placeholder : Visual.searchImage(this.entity.title));
			}
		}

	}
	this.$blocks.hide()
	if (Global.allowAnimation){
		this.$container.hide().css('opacity','0').velocity('stop').velocity('fadeIn',{ duration: 350,easing: 'easeOutSine', }).addClass('active');
		setTimeout(function(){ this.$blocks.hide().css('opacity','0').velocity('stop').velocity('fadeIn',{ duration: 350,easing: 'easeOutSine', }); }.bind(this), 350);
	} else{
		this.$container.show();
		setTimeout(function(){ this.$blocks.show(); }.bind(this), 350);
	}
}


/* show showcase, and load if not loaded */
Showcase.prototype.hide = function(){
	if (this.$container.is(':visible')){
		this.$container.velocity('stop').hide().removeClass('active');
	}
}

/* load showcase based on type */

Showcase.prototype.load = function(){
	if(this.loaded){ return false;}
	this.addBody();
	this.setSubTitle(this.caseType);

	switch (this.caseType){
		case 'Collection': this.loadCollection(); break;
		case 'Related': Global.data.getEntity(this.caseId, this.entityLoaded.bind(this),true); break;
	}
	this.loaded = true;
}


/* LOAD DATA*/

/* load a collection showcase */

Showcase.prototype.loadCollection  = function(){
	var ms = +new Date();
	$.getJSON(Global.basePath + 'collection/' + this.caseId + '/details',{},function(data){
		console.log('Load collection took: ',+new Date() - ms, 'ms. Data: ', data);
		if (data.data && !data.data.error){
			this.$container.removeClass('loading');
			this.setTitle(data.data.title);
			for (var i=0, len = data.data.entities.length; i < len; i++){
				if (data.data.entities[i].uid){
					this.addBlock(data.data.entities[i].uid);
				}
			}
		} else{
			console.log('Error:', data.error);
		}
	}.bind(this));
}

Showcase.prototype.loadRelated = function(data){
	if (!data.data) { return; }
	var ms = +new Date();
	var entity;
	/* generate entities */
	if (data.data){
		this.$container.removeClass('loading');
		/* sort data by related event*/
		data.data.sort(function(a,b) {return (a.event > b.event) ? 1 : ((b.event > a.event) ? -1 : 0);} );
		for (var i=0, len = data.data.length; i<len; i++){
			if (data.data[i].uid){
				if (!this.hasEntityUID(data.data[i].uid)){
					this.addBlock(data.data[i].uid);
				}
			}
		}
	}
}

Showcase.prototype.entityLoaded = function(data){
	if (data && data.data && data.data.length){
		console.log(data);
	
		this.entity = data.data[0];
		this.setType(this.entity.type);
		this.setTitle(this.entity.title);
		this.setVisual(this.entity.depicted_by.placeholder != '' ?  this.entity.depicted_by.placeholder : Visual.searchImage(this.entity.title));
		Global.data.getRelated(this.caseId,0,Global.data.entityLimit,this.loadRelated.bind(this),this,false);
	} else {
		this.setTitle('Entity not found');
		this.setType('Unknown');
	}
}

/* check if entity uid exist in row */

Showcase.prototype.hasEntityUID = function(uid){
	if (typeof(this.entityIndex[uid]) != 'undefined'){
		return true;
	}
	this.entityIndex[uid] = true;
	return false;
}

/* CONTENT */

Showcase.prototype.setTitle = function(s){
	this.$title.text(s);
}

Showcase.prototype.setSubTitle = function(s){
	this.$subtitle.text(s);
}


Showcase.prototype.setType = function(s){
	this.$icon.addClass('icon-'+s).addClass('color-'+s)
}

Showcase.prototype.setVisual = function(s){
	this.gallery.setVisual(s);
}

Showcase.prototype.addBlock = function(uid){
	var block = new Block(this,uid);
	if (this.blocks.push(block) == 1 && this.caseType == 'Collection'){
		block.loadVisual = true;
	}
	if (this.makeLarge > 0) { block.makeLarge(); }
	this.makeLarge++;
	if (this.makeLarge == 3){ this.makeLarge = -1; }
	this.$blocks.append(block.getContainer());
	block.show();
}


