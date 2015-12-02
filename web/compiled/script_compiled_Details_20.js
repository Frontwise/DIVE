/* Contentview for details is used to show description, sources, relations of an entity */

function Details(entity){
	this.$container;
	this.$description;
	this.$action;
	this.$relatedness;
	this.$sources;
	this.entity = entity;
	this.loaded = false;
	this.partialLoaded = false;
	this.init();
}

/* INIT */

/* init Details objects */

Details.prototype.init = function(){
	this.build();
}

/* build html */

Details.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('content').addClass('content-details').data('content',this);
}

Details.prototype.addBody = function(){	
	this.$relatedness = $(document.createElement('div')).addClass('relations');
	this.$container.append(this.$relatedness);

	this.$sources = $(document.createElement('div')).addClass('sources');
	this.$container.append(this.$sources);

	this.$action = $(document.createElement('div')).addClass('action');
	this.$container.append(this.$action);


	this.$description = $(document.createElement('div')).addClass('description');
	this.$container.append(this.$description);

}

/* HELPERS */

Details.prototype.getContainer = function(){
	return this.$container;
}

Details.prototype.show = function(){
	if (!this.loaded){
		this.load();
	}
}

/* DATA */

/* Load details from API */
Details.prototype.load = function(){
	if (this.loaded){
		return;
	}
	this.loaded = true;

	this.addBody();
	this.$container.addClass('loading_white');
	if (this.entity.row.entity){
		this.entity.data.relatedness = [];
		if (this.entity.data.uid == this.entity.data.event){
			this.entity.data.relatedness.push('Direct relation');
		} else{
			this.entity.data.relatedness.push('Related by event ' + this.entity.data.event);
		}
		this.partialLoaded = true;
	} else{
		this.entity.data.relatedness = [];
		this.entity.data.relatedness.push('Related by ' + this.entity.row.relatedness);
		this.partialLoaded = true;
	}

	if (this.entity.isCollection()){
		this.addContents();
	} else{
		Global.data.getEntity(this.entity.getUID(), this.detailsSuccess.bind(this));
	}

}

Details.prototype.detailsSuccess = function(data){
	if (!data || !data.data){ return; }
	if (data.data.length > 0){
		this.entity.data.description = '';
		if (this.entity.data.type == 'Event'){
			this.entity.data.description += this.entity.data.date.start ? this.entity.data.date.start + ' : ' : "Unknown timestamp : ";
		}
		this.entity.data.description += data.data[0].description
		this.entity.data.sources = [];
		var checkSources = [];
		var link;
		for(var i=0, len = data.data.length; i<len; i++){
			link = data.data[i].sources;
			if(link){
				if (typeof checkSources[link] == 'undefined'){
					this.entity.data.sources.push(link);
					checkSources[link] = true;
				}
			}
		}
		if (this.partialLoaded){
			this.addContents();
		} else{
			this.partialLoaded = true;
		}
	} else{
		this.entity.data.description = 'No details found. ' + data.data.error ? data.data.error : '';
	}
	this.loaded = true;
	this.$container.removeClass('loading_white');
	this.showContainer();
}

Details.prototype.showContainer = function (){
	this.$container.velocity('stop').velocity("slideDown",  {
		queue: false,
		easing: Global.easing,
		duration: Global.animationDuration
	});
}


Details.prototype.relatednessSuccess = function(data){
	if (!data || !data.data){ return; }
	var results = data.data.results.bindings;
	if (results && results.length){
		this.entity.data.relatedness = [];
		var e;
		for(var i=0, len = results.length; i<len; i++){
			e = Global.parser.getEvent(results[i]);
			if(e){
				this.entity.data.relatedness.push('Related by common event ' + e);
			}
		}
		if (this.partialLoaded){
			this.addContents();
		} else{
			this.partialLoaded = true;
		}

	}
	this.loaded = true;
	this.$container.removeClass('loading_white');
}

Details.prototype.relatednessTypesSuccess = function(data){
	if (!data || !data.data){ return; }
	var results = data.data.results.bindings;
	if (results && results.length){
		this.entity.data.relatedness = [];
		var r;
		for(var i=0, len = results.length; i<len; i++){
			r = Global.parser.getRelatedness(results[i]);
			if(r){
				this.entity.data.relatedness.push(r);
			}
		}
		if (this.partialLoaded){
			this.addContents();
		} else{
			this.partialLoaded = true;
		}

	}
	this.loaded = true;
	this.$container.removeClass('loading_white');
}


