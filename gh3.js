/*
	gh3.js
	Created : 2012.07.25 by k33g

	TODO :
		- sort & reverse for commits
		- sort & reverse for comments
		- ...

	History :
		- 2012.07.25 : '0.0.1' : first version
		- 2012.07.26 : '0.0.2' : fixes
		- 2012.07.26 : '0.0.3' : gists pagination
*/

(function(){

	var Gh3 = this.Gh3 = {}
	,	Kind
	,	Base64;
	
	Gh3.VERSION = '0.0.3'; //2012.07.27
	
	//Object Model Tools (helpers) like Backbone
	Kind = function(){};
	
	Kind.inherits = function (parent, protoProps, staticProps) {
		var child
			, ctor = function(){}
			, merge = function (destination, source) {
				for (var prop in source) {
					destination[prop] = source[prop];
				}
		};
		//constructor ....
		if (protoProps && protoProps.hasOwnProperty('constructor')) {
		  child = protoProps.constructor;
		} else {
		  child = function(){ parent.apply(this, arguments); };
		}
	
		//inherits from parent
		merge(child, parent);
	
		ctor.prototype = parent.prototype;
		child.prototype = new ctor();
	
		//instance properties
		if(protoProps) merge(child.prototype, protoProps);
	
		//static properties
		if(staticProps) merge(child, staticProps);
	
		// Correctly set child's `prototype.constructor`.
		child.prototype.constructor = child;
	
		// Set a convenience property in case the parent's prototype is needed later.
		child.__super__ = parent.prototype;
	
		return child
	
	};
	Kind.extend = function (protoProps, staticProps) {
		var child = Kind.inherits(this, protoProps, staticProps);
		child.extend = this.extend;
		return child;
	};
	

	Base64 = { //http://www.webtoolkit.info/javascript-base64.html
 
		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	 	 
		// public method for decoding
		decode : function (input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
	 
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	 
			while (i < input.length) {
	 
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));
	 
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
	 
				output = output + String.fromCharCode(chr1);
	 
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
	 
			}
	 
			output = Base64._utf8_decode(output);
	 
			return output;
	 
		},
	 
		// private method for UTF-8 decoding
		_utf8_decode : function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
	 
			while ( i < utftext.length ) {
	 
				c = utftext.charCodeAt(i);
	 
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
	 
			}
	 
			return string;
		}
	 
	}


	Gh3.User = Kind.extend({
	
		constructor : function (login) {
			if (login) {
				this.login = login; 
			} else { 
				throw "login !";
			}
		},
		fetch : function (callback, callbackErr) {
			var that = this;
			$.ajax({
				url : "https://api.github.com/users/"+that.login,
				dataType: 'jsonp',
				success : function (res) {
					for(var prop in res.data) {
						that[prop] = res.data[prop];
					}
					if (callback) callback(that);
				},
				error : function (res) {
					if (callbackErr) callbackErr(res);
				}
			});
		}
		
		
	},{});
	
	//Gh.Item = Kind.extend({},{});
	//Gh3.GitHubObject = Kind.extend({},{});

	/*Gists*/

	Gh3.GistComment = Kind.extend({
		constructor : function (gistCommentData) {
			for(var prop in gistCommentData) {
				this[prop] = gistCommentData[prop];
			}
		}
	},{});

	Gh3.Gist = Kind.extend({
		constructor : function (gistData) {
			for(var prop in gistData) {
				this[prop] = gistData[prop];
			}
		},
		fetchContents : function (callback, callbackErr) {
			var that = this;
			$.ajax({
				url : "https://api.github.com/gists/"+that.id,
				dataType: 'jsonp',
				success : function(res) {
					for(var prop in res.data) {
						that[prop] = res.data[prop];
					}
					if (callback) callback(that);
				},
				error : function (res) {
					if (callbackErr) callbackErr(res);
				}
			});
		},
		fetchComments : function (callback, callbackErr) {
			var that = this;
			that.comments = [];
			$.ajax({
				url : "https://api.github.com/gists/"+that.id+"/comments",
				dataType: 'jsonp',
				success : function(res) {
					_.each(res.data, function (comment) {
						that.comments.push(new Gh3.GistComment(comment));
					});
					if (callback) callback(that);
				},
				error : function (res) {
					if (callbackErr) callbackErr(res);
				}
			});			
		},
		getFileByName : function (name) {
			return this.files[name];
		},
		getFiles : function () {
			return this.files;
		},
		eachFile : function (callback) {
			for(var fileName in this.files) {
				callback(this.files[fileName]);
			}
		},
		getComments : function () { return this.comments; },
		eachComment : function (callback) {
			_.each(this.comments, function (comment) {
				callback(comment);
			});
		}

	},{});

	Gh3.Gists = Kind.extend({//http://developer.github.com/v3/gists/
		constructor : function (ghUser) {
			if (ghUser) this.user = ghUser;
			this.gists = []
		}, 
		fetch : function (callback, callbackErr, pagesInfo, paginationInfo) {//http://developer.github.com/v3/#pagination
			var that = this;
			$.ajax({
				url : "https://api.github.com/users/"+that.user.login+"/gists",
				dataType: 'jsonp',
				data : pagesInfo,
				beforeSend: function (xhr) { xhr.setRequestHeader ("rel", paginationInfo); },
				success : function(res) {
					_.each(res.data, function (gist) {
						that.gists.push(new Gh3.Gist(gist));
					});
					if (callback) callback(that);
				},
				error : function (res) {
					if (callbackErr) callbackErr(res);
				}
			});
		},
		getGists : function () { return this.gists; },
		eachGist : function (callback) {
			_.each(this.gists, function (gist) {
				callback(gist);
			});
		}

	},{});




	Gh3.Commit = Kind.extend({
		constructor : function (commitInfos) {
			this.author = commitInfos.author;
			this.author.email = commitInfos.commit.author.email;
			this.author.name = commitInfos.commit.author.name;
			this.date =  commitInfos.commit.author.date;
			this.message = commitInfos.commit.message;
			this.sha = commitInfos.sha;
			this.url = commitInfos.url;
		}
	},{});

	Gh3.ItemContent = Kind.extend({
		constructor : function (contentItem, ghUser, repositoryName, branchName) {
			for(var prop in contentItem) {
				this[prop] = contentItem[prop];
			}
			if (ghUser) this.user = ghUser;
			if (repositoryName) this.repositoryName = repositoryName;
			if (branchName) this.branchName = branchName;
		}

	},{});

	Gh3.File = Gh3.ItemContent.extend({
		constructor : function (contentItem, ghUser, repositoryName, branchName) {
			Gh3.File.__super__.constructor.call(this, contentItem, ghUser, repositoryName, branchName);
		},
		fetchContent : function (callback, callbackErr) {
			var that = this;

			$.ajax({
				url : "https://api.github.com/repos/"+that.user.login+"/"+that.repositoryName+"/contents/"+that.path,
				dataType: 'jsonp',
				success : function(res) {
					that.content = res.data.content;
					that.rawContent = Base64.decode(res.data.content);

					if (callback) callback(that);
				},
				error : function (res) {
					if (callbackErr) callbackErr(res);
				}
			})
		},
		fetchCommits : function (callback, callbackErr) {//http://developer.github.com/v3/repos/commits/
			var that = this;
			that.commits = [];
			$.ajax({
				url : "https://api.github.com/repos/"+that.user.login+"/"+that.repositoryName+"/commits",
				dataType: 'jsonp',
				data : {path: that.path },
				success : function(res) {
					_.each(res.data, function (commit) {
						that.commits.push(new Gh3.Commit(commit));
					});
					if (callback) callback(that);
				},
				error : function (res) {
					if (callbackErr) callbackErr(res);
				}
			})
		},
		getRawContent : function() { return this.rawContent; },
		getCommits : function () { return this.commits; },
		getLastCommit : function () {
			return this.commits[0];
		},
		getFirstCommit : function () {
			return this.commits[this.commits.length-1];
		},
		eachCommit : function (callback) {
			_.each(this.commits, function (branch) {
				callback(branch);
			});
		}
	},{});


	Gh3.Dir = Gh3.ItemContent.extend({
		constructor : function (contentItem, ghUser, repositoryName, branchName) {
			Gh3.Dir.__super__.constructor.call(this, contentItem, ghUser, repositoryName, branchName);
		},
		fetchContents : function (callback, callbackErr) {
			var that = this;
			that.contents = [];
			$.ajax({
				url : "https://api.github.com/repos/"+that.user.login+"/"+that.repositoryName+"/contents/"+that.path,
				data : {ref: that.branchName },
				dataType: 'jsonp',
				success : function(res) {
					_.each(res.data, function (item) {
						if (item.type == "file") that.contents.push(new Gh3.File(item, that.user, that.repositoryName, that.name));
						if (item.type == "dir") that.contents.push(new Gh3.Dir(item, that.user, that.repositoryName, that.name));
					});
					if (callback) callback(that);
				},
				error : function (res) {
					if (callbackErr) callbackErr(res);
				}
			});
		},
		reverseContents : function () {
			this.contents.reverse();
		},
		sortContents : function (comparison_func) {
			if (comparison_func) {
				this.contents.sort(comparison_func);
			} else {
				this.contents.sort();
			}
		},
		getContents : function() { return this.contents; },
		getFileByName : function (name) {
			return _.find(this.contents, function (item) {
				return item.name == name && item.type == "file";
			});
		},
		getDirByName : function (name) {
			return _.find(this.contents, function (item) {
				return item.name == name && item.type == "dir";
			});
		},
		eachContent : function (callback) {
			_.each(this.contents, function (branch) {
				callback(branch);
			});
		}

	},{});

	Gh3.Branch = Kind.extend({
		constructor : function (name, sha, url, ghUser, repositoryName) {
			if (name) this.name = name;
			if (sha) this.sha = sha;
			if (url) this.url = url;

			if (ghUser) this.user = ghUser;
			if (repositoryName) this.repositoryName = repositoryName;

		},

		fetchContents : function (callback, callbackErr) {
			var that = this;
			that.contents = [];
			$.ajax({
				url : "https://api.github.com/repos/"+that.user.login+"/"+that.repositoryName+"/contents/",
				data : {ref: that.name },
				dataType: 'jsonp',
				success : function(res) {
					_.each(res.data, function (item) {
						if (item.type == "file") that.contents.push(new Gh3.File(item, that.user, that.repositoryName, that.name));
						if (item.type == "dir") that.contents.push(new Gh3.Dir(item, that.user, that.repositoryName, that.name));
					});
					if (callback) callback(that);
				},
				error : function (res) {
					if (callbackErr) callbackErr(res);
				}
			});
		},
		reverseContents : function () {
			this.contents.reverse();
		},
		sortContents : function (comparison_func) {
			if (comparison_func) {
				this.contents.sort(comparison_func);
			} else {
				this.contents.sort();
			}
		},
		getContents : function() { return this.contents; },
		getFileByName : function (name) {
			return _.find(this.contents, function (item) {
				return item.name == name && item.type == "file";
			});
		},
		getDirByName : function (name) {
			return _.find(this.contents, function (item) {
				return item.name == name && item.type == "dir";
			});
		},
		eachContent : function (callback) {
			_.each(this.contents, function (branch) {
				callback(branch);
			});
		}
		
	},{});

	Gh3.Repository = Kind.extend({
		constructor : function (name, ghUser) {
			if (name) this.name = name; 

			if (ghUser) this.user = ghUser;

		},
		fetch : function (callback, callbackErr) {
			var that = this;
			//TODO test user.login & name
			$.ajax({
				url : "https://api.github.com/repos/"+that.user.login+"/"+that.name,
				dataType: 'jsonp',
				success : function(res) {
					for(var prop in res.data) {
						that[prop] = res.data[prop];
					}
					if (callback) callback(that);
				},
				error : function (res) {
					if (callbackErr) callbackErr(res);
				}
			});
		},
		fetchBranches : function (callback, callbackErr) {
			var that = this;
			that.branches = [];
			$.ajax({
				url : "https://api.github.com/repos/"+that.user.login+"/"+that.name+"/branches",
				dataType: 'jsonp',
				success : function(res) {
					_.each(res.data, function (branch) {
						that.branches.push(new Gh3.Branch(branch.name, branch.commit.sha, branch.commit.url, that.user, that.name));
					});
					
					if (callback) callback(that);
				},
				error : function (res) {
					if (callbackErr) callbackErr(res);
				}
			});
		},
		getBranches : function () { return this.branches; },
		getBranchByName : function (name) {
			return _.find(this.branches, function (branch) {
				return branch.name == name;
			});
		},
		eachBranch : function (callback) {
			_.each(this.branches, function (branch) {
				callback(branch);
			});
		}

	},{});
	
	
}).call(this);