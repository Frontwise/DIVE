function Config(){
	// entity types visible in the filter
	this.entityTypes = ['Event','Concept','Place','Person','MediaObject','Collection'];

	// API root url
	this.APIPath = "vu/api/v2/";
	// adds basePath to APIPath
	this.addBasePath = true;

	if (location.hash == "#go" || false) {
		this.ImagePath = "http://dive.local:8080/images/search";
		this.APIPath = "http://dive.local:8080/vu/api/vgo1/";

		/*this.ImagePath = "http://dive.beeldengeluid.nl:8080/images/search";
		this.APIPath = "http://dive.beeldengeluid.nl:8080/vu/api/vgo1/";*/

		this.addBasePath = false;
	}


	// cases to be loaded in the gallery
	this.galleryCases = [
	{caseType : 'Related', identifier: 'http://purl.org/collections/nl/dive/entity/kb-org-Hare+Majesteit+Koningin+Juliana'},
	{caseType : 'Related', identifier: 'http://purl.org/collections/nl/dive/entity/eb9834fad308e45ba85ac58110286c4c'},
	{caseType : 'Related', identifier: 'http://purl.org/collections/nl/dive/entity/kb-per-Truman'},
	{caseType : 'Related', identifier: 'http://purl.org/collections/nl/dive/entity/e96e50e3564fd8d1373b0337d508f0d7'},
	];

	// search suggestions
	this.searchSuggestions = ['Verenigde Naties','Rotterdam','Verkiezingen','Kaasmarkt','Lubbers','Vredespaleis'];


	// content buttons
	this.contentButtons = [
	['Details','Entity details, relations and sources'],
	['Comments','View and add comments to this entity'],
	['Collections','View and assign collections to this entity'],
	['Europeana','Discover related items on Europeana'],
	/*['Share','Share sample dialog, not worked out']*/
	];
}


