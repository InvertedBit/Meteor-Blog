AccountsTemplates.configure({
	confirmPassword: true,
	enablePasswordChange: true,
	forbidClientAccountCreation: false,
	sendVerificationEmail: true,
	lowercaseUsername: false,
	continuousValidation: true,
	negativeFeedback: true,
	negativeValidation: true,
	positiveValidation: true,
	positiveFeedback: true,
	showValidating: true
});

Posts = new Mongo.Collection("posts");
Posts.attachSchema(new SimpleSchema({
	title: {
		type: String,
		label: "Title",
		max: 100
	},
	excerpt: {
		type: String,
		label: "Excerpt",
		max: 200
	},
	content: {
		type: String,
		label: "Content"
	},
	author: {
		type: String,
		label: "Author",
		max: 25
	},
	createdAt: {
		type: Date,
		optional: true
	}
}));

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

	Template.defaultBlog.rendered = function(){
		$(".mainScrollContainer").mCustomScrollBar({autoExpandScrollbar: true});
	};

  Template.postlist.helpers({
    posts: function() {
		return Posts.find({}, {sort: {createdAt: -1}});
	}
  });
  
  Template.modal.rendered = function() {
	$("#writePost").draggable({
		handle: ".modal-header"
	});
  };
  
	AutoForm.hooks({
		writePostForm: {
			onSubmit: function(insertDoc, updateDoc, currentDoc) {
				if(createPost(insertDoc)) {
					this.done();
				} else {
					this.done(new Error('Submission failed.'));
				}
				return false;
			}
		}
	});
	
	function createPost (insert) {
			insert.createdAt = new Date();
			return Posts.insert(insert);
		}
	
	// Template.writepost.events({
		// "submit #writePostForm": 
	// });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
