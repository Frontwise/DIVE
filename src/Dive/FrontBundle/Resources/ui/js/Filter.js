/* The filterbar holds entity-type and keyword filters */
function Filter(entity){
	this.$container;
	this.$entityFilters;
	this.$textFilter;

	this.$connections;
	this.$direct;
	this.$indirect;

	this.$filterDepth;
	this.$input;
	this.entity;
	this.row = null;
	this.buttons = [];
	this.data = [];
	this.currentType = '';
	this.textFilterTimer;
	this.visible = false;

	this.filterDirect = true;
	this.filterIndirect = true;
	this.hasAutoComplete = false;
	this.autoComplete = [];

	// finally
	this.init();
}

/* INIT */
/* create Filter object */
Filter.prototype.init = function(){
	this.build();
}

/* build html */
Filter.prototype.build = function(){
	// container
	this.$container =$(document.createElement('div')).addClass('entity-color').addClass('filters').addClass('hidden').data('filter',this);

	// container.filters
	this.$input = $(document.createElement('input')).attr('type','text').attr('placeholder','Filter by keyword');
	this.$input.on('change',this.textFilterChange.bind(this));
	this.$input.on('keyup',this.textFilterChange.bind(this));

	this.$textFilter = $(document.createElement('div')).addClass('text-filter').append(this.$input);

	this.$connections = $(document.createElement('div')).addClass('connections');
	this.$direct = $(document.createElement('div')).addClass('direct').text('0').attr('title','Direct related entities');
	this.$indirect = $(document.createElement('div')).addClass('indirect').text('0').attr('title','Indirect related entities');


	this.$connections.append(this.$direct).append(this.$indirect);
	this.$textFilter.append(this.$connections);

	this.$entityFilters = $(document.createElement('div')).addClass('entity-filters');

	// add filters to entityFilter
	for (var i=0, len = Global.config.entityTypes.length; i< len; i++){
		var button = new Button(this,Global.config.entityTypes[i]);
		this.buttons.push(button);
		this.$entityFilters.append(button.getContainer());
	}
	this.$container.append(this.$textFilter).append(this.$entityFilters);
}

// init auto complete on filter text input
Filter.prototype.initAutoComplete = function(){
	if (this.hasAutoComplete){ return; }
	this.$input.autocomplete(
	{
		source:[],
		select: this.textFilterChange.bind(this)
	});
	this.$input.autocomplete('option', 'source', this.autoComplete);
}

Filter.prototype.show = function(){
	if(!this.visible){
		this.visible = true;
		this.$container.show();
	}
}


Filter.prototype.hide = function(){
	if(this.visible){
		this.visible = false;
		this.$container.hide();
	}
}

/* CONNECTIONS */

Filter.prototype.setDirect = function(value){
	this.$direct.text(value);
}

Filter.prototype.setIndirect = function(value){
	this.$indirect.text(value);
}


/* BUTTONS */


/* all buttons to deselected state */
Filter.prototype.deselectButtons = function(excludeButton){
	for (var i=0, len = this.buttons.length; i <len; i++){
		if (this.buttons[i].type != 'Link' && this.buttons[i] != excludeButton){
			this.buttons[i].deselect();
		}
	}
}

/* alle buttons to visible (selected) state */

Filter.prototype.showAllButtons = function(){
	for (var i=0, len = this.buttons.length; i <len; i++){
		this.buttons[i].select();
	}
}

/* HELPERS */

Filter.prototype.getContainer = function(){
	return this.$container;
}


/* handle visibility depending on requested visibility and availability of related data */
Filter.prototype.setVisible = function(visible){
	if (this.row && visible){
		this.$container.removeClass('hidden');
		this.$entityFilters.find('.button').show();
	} else{
		this.$container.addClass('hidden');
	}
}

Filter.prototype.setRow = function(row){
	this.row = row;
	this.setVisible(true);
	this.getCounts();
}

/* COUNTS */

/* count the prevalence of each entity type and fill the correspondending button label */
Filter.prototype.getCounts = function(){
// get counts
var counter = {'Link':this.row.entities.length};
for (var i=0, len = this.row.entities.length; i < len; i++){
	if (typeof(counter[this.row.entities[i].data.type]) == 'undefined'){
		counter[this.row.entities[i].data.type] = 1;
	} else{
		counter[this.row.entities[i].data.type]++;
	}
}
	// reset counts
	for (var j = 0, len = this.buttons.length; j< len; j++){
		this.buttons[j].setTitle('0');
	}
	// apply counts
	for(var i in counter){
		for (var j = 0, len = this.buttons.length; j< len; j++){
			if (this.buttons[j].type == i){
				this.buttons[j].setTitle(counter[i]);
			}
		}
	}
	this.setDirect(counter['Link']);
}

/* FILTERS */

/* handle the timed keyword filter */
Filter.prototype.textFilterChange = function (e){
	clearTimeout(this.textFilterTimer);
	var keywords = this.$input.val();
	this.textFilterTimer = setTimeout(function(){
		this.applyFilters();
	}.bind(this), 200);
}

/* apply the keyword filter */
Filter.prototype.applyFilters = function(){
	console.log("apply filters");
	var keywords = this.$input.val();
	this.row.showFilteredEntities(this.currentType, keywords);
	console.log(this,this.row,this.currentType,keywords);
}


Filter.prototype.loadAutoComplete = function(list){
	this.autoComplete = list;
	if (this.hasAutoComplete){
		this.$input.autocomplete('option', 'source', this.autoComplete);	
	}
}

