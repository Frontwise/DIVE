/* HashPath loads entities or collections from the url */
function HashPath(container){
	this.action = '';
	this.parameters = [];
	this.init();
}

/* INIT */
/* init HashPath object */
HashPath.prototype.init = function(){
	this.preload();
}

/* preload action based on hash info */
HashPath.prototype.preload = function(){
	var hash = document.location.hash;
	if (hash && hash != '#'){
		this.parameters = hash.substr(1).split('\\');
		this.action = this.parameters.shift(); // get and remove first item of array
	}
}

/* action */
HashPath.prototype.getAction = function(){
	return this.action;
}

/* parameters */
HashPath.prototype.getParameters = function(){
	return this.parameters;
}

/* set hash */
HashPath.prototype.set = function(action, parameters){
	this.action = action;
	this.parameters = parameters;
	document.location.hash = "#" + action + "\\" +this.parameters.join("\\");
	return document.location.href;
}

/* set hash for entity */

HashPath.prototype.setEntity = function(entity){
	// set HashPath
	if (entity.isCollection()){
		return this.set('browser',['collection',entity.getUID()]);
	} else{
		return this.set('browser',['entity',entity.getUID()]);
	}
	return false;
}


HashPath.prototype.getUrlForEntity = function(entity){
	return this.setEntity(entity);
}

