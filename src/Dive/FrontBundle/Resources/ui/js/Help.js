function Help(){ this.init(); }


Help.prototype.init = function(){
	this.initListeners();
}

Help.prototype.initListeners = function(){
	$('#help-button').click(function(event){
		if ($('#help').hasClass('visible')){
			$('#help').removeClass('visible').fadeTo(300,0, function() { $(this).hide(); });
		} else{
			$('#help').addClass('visible').fadeTo(300,1);
		}
		event.stopImmediatePropagation();
		return false;
	});
}