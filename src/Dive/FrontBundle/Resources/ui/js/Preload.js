/* Preload handles the preload info from HashPath */
function Preload(hashPath){
	this.hashPath = hashPath;
	this.rowPreload = false;
	this.init();
}

/* INIT */
/* init preload object */
Preload.prototype.init = function(){
// 	http://dive.local/app_dev.php#browser\entity\http://purl.org/collections/nl/dive/entity/kb-loc-Akihito

	if (!this.hashPath.getAction()){ return; }
	console.log('Action: ',this.hashPath.getAction());
	switch(this.hashPath.getAction()){
		case 'browser':
			switch(this.hashPath.parameters[0]){
				case 'entity':
					Global.search.setKeywords('Entity:'+this.hashPath.parameters[1]);
					this.rowPreload = true;
				break;
				case 'collection':
					Global.search.setKeywords('Collection:'+this.hashPath.parameters[1]);
					this.rowPreload = true;
				break;
			}
		break;
		case 'about':
			$('#help-button').click();
		break;
		/*case 'gallery':
			switch(this.hashPath.parameters[0]){
				case 'entity':
					Global.gallery.loadEntity(this.hashPath.parameters[1]);
				break;
				case 'collection':
					Global.gallery.loadCollection(this.hashPath.parameters[1]);
				break;
			}
		break;*/
	}
}

