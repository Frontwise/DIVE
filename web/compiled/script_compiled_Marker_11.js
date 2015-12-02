/* a Marker represents an entity on the timeline */
function Marker(timeline,entity){
	this.$container;
	this.$duration;
	this.timeline = timeline;
	this.entity = entity;
	this.init();
}

/* INIT */
/* init Marker object */
Marker.prototype.init = function(){
	this.build();
	this.entity.setMarker(this);
	this.update();
}

/* build html */

Marker.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('marker').addClass('color-'+this.entity.getType()).data('entity',this.entity).data('timeline',this.timeline);
	this.$duration = $(document.createElement('div')).addClass('duration').addClass('color-'+this.entity.getType());
	this.$container.append(this.$duration);
}

/* update position and width */
Marker.prototype.update = function(){
	// title
	var titleString = this.entity.data.date.start;
	if (this.entity.data.date.end && this.entity.data.date.end != this.entity.data.date.start){
		titleString += this.entity.data.date.end;
	}
	//this.entity.getStartDate().format('MMMM Do YYYY, h:mm') + ' – ' + this.entity.getEndDate().format('MMMM Do YYYY, h:mm');
	this.$container.attr('title', titleString);

	// position and size
	var left = (this.entity.getStartDate().unix() - this.timeline.startDate.unix()) * this.timeline.pixelsPerSecond;
	var width = (this.entity.getEndDate().unix() - this.entity.getStartDate().unix()) * this.timeline.pixelsPerSecond;
	this.$container.css('left', left);
	this.$duration.css('width', width);
}

/* HELPERS */

Marker.prototype.getContainer = function(){
	return this.$container;
}

Marker.prototype.show = function(){
	this.$container.show();
}

Marker.prototype.hide = function(){
	this.$container.hide();
}