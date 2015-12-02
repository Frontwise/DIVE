/* Contentview Comments shows comments for an entity */

function Comments(entity){
	this.$container;
	this.$comments;
	this.$contribute;
	this.$input;
	this.entity = entity;
	this.loaded = false;
	this.body = false;
	this.init();
}

/* INIT */

/* init Comments object */

Comments.prototype.init = function(){
	this.build();
}

/* User is updated (login/logout) */
Comments.prototype.userUpdate = function(){
	if (this.loaded){
		this.$container.empty();
		this.loaded = false;
		this.body = false;
		this.addBody();
		this.load();
	}
}


/* build comments html */
Comments.prototype.build = function(){
	this.$container = $(document.createElement('div')).addClass('content').addClass('content-comments').data('content',this);
}
/* add Body */
Comments.prototype.addBody = function(){
	this.$input = $('<textarea/>').attr('maxlength','4096');
	this.initContribute();
	this.$comments = $(document.createElement('div')).addClass('comments');
	this.$container.append(this.$comments);
	this.body = true;
}

/* init contribution form. Registered/anonymous users can use this form to add comments to an entity */

Comments.prototype.initContribute = function(){
	this.$contribute = $(document.createElement('div')).addClass('contribute').append(
		this.$input
		).append(
		$('<button/>').text('Comment as ' + Global.user.getUsername() ).click(function(){
			var body = this.$input.val();
			if (!body){
				return;
			}
			$.post(Global.basePath + 'comment/add', {
				uid: this.entity.getUID(),
				body: body
			}, function(data){
				this.loaded = false;
				this.$input.val('');
				this.load();
			}.bind(this)
			);
		}.bind(this))
		);
		this.$container.append(this.$contribute);
	}

	/* Helpers */

	Comments.prototype.getContainer = function(){
		return this.$container;
	}


	Comments.prototype.show = function(){
		if (!this.body){
			this.addBody();
		}
		if (!this.loaded){
			this.load();
		}
	}


	/* DATA */

	/* load comments from server and append them to the view */
	Comments.prototype.load = function(){
		if (this.loaded){
			return;
		}
		this.$container.addClass('loading_white');
		this.$comments.css('min-height', this.$comments.height()).html('');
	// get comments from server
	$.getJSON(Global.basePath + 'entity/comments',{
		uid: this.entity.getUID()
	},function(data){
		this.$container.removeClass('loading_white');
		if(!data || !data.success){
			// not found
			this.$comments.append($('<span/>').addClass('notice').text('No comments found'));
		} else{
			this.$comments.append($('<span/>').addClass('notice').text(data.results + (data.results == 1 ? ' comment' : ' comments.')));
			console.log(data);
			this.entity.setCommentCount(data.data.length, data.owner);
			for(var i =0, len=data.data.length; i < len; i++){
				var $header = $(document.createElement('div')).addClass('comment-header').append(
					$('<span/>').addClass('owner').text(data.data[i].owner.username)
					).append(
					$('<span/>').addClass('date').text(data.data[i].created_at ? data.data[i].created_at.date : 'Unknown')
					);
					var $comment = $(document.createElement('div')).addClass('comment').append(
						$header
						).append(
						$('<span/>').addClass('body').text(data.data[i].body)
						);
						this.$comments.append($comment);
					}
				}
			}.bind(this));
this.loaded = true;
this.showContainer();
}

Comments.prototype.showContainer = function (){
	this.$container.velocity('stop').velocity("slideDown",  {
		queue: false,
		easing: Global.easing,
		duration: Global.animationDuration
	});
}