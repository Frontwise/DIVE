/* Visual objects holds the image/video that depicts an entity */
function Visual(entity){
	this.$container;
	this.$player;
	this.$playerButton;
	this.$holder;
	this.$ghost;
	this.entity = entity;
	this.init();
	this.isVideo = false;
	this.videoReady = false;
	this.showVideo = false;
	this.body = false;
	this.videoStartTimeout;
	this.placeholderImage = '';
	this.showingSource = false;
	this.sourceLoaded = false;
}

/* static search image function */

Visual.searchImage = function(title, size){
	if (typeof(size) == 'undefined'){ size = 500; }
	// size = 500 || 1100
	return Global.imagePath + "?keywords="+ encodeURIComponent(title.replace(/\W/g, ' ')) + '&size='+size;
}


/* INIT */

/* init Visual object */
Visual.prototype.init = function(){
	this.build();
}

/* build html */
Visual.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('visual');
}

/* add Body */
Visual.prototype.addBody = function(){
	this.$ghost = $(document.createElement('div')).addClass('ghost').css('background-size',window.innerWidth);
	this.$container.html(this.$ghost);
	this.$holder = $(document.createElement('div')).addClass('visual-holder');
	this.$container.append(this.$holder);
	this.body = true;
	this.update();
}

/* init placeholder image */
Visual.prototype.initPlaceholder = function(){
	if (this.data.placeholder){
		this.placeHolderImage = this.data.placeholder;
	} else{
		this.data.placeholder = Visual.searchImage(this.entity.data.title);
		this.placeHolderImage = this.data.placeholder;
	}
	this.showPlaceHolder(this.placeHolderImage);
}


Visual.prototype.showPlaceHolder = function(){
	if (!this.body) { return; }
	this.applyImage(this.placeHolderImage);
	this.showingSource = false;
}

/* init source image */
Visual.prototype.showSource = function(){
	if(!this.isVideo){
		if (this.data.placeholder && !this.data.source){
			this.data.source = Visual.searchImage(this.entity.data.title, 1100);
		}
		if (this.data.source){
			if (!this.sourceLoaded){
				var tmpImage = new Image();
				tmpImage.onload = function(){
					this.sourceLoaded = true;
					this.showingSource = true;
					this.applyImage(this.data.source);
				}.bind(this);
				tmpImage.src = this.data.source;
			}
		}
	}
}

/* apply image */
Visual.prototype.applyImage = function(image){
	this.$ghost.css('background-image','url(\''+ image + '\')');
	this.$holder.css('background-image','url(\''+ image + '\')');
}

/* init Video visual type */

Visual.prototype.initVideo = function(videoSource){
	// container.header.player
	this.$player = $('<video/>').addClass('player').attr('width','100%').attr('height','100%').attr('poster',this.data.placeholder).attr('controls','').attr('preload','none');
	this.$player.append($('<source/>').attr('type','video/mp4').attr('src',videoSource));
	//this.$player.append('<div id="video-controls"><button type="button" id="play-pause">Play</button><input type="range" id="seek-bar" value="0"><button type="button" id="mute">Mute</button><input type="range" id="volume-bar" min="0" max="1" step="0.1" value="1"><button type="button" id="full-screen">Full-Screen</button></div>)');
	this.$container.append(this.$player);
	this.videoReady = true;
}


/* Update object with new entity data. Called after the entity received it's data. */

Visual.prototype.update = function(){
	if(!this.body) return;
	this.data = this.entity.data.depicted_by;
	this.initPlaceholder();
	if (this.data.source && (this.data.source.toLowerCase().indexOf('.mp4') > -1 || this.data.source.toLowerCase().indexOf('.mpg') > -1 || this.data.source.toLowerCase().indexOf('.avi') > -1)){
		this.isVideo = true;
		this.$playerButton = $(document.createElement('div')).addClass('player-button').data('visual',this);
		this.$container.append(this.$playerButton);
	}
}


/* HELPERS */

Visual.prototype.getContainer = function(){
	return this.$container;
}

/* VIDEO HELPERS */

Visual.prototype.stop = function(){
	if (!this.body){ return; }
	if (this.isVideo && this.videoReady){
		this.$player.get(0).pause();
	}
}

Visual.prototype.start = function(){
	if (!this.body){ return; }

	/* start video*/
	if (this.isVideo){
		if (!this.videoReady){
			this.initVideo();
		}
		this.$player.get(0).play();

	}  else{
		/* show source image*/
		if (!this.showingSource){
			this.showSource();
		}
	}
}

Visual.prototype.delayedStart = function(){
	if (!this.body){ return; }
	if (this.isVideo){
		clearTimeout(this.videoStartTimeout);
		this.videoStartTimeout = setTimeout(function(){ this.$player.get(0).play() }.bind(this),2000);
	} else{
		if (!this.showingSource){
			this.showSource();
		}
	}
}

Visual.prototype.playButtonClick = function(event){
	if (!this.body){
		this.addBody();
		return;
	}
	if(this.isVideo && !this.videoReady){
		this.initVideo();
	}
	this.delayedStart();
	return false;
}


/* SEMANTIC ZOOM */

/* change visual representation on a certain width */
Visual.prototype.semanticZoom = function(width){
	if (!this.body){ return; }
	if (this.isVideo){
		if (width < 49){
			this.$playerButton.hide();
		} else{
			this.$playerButton.show();
		}
	}
	if (width > 700){
		// fix background size
		this.$holder.css('backgroundSize','contain');
		// show video
		if (this.isVideo){
			if (!this.videoReady){
				this.initVideo(this.data.source);
			}
			if (!this.showVideo && this.videoReady){
				this.$player.show();
				this.$holder.hide();
				this.showVideo = true;
			}
		}
	} else{
		// fix background size
		this.$holder.css('backgroundSize','cover');
		// hide video
		if (this.isVideo){
			if (this.showVideo){
				this.$player.get(0).pause();
				this.$player.hide();
				this.$holder.show();
				this.showVideo = false;
			}
		} else{
			if (this.showingSource){
				this.showPlaceHolder();
			}
		}
	}
}