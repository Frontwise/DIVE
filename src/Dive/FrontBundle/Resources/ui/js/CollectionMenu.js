/* manages collections, login, logout etc */
function CollectionMenu(){
	this.$container;
	this.current = false;
	this.hideTimer;
	this.preventHideTimer;
	this.$savePathButton;
	this.$showCollectionsButton;
	this.init();
}


/* INIT */

CollectionMenu.prototype.init = function(){
	this.$container = $('#collection-menu');
	this.build();
	this.initListeners();
}

/* BUILD */

CollectionMenu.prototype.build = function(){
	this.$savePathButton = $(document.createElement('button')).text('Save current path').hide();
	this.$container.append(this.$savePathButton);

	this.$showCollectionsButton = $(document.createElement('button')).text('Show my collections').addClass('collection-button');
	this.$container.append(this.$showCollectionsButton);
}


/* INTERACTION */

CollectionMenu.prototype.initListeners = function(){

	/* collection menu leave */
	this.$container.on('mouseleave',function(event){
		if (this.$container.is(':visible')){
			if (this.preventHideTimer){ return; }
			this.hideTimer = setTimeout(function(){
				this.$container.velocity('stop').velocity('slideUp',{ queue: false,easing: 'easeOutSine', });
			}.bind(this),1000);
		}
	}.bind(this));

	/* collection menu leave */
	this.$container.on('mouseenter',function(event){
		clearTimeout(this.hideTimer);
	}.bind(this));

	/* collection menu leave */
	this.$container.on('mousedown',function(event){
		this.preventHideTimer = true;
		clearTimeout(this.hideTimer);
		setTimeout(function(){ this.preventHideTimer = false; }, 2000);
	}.bind(this));


	/* collection button hover */
	$('#collections-button').on('mouseenter',function(event){
		if (!this.$container.is(':visible')){
			clearTimeout(this.hideTimer);
			$('.top-menu').not(this.$container).velocity('stop').velocity('slideUp',{ queue: false,easing: 'easeOutSine', });
			this.$container.velocity('stop').velocity('slideDown',{ queue: false,easing: 'easeOutSine', });
		}
	}.bind(this));

	/* collection button clicked */
	$('#collections-button').click(function(event){
		clearTimeout(this.hideTimer);
		if (this.$container.is(':visible')){
			this.$container.css('height','auto');
			this.$container.velocity('stop').velocity('stop').velocity('slideUp',{ queue: false,easing: 'easeOutSine', });
		} else{
			this.$container.css('height','auto');
			$('.top-menu').not(this.$container).velocity('stop').velocity('slideUp',{ queue: false,easing: 'easeOutSine', });
			this.$container.velocity('stop').velocity('slideDown',{ queue: false,easing: 'easeOutSine', });
		}
		event.stopImmediatePropagation();
		return false;
	}.bind(this));

	/* save path to collection */
	this.$savePathButton.click(function(){
		var popup= new Popup('Create new collection, based on current path',
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
						$('.top-menu').hide();
						var uids = '';
						for (var i=0, len = Global.browser.rows.length; i < len; i++){
							if (Global.browser.rows[i].currentEntity != null){
								if (uids != ''){
									uids += ',';
								}
								uids += Global.browser.rows[i].currentEntity.getUID();
							}
						}
						$.post(Global.basePath + 'collection/new/add', {
							uids: uids,
							title: $('#popup input.collection-title').val(),
							description: $('#popup textarea.collection-description').val(),
							'public': $('#popup input.collection-public').is(':checked')
						}, function(data){
							Global.user.refresh();
							$(window).trigger('popup-hide');
						}.bind(this)
						); 
					}.bind(this)
				}
			});
$('#popup input.collection-title').focus();
});

/* load my collections */
this.$showCollectionsButton.click(function(){
	$('.top-menu').hide();
	$('#search-field').val('My collections');//.trigger('change');
	Global.search.performSearch(true);
});

}