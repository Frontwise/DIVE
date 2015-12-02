function Data(){
	// limit max number of results
	this.entityLimit = Global.touchSupport ? 500 : 1600;

	// entity request cache
	this.entityRequestCache = [];
	this.loadingEntity = 0;

	// related request cache
	this.relatedRequestCache = [];
	this.relatedRequestPrioCache = [];
	this.loadingRelated = 0;
	this.maxQueue = 20;
	// cache related entities
	this.relatedEntitiesCache = [];
}


/* LOAD ENTITY */

Data.prototype.cacheEntityRequest = function(id, onSuccess, priority){
	this.loadingEntity++;
	if (priority){
		this.entityRequestCache.unshift([id,onSuccess, priority]);
	} else{
		this.entityRequestCache.push([id,onSuccess, priority]);
	}

}

Data.prototype.getNextEntityRequest = function(id, onSuccess){
	this.loadingEntity--;
	if (this.entityRequestCache.length > 0){
		var request = this.entityRequestCache.shift();
		this.getEntity(request[0],request[1]);
		if (this.loadingEntity < this.maxQueue-1){
			this.getNextEntityRequest();
		}
	}

}

Data.prototype.getEntity = function(id,onSuccess,priority){
	if (this.loadingEntity > this.maxQueue){
		// add to request cache
		this.cacheEntityRequest(id,onSuccess,priority);
		return;
	}
	var ms = +new Date();
	var url = Global.APIPath + 'entity/details';
	var t = this;
	this.loadingEntity = true;
	$.ajax({
		dataType: "json",
		url: url,
		data: {
			id: id
		},
		success: function(data){
			t.getNextEntityRequest();
			console.debug('Entity request took: ',+new Date() - ms, 'ms. Data: ', data);
			if (!data.data.error){
				onSuccess(data);
			} else{
				// still call success for error handling in onSucces handler
				onSuccess(data);
				console.debug('Error:', data.data);
			}
		},
		error: function(data){
			t.getNextEntityRequest();
			console.error(data);
		}
	});
}

Data.prototype.getRelatedness = function(id1,id2, onSuccess){
	var ms = +new Date();
	var url = Global.APIPath + 'entity/relatedness';

	$.ajax({
		dataType: "json",
		url: url,
		data: {
			id1: id1,
			id2: id2
		},
		success: function(data){
			console.debug('Entity request took: ',+new Date() - ms, 'ms. Data: ', data);
			if (!data.data.error){
				onSuccess(data);
			} else{
				// still call success for error handling in onSucces handler
				onSuccess(data);
				console.debug('Error:', data.data);
			}
		},
		error: function(data){
			console.error(data);
		}
	});
}

/* LOAD RELATED */

Data.prototype.cacheRelatedRequest = function(id,offset,limit,onSuccess,caller,priority){
	if (priority){
		this.relatedRequestPrioCache.shift([id,offset,limit,onSuccess,caller,priority]);
	} else{
		this.relatedRequestCache.push([id,offset,limit,onSuccess,caller,priority]);
	}
}

Data.prototype.getNextRelatedRequest = function(){
	this.loadingRelated--;
	var callMore = false;
	if (this.relatedRequestPrioCache.length > 0){
		var request = this.relatedRequestPrioCache.unshift();
		this.getRelated(request[0],request[1],request[2],request[3],request[4],request[5]);
		callMore = true;
	} else{
		if (this.relatedRequestCache.length > 0){
			var request = this.relatedRequestCache.pop();
			this.getRelated(request[0],request[1],request[2],request[3],request[4],request[5]);
			callMore = true;
		}
	}
	if (callMore && this.loadingRelated < this.maxQueue - 1){
		this.getNextRelatedRequest();
	}
}

Data.prototype.cacheRelatedEntities = function(id,data){
	// prevent cache getting too large
	if (this.relatedEntitiesCache.length > 5000){
		this.relatedEntitiesCache.shift();
	}
	// cache result
	this.relatedEntitiesCache[id] = data;
}

Data.prototype.getRelated = function(id, offset,limit, onSuccess, caller, priority, forceCache){
	// query cache
	if (this.loadingRelated > this.maxQueue || forceCache){
		// add to request cache
		this.cacheRelatedRequest(id,offset,limit,onSuccess,caller, priority);
		return;
	}



	// get Related:
	var ms = +new Date();
	var url = Global.APIPath + 'entity/related';
	var t = this;
	this.loadingRelated++;

	// check if caller is still valid
	if (!caller || caller.removed) {
		onSuccess = null;
		this.getNextRelatedRequest();
		return;
	}

	// Get from related entities cache
	if(typeof(this.relatedEntitiesCache[id]) != 'undefined'){
		console.debug('Related entities from cache for entity', id);
		onSuccess(this.relatedEntitiesCache[id]);
		this.getNextRelatedRequest();
		return;
	}


	// Or load from server
	$.ajax({
		dataType: "json",
		url: url,
		data: {
			id: id,
			offset:offset,
			limit: limit
		},
		success: function(data){
			t.cacheRelatedEntities(id,data);
			t.getNextRelatedRequest();
			console.debug('Related request took: ',+new Date() - ms, 'ms. Data: ', data);
			if (!data.data.error){
				onSuccess(data);
			} else{
				console.debug('Error:', data.data);
			}
		},
		error: function(data){
			t.cacheRelatedEntities(id,data);
			t.getNextRelatedRequest();
			console.error('Related ajax error', data);
			onSuccess([]);
		}
	});
}


