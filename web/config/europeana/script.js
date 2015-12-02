function Config(){

	this.entityTypes = ['Link','Concept','Place','Person','MediaObject','Collection'];

	// API root url
	this.APIPath = "europeana/api/v2/";
	// adds basePath to APIPath
	this.addBasePath = true;

	// this.APIPath = "http://dive.local:8080/vu/api/vgo1/"; this.addBasePath = false;

	this.galleryCases =[
	{caseType: 'Related', identifier:'/2022067/10796_AFEF257C_C017_4FC8_93D5_419CB986727D'},
	{caseType: 'Related', identifier:'/2021608/dispatcher_aspx_action_search_database_ChoiceCollect_search_priref_38543'}
	];

	this.searchSuggestions = ['Amsterdam','Rotterdam','Verkiezingen','Kaasmarkt','Rembrandt'];

	// content buttons
	this.contentButtons = [
	['Details','Entity details, relations and sources'],
	['Comments','View and add comments to this entity'],
	['Collections','View and assign collections to this entity'],
	['Europeana','Discover related items on Europeana'],
	/*['Share','Share this entity']*/
	];
}



