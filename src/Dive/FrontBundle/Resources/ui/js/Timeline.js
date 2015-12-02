/* A timeline is shown below a row / list of entities; and provides shortcuts/overview of entities as sorted by date */

function Timeline(row){
	this.$container;
	this.$markers;
	this.markers = [];
	this.$startLabel;
	this.$endLabel;
	this.startDate;
	this.endDate;
	this.pixelsPerSecond = 0;
	this.row = row;
	this.loaded = false;
	this.init();
}

/* INIT */

/* init timeline object */

Timeline.prototype.init = function(){
	this.build();
	this.initInteraction();
}

/* build timeline html */

Timeline.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('timeline');

	this.$markers = $(document.createElement('div')).addClass('markers');
	this.$startLabel = $(document.createElement('div')).addClass('startlabel').text('');
	this.$container.append(this.$startLabel);
	this.$endLabel = $(document.createElement('div')).addClass('endlabel').text('');
	this.$container.append(this.$endLabel);
}

Timeline.prototype.addMarkersBody = function(){
	this.$container.append(this.$markers);
}

/* HELPERS */

/* get main container */

Timeline.prototype.getContainer = function(){
	return this.$container;
}

/*  hide timeline */
Timeline.prototype.hide = function(){
	this.$container.hide();
}
/*  show timeline */
Timeline.prototype.show = function(){
	this.$container.show();
}


/* DATA */

/* set start date and change label */

Timeline.prototype.setStartDate = function(startDate){
	this.startDate = startDate;
	this.$startLabel.text(startDate.year());
}

/* set end date and change label */

Timeline.prototype.setEndDate = function(endDate){
	this.endDate = endDate;
	this.$endLabel.text(endDate.year());
}

/* get minimum and maximum entity dates */

Timeline.prototype.getMinMaxDates = function(){
	// get min/max dates
	var moments = [];
	for(var i=0, len = this.row.entities.length; i < len; i++){
		this.row.entities[i].getStartDate()._i ? moments.push(this.row.entities[i].getStartDate()) : false;
		this.row.entities[i].getEndDate()._i ? moments.push(this.row.entities[i].getEndDate()) : false;
	}
	this.setStartDate(moment(moment.min(moments).year(), 'YYYY'));
	this.setEndDate(moment(moment.max(moments).year() + 1, 'YYYY'));
}

/* calculate duration in seconds */
Timeline.prototype.getDuration = function(){
	return this.endDate.unix() - this.startDate.unix();
}

/* calculate the number of pixels per second */
Timeline.prototype.setPixelsPerSecond = function(){
	// this.pixelsPerSecond = window.clientWidth - 100 this.$markers.width() / this.getDuration();
	this.pixelsPerSecond = (window.innerWidth - 100) / this.getDuration();
}

/* create a timeline based on the (visible?) row-entities */
Timeline.prototype.loadRow = function(){
	this.getMinMaxDates();
	this.setPixelsPerSecond();
	this.buildMarkers();
}

/* MARKERS */

Timeline.prototype.buildMarkers = function(){
	for(var i=0, len = this.row.entities.length; i < len; i++){
		if (this.row.entities[i].data.date.start){
			var marker = new Marker(this, this.row.entities[i]);
			this.markers.push(marker);
			this.$markers.append(marker.getContainer());
		}
	}
	this.addMarkersBody();
}

Timeline.prototype.initInteraction = function(){
	if (Global.touchSupport){
		// touch
		this.$container.on('click','.marker',
			function(){
				if (!$(this).hasClass('clicked')){
					$(this).data('timeline').$markers.find('.clicked').removeClass('clicked');
					$(this).addClass('clicked');
					$(this).data('entity').row.unFocusAll();
					$(this).data('entity').setFocus();
				} else{
					$(this).removeClass('clicked');
					$(this).data('entity').row.focusAll();
				}
			}
			);
	} else{
		// non touch
		this.$container.on('mouseenter','.marker',
			function(){
				$(this).data('entity').row.unFocusAll();
				$(this).data('entity').setFocus();
			});
		this.$container.on('mouseleave','.marker',
			function(){
				$(this).data('entity').row.focusAll();
			}
			);
		this.$container.on('click','.marker',function(){
			$(this).data('entity').row.growEntity($(this).data('entity'));
		});
	}
}
