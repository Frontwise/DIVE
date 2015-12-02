function DataEntity(){
	this.uid = '';
	this.type = 'Unknown';
	this.title = 'Untitled Entity';
	this.description = '';
	this.sources = [];
	relatedness = [];
	this.date = {
		"start": false,
		"end": false
	};
	this.depicted_by = {
		"placeholder": false,
		"source": false
	};
	this.event = false;

	this.relatedEntities = false;
}