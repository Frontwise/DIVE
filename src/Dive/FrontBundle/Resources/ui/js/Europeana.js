/* Contentview Europeana shows related Europeana content for an entity */

function Europeana(entity){
	this.$container;
	this.$europeana;
	this.entity = entity;
	this.loaded = false;
	this.init();
}

/* INIT */

/*  Init the Europeana object */

Europeana.prototype.init = function(){
	this.build();
}


/*  Builds Europeana html */
Europeana.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('content').addClass('content-europeana').data('content',this);
	// easy way: append Europeana search widget
	//this.$container.append('<script type="text/javascript" src="http://www.europeana.eu/portal/themes/default/js/eu/europeana/min/EuSearchWidget.min.js?sw=true&query=WATER&withResults=true&theme="></script>');
}

/* HELPERS */
Europeana.prototype.getContainer = function(){
	return this.$container;
}

Europeana.prototype.show = function(){
	if (!this.loaded){
		this.load();
	}
}

/*  DATA */

/* load related Europeana objects from Europeana */
Europeana.prototype.load = function(){
	if (this.loaded){
		return;
	}
	this.$container.html('').addClass('loading_white');
	// get Europeana data from server
	// REST API docs: http://www.europeana.eu/portal/api-search-json.html#Item
	$.getJSON('http://europeana.eu/api/v2/search.json?callback=?&wskey='+ Global.europeanaKey,{
		query :  this.entity.getTitle(),
		rows: 20

	},function(data){
		this.$container.removeClass('loading_white');
		console.log(data);
		if(!data || !data.success || !data.totalResults){
			// not found
			this.$container.append($(document.createElement('span')).addClass('notice').text('No items found on Europeana for ' + this.entity.getTitle() ));
		} else{
			this.$container.append($(document.createElement('span')).addClass('notice').text(data.totalResults + ' items found on Europeana for ' + this.entity.getTitle() ));
			this.appendData(data);
		}
	}.bind(this));

	this.loaded = true;
this.showContainer();
}

Europeana.prototype.showContainer = function (){
	this.$container.velocity('stop').velocity("slideDown",  {
		queue: false,
		easing: Global.easing,
		duration: Global.animationDuration
	});
}

/* append Europeana data to container */
Europeana.prototype.appendData = function(data){
	for (var i in data.items){
		var $title = $(document.createElement('span')).html(String(data.items[i].title).trunc(120));
		var $image = $(document.createElement('div')).addClass('image');
		if (data.items[i].edmPreview) {
			$image.css('backgroundImage','url('+data.items[i].edmPreview[0]+')');
		} else{
			$image.css('backgroundImage','url(/img/europeana-notfound.png'+')');
		}
		var $item = $('<a/>').attr('href',data.items[i].guid).attr('target','_blank').addClass('item').append($image).append($title);
		this.$container.append($item);
	}
}