Data.prototype.getRelatedTest = function(id, offset,limit, onSuccess){
	var ms = +new Date();
	var url = Global.APIPath + 'entity/related/test';
	$.ajax({
		dataType: "json",
		url: url,
		type: 'POST',
		data: {
			id: id,
			offset:offset,
			limit: limit
		},
		success: function(data){
			console.debug('Related test request took: ',+new Date() - ms, 'ms. Data: ', data);
			if (!data.data.error){
				console.debug(data.data);
			} else{
				console.debug('Error:', data.data);
			}
		},
		error: function(data){
			console.error(data);
		}
	});
}

Data.prototype.getSearch = function(keywords,offset,limit,onSuccess){
	var ms = +new Date();
	var url = Global.APIPath + 'search';
	$.ajax({
		dataType: "json",
		url: url,
		data: {
			keywords: keywords,
			offset:offset,
			limit: limit
		},
		success: function(data){
			console.debug('Search request took: ',+new Date() - ms, 'ms. Data: ', data);
			if (!data.data.error){
				onSuccess(data);
			} else{
				console.debug('Error:', data.data);
			}
		},
		error: function(data){
			console.error(data.error);
		}
	});
}


Data.prototype.getSearchIds = function(keywords,offset,limit,onSuccess){
	var ms = +new Date();
	var url = Global.APIPath + 'searchids';
	$.ajax({
		dataType: "json",
		url: url,
		type: 'POST',
		data: {
			keywords: keywords,
			offset:offset,
			limit: limit
		},
		success: function(data){
			console.debug('Search IDS request took: ',+new Date() - ms, 'ms. Data: ', data);
			if (!data.data.error){
				onSuccess(data);
			} else{
				console.debug('Error:', data.data);
				onSuccess(data);
			}
		},
		error: function(data){
			console.error(data.error);
			onSuccess(data);
		}
	});
}

Data.prototype.getSearchCollections = function(keywords,offset,limit,onSuccess,onError){
	var ms = +new Date();
	var url = Global.basePath + 'collection/search';
	$.ajax({
		dataType: "json",
		url: url,
		data: {
			keywords: keywords,
			offset:offset,
			limit: limit
		},
		success: function(data){
			console.debug('Search collections request took: ',+new Date() - ms, 'ms. Data: ', data);
			if (!data.error){
				onSuccess(data);
			} else{
				console.debug('Error:', data.error);
				onSuccess(data);
			}
		},
		error: function(data){
			console.error(data.error);
		}
	});
}



Data.prototype.getEntityCollections = function(id,offset,limit,onSuccess,onError){
	var ms = +new Date();
	var url = Global.basePath + 'entity/collections';
	$.ajax({
		dataType: "json",
		url: url,
		method: 'POST',
		data: {
			uid: id,
			offset:offset,
			limit: limit
		},
		success: function(data){
			console.debug('Search collections request took: ',+new Date() - ms, 'ms. Data: ', data);
			if (!data.error){
				onSuccess(data);
			} else{
				console.debug('Error:', data.error);
				onSuccess(data);
			}
		},
		error: function(data){
			console.error(data.error);
		}
	});
}



Data.prototype.getCollection = function(collectionId, onSuccess){
	var ms = +new Date();
	var url = Global.basePath + 'collection/' + collectionId + '/details';
	$.ajax({
		dataType: "json",
		url: url,
		success: function(data){
			console.debug('Load collection request took: ',+new Date() - ms, 'ms. Data: ', data);
			if (!data.error){
				var keywords = '';
				for (var j in data.data.entities){
					if (keywords != ''){
						keywords += ' ';
					}
					keywords += data.data.entities[j].uid;
				}
				this.getSearchIds(keywords,0,400,onSuccess);
			} else{
				console.debug('Error:', data.data);
			}
		}.bind(this),
		error: function(data){
			console.error(data.error);
		}
	});
}


Data.prototype.getEntityCounts = function(ids, onSuccess){
	var ms = +new Date();
	var url = Global.basePath + 'entity/count';
	$.ajax({
		dataType: "json",
		url: url,
		type: 'POST',
		data:{
			uids: ids.join(',')
		},
		success: function(data){
			console.debug('Count request took: ',+new Date() - ms, 'ms. Data: ', data);
			if (!data.data.error){
				onSuccess(data);
			} else{
				console.debug('Error:', data.data);
			}
		},
		error: function(data){
			console.error(data);
		}
	});
}