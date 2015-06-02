AccountsTemplates.configure({
	confirmPassword: true,
	enablePasswordChange: true,
	forbidClientAccountCreation: false,
	showForgotPasswordLink: true,
	sendVerificationEmail: true,
	lowercaseUsername: false,
	continuousValidation: true,
	negativeFeedback: true,
	negativeValidation: true,
	positiveValidation: true,
	positiveFeedback: true,
	showValidating: true
});

var pwd = AccountsTemplates.removeField('password');
var email = AccountsTemplates.removeField('email');

AccountsTemplates.addFields([
	{
		_id: 'firstname',
		type: 'text',
		required: true,
		displayName: 'First Name',
		placeholder: 'John'
	},
	{
		_id: 'lastname',
		type: 'text',
		required: true,
		displayName: 'Last Name',
		placeholder: 'Doe'
	},
	{
	_id: 'username',
	type: 'text',
	required: true,
	func: function(value){
		if(Meteor.isClient) {
			var self = this;
			Meteor.call("userExists", value, function(err, userExists){
				if(!userExists)
					self.setSuccess();
				else
					self.setError(userExists);
				self.setValidating(false);
			});
			return;
		}

		return Meteor.call("userExists", value);
	}
},
email,
pwd
]);

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
	this.route('default', {
		path: '/',
		template: 'default',
		data: function() {
			return {page: 'blog'};
		}
	});
	this.route('userSettings', {
		path: '/user/settings',
		template: 'default',
		data: function() {
			return {page: 'userSettings'};
		}
	});
});

if (Meteor.isClient) {

	Template.default.rendered = function(){
		$("html").niceScroll({cursorwidth: 10, cursoropacitymin: 0.2, cursoropacitymax: 0.6});
	};

	Template.header.rendered = function(){
		perspectiveNav();
	};

	Template.registerHelper('formatDate', function(date, format) {
	  	return moment(date).format(format);
	});

	Template.registerHelper('getPermalink', function(title){
		return title.toLowerCase().replace(' ', '-');
	});

	Template.registerHelper('getEmailAddress', function(user){
		return user.emails[0].address;
	});

  Template.postlist.helpers({
    posts: function() {
		return Posts.find({}, {sort: {createdAt: -1}});
	}
  });


  Template.modals.rendered = function() {
	$("#writePost").draggable({
		handle: ".modal-header"
	});
  };

	Template.header.events(
		{
			"click .sign-out": function(event, template){
				 Meteor.logout(function(){
					$('#signIn').modal('hide');
				});
			}
		});

	Accounts.onLogin(function(){
		$('#signIn').modal('hide');
	});

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
		smtp = {
    username: 'alex.t.scherer@gmail.com',   // eg: server@gentlenode.com
    password: '1337@h0m3',   // eg: 3eeP1gtizk5eziohfervU
    server:   'smtp.gmail.com',  // eg: mail.gandi.net
    port: 465
  }

  process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
  });

	Meteor.methods({
    "userExists": function(username){
      return !!Meteor.users.findOne({username: username});
    }
  });

}
