/* Search handles the search request from the interface to the browser */

function Search(){
	this.keywords = '';
	this.filter = new Filter(null);
	this.searchTimer;
	this.searchTimeout = 1000;
	this.init();
	this.lastKeywords = '';
}

/* INIT */

Search.prototype.init = function(){
	this.buildSuggestions();
	this.initListener();
	this.buildFilter();
}


Search.prototype.buildSuggestions = function(){
	$suggestions = $('#suggestions');
	for(var i =0, len = Global.config.searchSuggestions.length;i<len;i++){
		$suggestions.append($(document.createElement('span')).text(Global.config.searchSuggestions[i]));
	}
}

/* build filter holder */
Search.prototype.buildFilter = function(){
	$('#search-filter').append(this.filter.getContainer());
}

/* INTERACTION */

Search.prototype.initListener = function(){
	/* search field listener */
	$('#search-field').on('keyup', function(event){
		if (event.keyCode == 13){
			this.search(true);
		} else{
			this.search(false);
		}
	}.bind(this)).on('change', function(){
		this.search(false);
	}.bind(this));


	var search = this;
	/* search suggestions */
	$('#suggestions').on('click','span',function(e){
		$('#search-field').val($(this).text());
		search.search(true);
	});

	$('#search-cross').click(function(){
		$(this).hide();
		$('#search-field').val('').trigger('change');
	});
}


/* handles search request */

Search.prototype.search = function(skipCheck){
	var keywords = this.getKeywords();
	if (keywords){
		$('#search-cross').show();
		// high light suggestions
		$('#suggestions span').each(function(){
			if ($(this).text() == keywords){
				$(this).addClass('current');
			} else{
				$(this).removeClass('current');
			}
		});
	}

	clearTimeout(this.searchTimer);
	this.searchTimer = setTimeout(this.performSearch.bind(this,skipCheck), this.searchTimeout)
}

Search.prototype.performSearch = function(skipCheck){
	var keywords = this.getKeywords();
	if (keywords && (this.lastKeywords != keywords || skipCheck)){
		this.keywords = keywords;
		Global.browser.clear();
		Global.browser.show();
		Global.browser.addSearch(keywords);
		this.filter.getContainer().show();
		this.lastKeywords = keywords;
		AjaxLog.info('Search',keywords);
	}
}

Search.prototype.getKeywords = function(){
	return $('#search-field').val().trim();
}

Search.prototype.setKeywords = function(keywords){
	$('#search-field').val(keywords);
	this.search();
}

