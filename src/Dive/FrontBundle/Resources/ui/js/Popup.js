/* Block shows a case in the gallery on the start screen */
function Popup(title,body,buttons){
	this.title = title;
	this.body = body;
	this.buttons = buttons;
	this.init();
	this.initListeners();
	this.$container.show();
}

/* INIT */
/* init Block object */
Popup.prototype.init = function(){
	this.$container = $('#popup');
	this.$container.removeAttr('style');
	this.$title = this.$container.find('.title').text(this.title);
	this.$body = this.$container.find('.body').html(this.body);
	this.$buttons = this.$container.find('.buttons').empty();
	for (var i in this.buttons){
		var $button = $(document.createElement('button')).addClass(i).text(this.buttons[i].label).click(this.buttons[i].click);
		this.$buttons.append($button);
	}

}

/* setup */
Popup.prototype.initListeners = function(){
	$(window).on('popup-hide',function(){
		$('#popup').hide();
	}.bind(this));
}
