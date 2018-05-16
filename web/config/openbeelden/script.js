function Config(){
	// entity types visible in the filter
	this.entityTypes = ['Event','Concept','Place','Person','MediaObject'];

	// API root url
	this.APIPath = "openbeelden/api/v2/";
	// adds basePath to APIPath
	this.addBasePath = true;

	// cases to be loaded in the gallery
	this.galleryCases = ['person-queen-juliana-der-nederlanden', 'oai:openimages.eu:679187','concept-vredespaleis'];

	// search suggestions
	this.searchSuggestions = ['Verenigde Naties','Haarlem','Verkiezingen','Kaasmarkt','Watersnood','Vredespaleis'];


	// content buttons
	this.contentButtons = [
		['Details','Entity details, relations and sources'],
		['Comments','View and add comments to this entity'],
		['Collections','View and assign collections to this entity'],
		['Europeana','Discover related items on Europeana'],
		/*['Share','Share sample dialog, not worked out']*/
	];
}


