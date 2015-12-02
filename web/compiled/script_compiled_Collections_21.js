/* Contentview Collections shows the collections an entity belongs to and lets registered User add an entity to a collection */
function Collections(entity){
	this.$container;

	this.$assign;
	this.$collectionList;
	this.$collections;

	this.entity = entity;
	this.loaded = false;
	this.body = false;
	this.init();
}

/* INIT */
/* init Collections object */
Collections.prototype.init = function(){
	this.build();
}

/* User is updated (login/logout) */
Collections.prototype.userUpdate = function(){
	if (this.loaded){
		this.$collections.empty();
		this.$assign.empty();
		this.loaded = false;
		this.loadCollectionList();
		this.load();
	}
}

/* build html */

Collections.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('content').addClass('content-collections').data('content',this);
}

/* add Body */
Collections.prototype.addBody = function(){
	this.$collections = $(document.createElement('div')).addClass('collections');
	this.$container.append(this.$collections);
	this.$assign = $(document.createElement('div')).addClass('assign');
	this.$container.prepend(this.$assign);
	this.body = true;
}

/* HELPERS */

Collections.prototype.getContainer = function(){
	return this.$container;
}

Collections.prototype.show = function(){
	if (!this.body){
		this.addBody();
	}
	if (!this.loaded){
		this.loadCollectionList();
		this.load();
	}
}
/* DATA */

/* STATIC EDIT COLLECTION POPUP */

Collections.prototype.editCollectionPopup = function(title,collection){
	var popup= new Popup(title,
		'<label>Collection title</label><input type="text" maxlength="255" class="collection-title" placeholder="My collection title"><br><label>Description</label><textarea class="collection-description"></textarea><br><label>Public</label><input type="checkbox" checked class="collection-public" />',
		{
			'cancel': {
				label: 'Cancel',
				click : function(){
					$(window).trigger('popup-hide');
				}
			},
			'ok': {
				label: 'Create',
				click : function(){
					$.post(Global.basePath + 'collection/'+collection+'/add', {
						uid: this.entity.getUID(),
						title: $('#popup input.collection-title').val(),
						'public': $('#popup input.collection-public').is(':checked'),
						description: $('#popup textarea.collection-description').val()
					}, function(data){
						this.loaded = false;
						this.load();
						Global.user.refresh();
						$(window).trigger('popup-hide');
					}.bind(this)
					); }.bind(this)
				}
			}
			);
	$('#popup input.collection-title').focus();
}


/* Load user's collections and append to assign form */
Collections.prototype.loadCollectionList = function(){

	if (!Global.user.current){
		this.$assign.text('Please log in to add entities to your collections');

	} else{
		this.$assign.text('Add entity to a collection:');
		var userCollections = Global.user.getCollections();
		if (userCollections.length > 0){
			userCollections.push ( $(document.createElement('option')).attr('disabled','disabled').text('──────────') );
		}
		userCollections.push ( $(document.createElement('option')).attr('value','new').text('Create new collection') );
		this.$collectionList = $('<select/>').addClass('collection-list-user').append(userCollections);
		this.$assign.append(this.$collectionList);
		this.$assign.append();
		this.$assign.append($('<button/>').text('Add').click(function(){
			var collection = this.$collectionList.val();
			if (!collection){
				return;
			}
			if (collection == 'new'){
				this.editCollectionPopup('Create new collection','new');
			} else{
				$.post(Global.basePath + 'collection/'+collection+'/add', {
					uid: this.entity.getUID()
				}, function(data){
					this.loaded = false;
					this.load();
				}.bind(this)
				);
			}
		}.bind(this)))
	}

}


/* Load all collections the entity belongs to */
Collections.prototype.load = function(){
	if (this.loaded){
		return;
	}
	this.$container.addClass('loading_white');
	this.$collections.css('min-height', this.$collections.height()).html('');
	// get collections from server
	$.getJSON(Global.basePath + 'entity/collections',{
		uid: this.entity.getUID()
	},function(data){
		this.$container.removeClass('loading_white');
		if(!data || !data.success){
			// not found
			this.$collections.append($('<h1/>').text('Public collections'));
			this.$collections.append($('<h3/>').text('Entity doesn\'t belong to a public collection yet'));
		} else{
			this.entity.setCollectionCount(data.data.length, data.owner);
			// owned collections
			if (Global.user.current){
				this.$collections.append($('<h1/>').text('My collections'));
				var results = 0;
				for(var i in data.data){
					if (data.data[i].owner == Global.user.current.id){
						results ++;
						var $collection = $(document.createElement('div')).addClass('collection').append(
							$('<span/>').addClass('name').text(data.data[i].title)
							).append(
							$('<button/>').addClass('remove').addClass('ok').text('Open collection').click(function(){
								$('#search-field').val('Collection:' + data.data[i].id);
								Global.search.performSearch(true);
							}.bind(this)
							)
							).append(
							$('<button/>').addClass('remove').text('Remove from collection').click(function(){
								$.post(Global.basePath + 'collection/'+data.data[i].id+'/remove', {
									uid: this.entity.getUID()
								}, function(data){
									Global.user.refresh();
								});
							}.bind(this))
							);
							this.$collections.append($collection);
						}
					}
					if (!results){
						this.$collections.append($('<h3/>').text('Entity doesn\'t belong to any of your collections'));
					}
				}
				this.$collections.append($('<h1/>').text('Public collections'));
				var results = 0;
				for(var i in data.data){
					if (data.data[i].owner != Global.user.current.id){
						results ++;
						var $collection = $(document.createElement('div')).addClass('collection').append(
							$('<span/>').addClass('name').text(data.data[i].title)
							);
						this.$collections.append($collection);
					}
				}
				if (!results){
					this.$collections.append($('<h3/>').text('Entity doesn\'t belong to a public collection yet'));
				}
			}
		}.bind(this));
this.loaded = true;
this.showContainer();
}

Collections.prototype.showContainer = function (){
	this.$container.velocity('stop').velocity("slideDown",  {
		queue: false,
		easing: Global.easing,
		duration: Global.animationDuration
	});
}