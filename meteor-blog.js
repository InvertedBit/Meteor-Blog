Posts = new Mongo.Collection("posts");

Router.map(function(){
	this.route('defaultBlog', {
		path: '/',
		template: 'defaultBlog',
		data: function() {
			return Posts.findOne({title: {$ne: ''}}, {sort: {createdAt: -1}});
		}
	});
});

Router.route('/:_page', function() {
	this.render('default', {
		data: function() {
			return this.params._page;
		}
	});
});

Router.route('/admin', function() {
	this.render('admin');
});

if (Meteor.isClient) {

  Template.postlist.helpers({
    posts: function() {
		return Posts.find({}, {sort: {createdAt: -1}});
	}
  });
  
  Template.writepost.rendered = function() {
	$("#writePost").draggable({
		handle: ".modal-header"
	});
  };
  
	Template.writepost.events({
		"submit .add_post": function (event) {
			var title = event.target.title.value;
			var excerpt = event.target.excerpt.value;
			var content = event.target.content.value;
			
			Posts.insert({
				title: title,
				excerpt: excerpt,
				content: content,
				createdAt: new Date()
			});
			
			event.target.title.value = '';
			event.target.excerpt.value = '';
			event.target.content.value = '';
		}
	});
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
