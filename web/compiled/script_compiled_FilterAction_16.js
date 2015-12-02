
/* FILTER ACTION */

function FilterAction(container){
	this.$container = $(container);
	this.init();
}


FilterAction.prototype.init = function(){
	/* filter connection buttons */
	this.$container.on('click','.connections div',function(e){
		if ($(this).hasClass('inactive')){
			$(this).removeClass('inactive');
		} else{
			$(this).addClass('inactive');
		}

		var filter = $(this).closest('.filters').data('filter');

		if($(this).hasClass('indirect')){
			filter.filterIndirect = !$(this).hasClass('inactive');
		}else{
			filter.filterDirect = !$(this).hasClass('inactive');
		}

		filter.applyFilters();

		e.preventDefault();
		e.stopPropagation();
	});

	/* filter buttons */
	this.$container.on('click','.entity-filters .button',function(e){
		$(this).data('button').applyFilter();
		e.preventDefault();
		e.stopPropagation();
	});
}
