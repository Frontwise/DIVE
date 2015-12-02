/* a Button on the filter bar that filters on a certain entity type */

function Button(filter,type){
	this.filter = filter;
	this.title = '0';
	this.type = type;
	this.$container;
	this.$label;
	this.init();
	this.selected = true;
}

/* INIT */

/* init Button object */
Button.prototype.init = function(){
	this.build();
}
/* build html */
Button.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('button').addClass('icon-'+ this.type).addClass('border-'+this.type).data('button',this);
	this.$label = $(document.createElement('span')).text('0');
	this.$container.append(this.$label);
	this.$container.attr('title',this.type);
}

/* HELPERS */

Button.prototype.getContainer = function(){
	return this.$container;
}

Button.prototype.deselect = function(){
	if (Global.allowAnimation){
		this.$container.stop().velocity({ opacity: 0.5} , this.filter.row.animationDuration);
	} else{
		this.$container.css('opacity',0.5);
	}
	this.selected  = false;
}

Button.prototype.select = function(){

	if (this.title == '0'){
		this.deselect();
		return;
	}
	if (this.selected){ return; }
	this.selected  = true;
	if (Global.allowAnimation){
		this.$container.stop().velocity({ opacity: 1} , this.filter.row.animationDuration);
	} else{
		this.$container.css('opacity',1);
	}
}

Button.prototype.setTitle = function(title){
	/*if (this.type == 'Link'){
		title = title + ' relations';
	}*/
	this.title = title || this.title;
	this.$label.text(this.title);
	this.select();
}

/* FILTER */

/* on button click, apply or remove the selected filter */

Button.prototype.applyFilter = function (e){
	if (this.title == '0'){
		return;
	}
	if (this.filter.currentType != this.type && this.type != 'Link'){
		if (this.filter.row){
			this.filter.deselectButtons(this);
			this.select();
			this.filter.currentType = this.type;
			this.filter.applyFilters();

		}
	} else{
		if (this.filter.row){
			this.filter.showAllButtons();
			this.filter.currentType = '';
			this.filter.applyFilters();

		}
	}
}

