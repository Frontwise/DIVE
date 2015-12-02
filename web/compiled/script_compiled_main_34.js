Global.browser;
Global.search;
Global.gallery;

$(document).ready(function(){
	// ipad check standalone > add top bar
	if (Global.touchSupport && window.navigator.standalone){
		$('body').addClass('touch-support');
	}


	// load interface
	Global.search = new Search();
	Global.help = new Help();
	Global.data = new Data();
	
	Global.easing = "easeOutSine";
	Global.animationDuration = 400;
	//Global.easing = "linear";

	Global.user = new User();
	Global.collectionMenu = new CollectionMenu();
	Global.browser = new Browser('#browser');
	Global.filterActions = new FilterAction('#content');
	Global.gallery = new Gallery('#gallery');

	Global.hashPath = new HashPath();
	Global.preload = new Preload(Global.hashPath);

	// automatically load a search
	//$('#search-field').val('Verenigde Naties').trigger('change');
	//$('#search-field').val('Amsterdam').trigger('change');


	// mutation observer for DOM changes
	if (false){
		MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		var observer = new MutationObserver(function(mutations, observer) {
			console.log(mutations, observer);
		});

		observer.observe(document, {
			subtree: true,
			attributes: true
  //...
});
	}
}
);