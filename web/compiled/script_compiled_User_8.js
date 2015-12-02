/* manages users, login, logout etc */
function User(){
	this.$container;
	this.current = false;
	this.hideTimer;
	this.preventHideTimer;
	this.collections = [];
	this.init();
}

/* INIT */

User.prototype.init = function(){
	this.$container = $('#user-menu');
	this.$container.addClass('loading').data('user',this);

	this.refresh();
	this.initListeners();
}

/* BUILD */

User.prototype.build = function(){
	if (this.current){
		this.buildProfile();
	} else{
		this.buildLoginMenu();
	}
	this.$container.removeClass('loading');
}

User.prototype.buildProfile = function(){
	this.$container.load(Global.basePath + 'user/profile');
}

User.prototype.buildLoginMenu = function(){
	this.$container.load(Global.basePath + 'user/login');
}


/* INTERACTION */

User.prototype.initListeners = function(){

	/* user menu leave */
	$('#user-menu').on('mouseleave',function(event){
		if (this.$container.is(':visible')){
			if (this.preventHideTimer){ return; }
			this.hideTimer = setTimeout(function(){
				this.$container.velocity('stop').velocity('slideUp',{ duration: Global.animationDuration, queue: false,easing: Global.easing, });
			}.bind(this),1000);
		}
	}.bind(this));

	/* user menu leave */
	$('#user-menu').on('mouseenter',function(event){
		clearTimeout(this.hideTimer);
	}.bind(this));

	/* user menu leave */
	$('#user-menu').on('mousedown',function(event){
		this.preventHideTimer = true;
		clearTimeout(this.hideTimer);
		setTimeout(function(){ this.preventHideTimer = false; }, 2000);
	}.bind(this));


	/* user button hover */
	$('#user-button').on('mouseenter',function(event){
		if (!this.$container.is(':visible')){
			clearTimeout(this.hideTimer);
			$('.top-menu').not(this.$container).velocity('stop').velocity('slideUp',{ duration: Global.animationDuration, queue: false,easing: Global.easing, });
			this.$container.velocity('stop').velocity('slideDown',{ duration: Global.animationDuration, queue: false,easing: Global.easing, });
		}
	}.bind(this));

	/* user button clicked */
	$('#user-button').click(function(event){
		clearTimeout(this.hideTimer);
		if (this.$container.is(':visible')){
			this.$container.css('height','auto');
			this.$container.velocity('stop').velocity('slideUp',{ duration: Global.animationDuration, queue: false,easing: Global.easing, });
		} else{
			this.$container.css('height','auto');
			$('.top-menu').not(this.$container).velocity('stop').velocity('slideUp',{ duration: Global.animationDuration, queue: false,easing: Global.easing, });
			this.$container.velocity('stop').velocity('slideDown',{ duration: Global.animationDuration, queue: false,easing: Global.easing, });
		}
		event.stopImmediatePropagation();
		return false;
	}.bind(this));

	/* login form submit */

	this.$container.on('submit','#user-login', function(){
		var postData = $(this).serializeArray();
		var formURL = $(this).attr("action");
		$('#user-menu').addClass('loading')
		$.ajax(
		{
			url : formURL,
			type: "POST",
			data : postData,
			success:function(data, textStatus, jqXHR)			{
				$('#user-menu').removeClass('loading')
				$('#user-menu').html(data);
				if ($('#user-menu button').text() != 'Login')  { $('#user-menu').data('user').refresh(); }
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				console.log('Error:',textStatus);
			}

		});
		return false;
	});

	/* logout */
	this.$container.on('click','.logout', function(){
		var user = $('#user-menu').data('user');
		user.current = false;
		user.collections = [];
		$('#user-menu').addClass('loading')
		$.ajax(
		{
			url : Global.basePath + 'logout',
			type: "GET",
			success:function(data, textStatus, jqXHR)
			{
				$('#user-menu').removeClass('loading');
				user.buildLoginMenu();
				user.refresh();
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				$('#user-menu').removeClass('loading');
				user.buildLoginMenu();
				user.refresh();
			}

		});
		return false;
	});


	/* signup */
	this.$container.on('click','#signup', function(){
		var user = $('#user-menu').data('user');
		$('#user-menu').addClass('loading')
		$.ajax(
		{
			url : Global.basePath + 'user/signup',
			type: "GET",
			success:function(data, textStatus, jqXHR)
			{
				$('#user-menu').removeClass('loading');
				$('#user-menu').html(data);
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				$('#user-menu').removeClass('loading');
				user.buildLoginMenu();
				user.refresh();
			}

		});
		return false;
	});

	/* signup form submit */
	this.$container.on('submit','#user-signup', function(){
		var postData = $(this).serializeArray();
		var formURL = $(this).attr("action");
		$('#user-menu').addClass('loading')
		$.ajax(
		{
			url : formURL,
			type: "POST",
			data : postData,
			success:function(data, textStatus, jqXHR)			{
				$('#user-menu').removeClass('loading')
				$('#user-menu').html(data);
				if (!$('#user-menu button').text() == 'Login')  { $('#user-menu').data('user').refresh(); }
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				console.log('Error:',textStatus);
			}

		});
		return false;
	});

	/* request password */
	this.$container.on('click','#request-password', function(){
		var user = $('#user-menu').data('user');
		$('#user-menu').addClass('loading')
		$.ajax(
		{
			url : Global.basePath + 'user/requestPassword',
			type: "GET",
			success:function(data, textStatus, jqXHR)
			{
				$('#user-menu').removeClass('loading');
				$('#user-menu').html(data);
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				$('#user-menu').removeClass('loading');
				user.buildLoginMenu();
				user.refresh();
			}

		});
		return false;
	});

	/* request password form submit */
	this.$container.on('submit','#user-request-password', function(){
		var postData = $(this).serializeArray();
		var formURL = $(this).attr("action");
		$('#user-menu').addClass('loading')
		$.ajax(
		{
			url : formURL,
			type: "POST",
			data : postData,
			success:function(data, textStatus, jqXHR)			{
				$('#user-menu').removeClass('loading')
				$('#user-menu').html(data);
				if (!$('#user-menu button').text() == 'Request new password')  { $('#user-menu').data('user').refresh(); }
			},
			error: function(jqXHR, textStatus, errorThrown)
			{
				console.log('Error:',textStatus);
			}

		});
		return false;
	});
}


/* USER DATA  */
User.prototype.refresh = function(){
	$.get(Global.basePath + 'user/current',function(data){
		if (!data.error){
			this.current = data.data.user;
			this.collections = data.data.collections;
			$('#collections-button').show();
		} else{
			$('#collections-button').hide();
			this.current = false;
			this.collections = false;
		}
		this.build();
		this.updateUsers();
	}.bind(this));
}


User.prototype.updateUsers = function(){
	if (this.current){
		Global.browser.userUpdate();
	}
}

/* HELPERS */

User.prototype.getUsername = function(){
	return this.current ? this.current.username : 'Anonymous';
}

User.prototype.loggedIn = function(){
	return this.current != false;
}

User.prototype.getCollections = function(){
	if (this.collections){
		var result = new Array();
		for(var i = 0, len = this.collections.length; i<len;i++){
			result.push ( $(document.createElement('option')).attr('value',this.collections[i].id).text(this.collections[i].title) );
		}
		return result;
	} else{
		return false;
	}
}

/* ACTIONS */

User.prototype.login = function(){
	this.refresh();
}

User.prototype.logout = function(){

}