/* add detail information to the object */
Details.prototype.addContents = function(){
	this.$container.removeClass('loading_white');
		// description
		this.$description.text(this.entity.data.description);
		this.$description.html(this.$description.text().replace(/(?:\r\n|\r|\n)/g, '<br />'));

		// WTODO:
		// add entity-sharing information (twitter/facebook)
		//

		// collection edit details
		if (this.entity.isCollection()){
			this.$action.append(
				$(document.createElement('button')).addClass('ok').text('Edit collection details').click(
					function(){
						this.editCollectionDetails('Edit collection details',this.entity.isCollection(),this.entity.data.title,this.entity.data.description,this.entity.data['public']);
					}.bind(this)
					)
				).append(
				$(document.createElement('button')).addClass('delete').text('Delete collection').click(
					function(){
						this.confirmDelete('Delete collection',this.entity.isCollection());
					}.bind(this)
					)
				);

			} else{
			// normal entity
			this.$action.append(
				$(document.createElement('button')).addClass('ok').text('Improve entity').click(
					function(){
						this.editEntityDetails('Improve entity',this.entity);
					}.bind(this)
					)
				)
		}

		// normal entity
		this.$action.append(
			$(document.createElement('button')).addClass('ok twitter').text('Share on Twitter').click(
				function(){
					window.open('https://twitter.com/intent/tweet?text=Check out this DIVE entity: ' + encodeURIComponent(Global.hashPath.getUrlForEntity(this.entity)));
				}.bind(this)
				)
			);


	// relations
	this.$relatedness.html('');
	for (var i=0, len = this.entity.data.relatedness.length; i<len;i++){
		var $related = $(document.createElement('span')).text(this.entity.data.relatedness[i]).addClass('entity-color');
		this.$relatedness.append($related);
	}
	// sources
	this.$sources.html('');
	for (var i=0, len = this.entity.data.sources.length; i < len; i++){
		var $source = $(document.createElement('span')).text(this.entity.data.sources[i]);
		this.$sources.append($source);
	}
	this.showContainer();
}

/* Suggest new entity information */

Details.prototype.editEntityDetails = function(title,entity){
	var checked = true;
	var options = '';
	var selected = '';
	for(var i = 0, len = Global.config.entityTypes.length; i<len; i++){
		 // exclude collection from type list
		 if (Global.config.entityTypes[i] == 'Collection'){ continue; }
		// populate options
		if (Global.config.entityTypes[i] == entity.getType()){
			selected = 'selected="true"';
		} else{
			selected = '';
		}
		options += '<option '+ selected+'value="'+ Global.config.entityTypes[i]+'">'+Global.config.entityTypes[i]+'</option>'
	}
	var $form = $('<div><label>Title</label><input type="text" maxlength="255" class="entity-title" placeholder="Entity title" value=""><br><label>Description</label><textarea class="entity-description"></textarea><br><label>Type</label><select class="entity-type">'+options+'</select></div>');
	$form.find('.entity-title').attr('value',entity.data.title);
	$form.find('.entity-description').text(entity.data.description);

	var popup= new Popup(title,
		$form.html(),
		{
			'cancel': {
				label: 'Cancel',
				click : function(){
					$(window).trigger('popup-hide');
				}
			},
			'ok': {
				label: 'Save',
				click : function(){
					var newTitle = $('#popup .entity-title').val();
					var newType = $('#popup .entity-type').val();
					var newDescription = $('#popup .entity-description').val();
					var checkId = this.entity.getUID();
					Global.browser.updateEntity(checkId,newTitle,newDescription,newType);
					AjaxLog.info('Improve Entity',JSON.stringify({'uid': entity.getUID(), 'type':newType, 'title':newTitle, 'description':newDescription }));

					Global.user.refresh();
					$(window).trigger('popup-hide');
				}.bind(this)
			}
		}
		);
	$('#popup input.entity-title').focus();
}

/* Edit collection details */

Details.prototype.editCollectionDetails = function(title,collection,collectionTitle,collectionDescription,collectionPublic){
	var checked = ((collectionPublic == 'true' || collectionPublic==true) ? "checked" : "");
	var $form = $('<div><label>Collection title</label><input type="text" maxlength="255" class="collection-title" placeholder="My collection title" value=""><br><label>Description</label><textarea class="collection-description"></textarea><br><label>Public</label><input type="checkbox" '+ checked +' class="collection-public" /></div>');
	$form.find('.collection-title').val(collectionTitle);
	$form.find('.collection-description').val(collectionDescription);
	var popup= new Popup(title,
		$form.html(),
		{
			'cancel': {
				label: 'Cancel',
				click : function(){
					$(window).trigger('popup-hide');
				}
			},
			'ok': {
				label: 'Save',
				click : function(){
					var newTitle = $('#popup input.collection-title').val();
					var newPublic = $('#popup input.collection-public').is(':checked');
					var newDescription = $('#popup textarea.collection-description').val();
					var checkId = this.entity.getUID();
					Global.browser.updateEntity(checkId,newTitle,newDescription,newPublic);

					$.post(Global.basePath + 'collection/'+collection+'/edit', {
						title: newTitle,
						'public': newPublic,
						description: newDescription
					}, function(data){
						Global.user.refresh();
						$(window).trigger('popup-hide');
					}.bind(this)
					); }.bind(this)
				}
			}
			);
	$('#popup input.collection-title').focus();
}

/* Delete a collection */

Details.prototype.confirmDelete = function(title,collection){
	var popup= new Popup(title,
		'<label>Are you sure you want to delete this collection?</label>',
		{
			'cancel': {
				label: 'Cancel',
				click : function(){
					$(window).trigger('popup-hide');
				}
			},
			'delete': {
				label: 'Delete',
				click : function(){
					var checkId = this.entity.getUID();
					Global.browser.deleteEntity(checkId);
					$.post(Global.basePath + 'collection/'+collection+'/delete', {
					}, function(data){
						Global.user.refresh();
						$(window).trigger('popup-hide');
					}.bind(this)
					); }.bind(this)
				}
			}
			);
	$('#popup').css('height','250px');
}