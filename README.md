#gh3

**gh3** is a client-side Javascript API v3 wrapper for GitHub

**gh3** is [async.js](https://github.com/caolan/async) compliant. (thank you to [Atinux](https://github.com/Atinux) and [mklabs](https://github.com/mklabs))

##Dependencies

- [jQuery](http://jquery.com/)
- [Underscore](http://underscorejs.org/)

##Bundled with gh3 :

gh3 cames with 11 kinds of object's type :

- `Gh3.Users`
- `Gh3.User`
- `Gh3.Repositories`
- `Gh3.Repository`
- `Gh3.Branch`
- `Gh3.Dir` inherits of `Gh3.ItemContent`
- `Gh3.File` inherits of `Gh3.ItemContent`
- `Gh3.Commit`
- `Gh3.Gists`
- `Gh3.Gist`
- `Gh3.GistComment`

You can extend all Gh3 types, eg :

	var myComment = Gh3.GistComment.extend({
		//...
	})

See *§ "Extend User"* for more details.

##GitHub Users : Gh3.Users

###Static Methods of Gh3.Users

- `Gh3.Users.search(keyword, pagesInfo, callback)` retrieve `Gh3.User` instances by keyword
    - `pagesInfo` : `{ start_page : which_page }` (always 100 items max. per page) see [http://developer.github.com/v3/search/](http://developer.github.com/v3/search/)
- `Gh3.Users.getAll()` : return an array of all `Gh3.User` instances (you have to call `search()` before)
- `Gh3.Users.getByName(name)` : get a user by his name (you have to call `search()` before) (return first found user)
- `Gh3.Users.each(callback)` : execute `callback` for each found users (you have to call `search()` before)
- `Gh3.Users.reverse()` : reverse order of users (you have to call `fetch()` before)
- `Gh3.Users.sort(comparator)` : sort users (you have to call `search()` before)
- `Gh3.Users.filter(comparator)` : return an array of `Gh3.User` instances filtered by `comparator`  (you have to call `search()` before)

####example :

	Gh3.Users.search("mad", {start_page : 3}, function (err, response) {
		if(err) {
			throw "outch ..."
		}
		//console.log(Gh3.Users.getAll());
		console.log(response.getAll());
		response.each(function (user) {
			console.log(user.name, user.login, user.repos, user)
		});
	});

See `samples/10-users.html`

##GitHub User : Gh3.User

###Declare User

	var k33g = new Gh3.User("k33g");

####Methods of Gh3.User

- `fetch(callback)` : retrieve GitHub User's informations

###Get User data

	k33g.fetch(function (err, resUser){

		if(err) {
			throw "outch ..."
		}

		console.log("Blog : ", resUser.blog); // == k33g.blog
		console.log("Name : ", resUser.name);
		//etc. ...
	});

See `/samples/01-user.html`

###Extend User

I've cribbed the [Backbone](http://backbonejs.org/) object model :

	var GitHubUser = Gh3.User.extend({//instance members
		constructor : function(login) {
			GitHubUser.__super__.constructor.call(this, login);
			GitHubUser.allUsers.push(this);
		}
	},{ //Static members
		allUsers : [],
		each : function (callback) {
			_.each(GitHubUser.allUsers, function (user) {
				callback(user);
			})
		}
	});

	var k33g = new GitHubUser("k33g")
	,	loicdescotte = new GitHubUser("loicdescotte")
	,	mklabs = new GitHubUser("mklabs")
	,	chamerling = new GitHubUser("chamerling");
	
	GitHubUser.each(function (user) {
		user.fetch(function (err, resUser) {

			if(err) {
				throw "outch ..."
			}

			console.log(JSON.stringify(resUser));
		});
	})

See `samples/02-user.html`

##GitHub Repositories of a user : Gh3.Repositories

###Declare and Get Repositories of a user

	var k33gRepositories = new Gh3.Repositories(k33g);
	k33gRepositories.fetch(function () {
		console.log("Repositories", k33gRepositories);
	}, function(){/*error*/},{page:1, per_page:500, direction : "desc"});
	//all repositories, one page, 500 items per page, sort : descending

####Methods of Gh3.Repositories

- `fetch(pagesInfoAndParameters, paginationInfo, callback)` retrieve `Gh3.Repository` instances of a user
    - `pagesInfoAndParameters` : `{ pages : number_of_pages, per_page : number_of_repositories_per page }`
    - you can pass other parameters as : `direction : "desc"`, see [http://developer.github.com/v3/repos/](http://developer.github.com/v3/repos/)
    - `paginationInfo` : which page. Possible values : see [http://developer.github.com/v3/#pagination](http://developer.github.com/v3/#pagination)
        * "next"
        * "last"
        * "first"
        * "prev"
- `getRepositories()` : return an array of `Gh3.Repository` instances (you have to call `fetch()` before)
- `getRepositoryByName(name)` : get a repository by his name (you have to call `fetch()` before)
- `eachRepository(callback)` : execute `callback` for each repository of the user (you have to call `fetch()` before)
- `reverseRepositories()` : reverse order of repositories (you have to call `fetch()` before)
- `sortRepositories(comparator)` : sort repositories (you have to call `fetch()` before)
- `filterRepositories(comparator)` : return an array of `Gh3.Repository` instances filtered by `comparator`  (you have to call `fetchContents()` before)

#####Static Methods

- `Gh3.Repositories.search(keyword, pagesInfo, callback)` retrieve `Gh3.Repository` instances by keyword
    - `pagesInfo` : `{ start_page : which_page }` (always 100 items max. per page) see [http://developer.github.com/v3/search/](http://developer.github.com/v3/search/)
- `Gh3.Repositories.getAll()` : return an array of all `Gh3.Repository` instances (you have to call `search()` before)
- `Gh3.Repositories.getByName(name)` : get a repository by his name (you have to call `search()` before) (return first found repository)
- `Gh3.Repositories.each(callback)` : execute `callback` for each found repositories (you have to call `search()` before)
- `Gh3.Repositories.reverse()` : reverse order of repositories (you have to call `fetch()` before)
- `Gh3.Repositories.sort(comparator)` : sort repositories (you have to call `search()` before)
- `Gh3.Repositories.filter(comparator)` : return an array of `Gh3.Repository` instances filtered by `comparator`  (you have to call `search()` before)

See `samples/03-repository.html`
See `samples/09-repositories.html`

##GitHub Repository : Gh3.Repository

###Declare and Get Repository informations

	var k33g = new Gh3.User("k33g"); // You need a user first

	var k33gBlog = new Gh3.Repository("k33g.github.com", k33g);

	k33gBlog.fetch(function (err, res) {
		if(err) { throw "outch ..." }

		console.log(k33gBlog);
	});

####Methods of Gh3.Repository

- `getBranches()` : return array of `Gh3.Branch` instances
- `fetch(callback)` : retrieve repository's informations
- `fetchBranches(callback)` : retrieve repository's branches (you have to call `fetch()` before)
- `getBranchByName(branch_name)` : return a `Gh3.Branch` instance found by name (you have to call `fetchBranches()` before)
- `eachBranch(callback)` : execute `callback` for each branch of the repository (you have to call `fetchBranches()` before)
- `reverseBranches()` : reverse order of branches
- `sortBranches(comparator)` : sort branches

###Get Branches of Repository

After calling repository `fetch()` method :

	k33gBlog.fetchBranches(function (err, res) {
		if(err) { throw "outch ..." }

		console.log(k33gBlog.getBranches());
	})

`branches` is an array of `Gh3.Branch` instances populated when `fetchBranches()` is called.

You can do that too :

	k33gBlog.fetchBranches(function (err, res) {
		if(err) { throw "outch ..." }

		console.log("Array of branches : ", k33gBlog.getBranches());
		k33gBlog.eachBranch(function (branch) {
			console.log(branch.name);
		})

		//and :
		console.log("Master Branch : ", k33gBlog.getBranchByName("master"));

	})

See `samples/03-repository.html`

##GitHub Branch : Gh3.Branch

####Methods of Gh3.Branch

- `fetchContents(callback)` : retrieve `Gh3.File` instances and/or `Gh3.Dir` instances of the branch
- `getContents()` : return array of `Gh3.ItemContent` instances (so `Gh3.File` instances and/or `Gh3.Dir` instances)
- `getFileByName(file_name)` : return a `Gh3.File` instance found by name (you have to call `fetchContents()` before)
- `getDirByName(dir_name)` : return a `Gh3.Dir` instance found by name (you have to call `fetchContents()` before)
- `eachContent(callback)` : execute `callback` for each content item of the branch (you have to call `fetchContents()` before)
- `reverseContents()` : reverse order of contents
- `sortContents(comparator)` : sort contents
- `filterContents(comparator)` : return an array of `Gh3.ItemContent` instances filtered by `comparator`  (you have to call `fetchContents()` before)

##Get contents of a branch

You have to declare, get repository informations and fetch branches before calling `fetchContents(callback)` :

	var k33g = new Gh3.User("k33g")
	,	k33gBlog = new Gh3.Repository("k33g.github.com", k33g);

	k33gBlog.fetch(function (err, res) {
		if(err) { throw "outch ..." }

		k33gBlog.fetchBranches(function (err, res) {
			if(err) { throw "outch ..." }

			var master = k33gBlog.getBranchByName("master");

			master.fetchContents(function (err, res) {
				if(err) { throw "outch ..." }

				master.eachContent(function (content) {
					console.log(content.path, content.type);
				});
			});

		})
	});

See `samples/04-branch.html`

You obtain a list of files and directories. You can directly fetch raw content of a file or fetch contents of a directory.

##GitHub File : Gh3.File

####Methods of Gh3.File

- `fetchContent(callback)` : retrieve (raw) content of the file
- `fetchCommits(callback)` : retrieve commits of the file
- `getRawContent()` : return raw content of the file (you have to call `fetchContent()` before)
- `getCommits()` : return array of `Gh3.Commit` instances (you have to call `fetchCommits()` before)
- `getLastCommit()` : return last `Gh3.Commit` instance
- `getFirstCommit()` : return first `Gh3.Commit` instance
- `eachCommit(callback)` : execute `callback` for each commit of the file (you have to call `fetchCommits()` before)
- `filterCommits(comparator)` : return an array of `Gh3.Commit` instances filtered by `comparator`  (you have to call `fetchCommits()` before)
- `reverseCommits()` : reverse order of commits
- `sortCommits(comparator)` : sort commits

###Get raw content of a file

	master.fetchContents(function (err, res) {
		if(err) { throw "outch ..." }

		var myfile = master.getFileByName("index.html");

		/* this way is possible to :
			var myfile = master.getContents()[8];
		*/

		myfile.fetchContent(function (err, res) {
			if(err) { throw "outch ..." }

			console.log(myfile.getRawContent());
		});
		
	});

See `samples/05-file.html`

###Get commits of a file

		myfile.fetchCommits(function (err, res) {
			if(err) { throw "outch ..." }

			console.log(myfile.getCommits()); 

			myfile.eachCommit(function (commit) {
				console.log(commit.author.login, commit.message, commit.date);
			});
		});


See `samples/05-file.html`

##GitHub Directory : Gh3.Dir

It works much like a `Gh3.Branch`.

####Methods of Gh3.Dir

- `fetchContents(callback)` : retrieve `Gh3.File` instances and/or `Gh3.Dir` instances of the directory
- `getContents()` : return array of `Gh3.ItemContent` instances (so `Gh3.File` instances and/or `Gh3.Dir` instances)
- `getFileByName(file_name)` : return a `Gh3.File` instance found by name (you have to call `fetchContents()` before)
- `getDirByName(dir_name)` : return a `Gh3.Dir` instance found by name (you have to call `fetchContents()` before)
- `eachContent(callback)` : execute `callback` for each content item of the directory (you have to call `fetchContents()` before)
- `reverseContents()` : reverse order of contents
- `sortContents(comparator)` : sort contents
- `filterContents(comparator)` : return an array of `Gh3.ItemContent` instances filtered by `comparator`  (you have to call `fetchContents()` before)

###Get contents of a directory

	master.fetchContents(function (err, res) {
		if(err) { throw "outch ..." }

		var dir = master.getDirByName('_posts');

		dir.fetchContents(function (err, res) {
			if(err) { throw "outch ..." }

			console.log(dir.getContents());
			
			dir.eachContent(function (content) {
				console.log(content.name, content.type, content.size);

			});
		});
		
	});

See `samples/06-dir.html`

##GitHub Gists : Gh3.Gists

####Methods of Gh3.Gists

- `fetch(pagesInfo, paginationInfo, callback)` : retrieve `Gh3.Gist` instances of a user
    - `pagesInfo` : `{ pages : number_of_pages, per_page : number_of_gists_per page }`
    - `paginationInfo` : which page. Possible values : see [http://developer.github.com/v3/#pagination](http://developer.github.com/v3/#pagination)
        * "next"
        * "last"
        * "first"
        * "prev"
- `getGists()` : return an array of `Gh3.Gist` instances (you have to call `fetch()` before)
- `eachGist` : execute `callback` for each gist of the user (you have to call `fetch()` before)
- `filter(comparator)` : return an array of `Gh3.Gist` instances filtered by `comparator`  (you have to call `fetch()` before)

###Get public gists of a user

	var GistsOfK33g = new Gh3.Gists(new Gh3.User("k33g"));
	
	GistsOfK33g.fetch(null, null, function (err, res) {
		if(err) {
			throw "outch ..."
		}

		GistsOfK33g.eachGist(function (gist) {
			console.log(gist.description, gist.id);
		});
	});

###Get public gists of a user : five gists of the next page

	GistsOfK33g.fetch({page:2, per_page:5}, "next", function (err, res) {
		if(err) {
			throw "outch ..."
		}

		GistsOfK33g.eachGist(function (gist) {
			console.log(gist.description, gist.id);
		});
	};

See `samples/07-gists.html`

###Get public gists of a user only if they have comment(s)

	AllGistsOfK33g.fetch(function (err, res) {
		if(err) {
			throw "outch ..."
		}

		console.log("Filtered gists : ", AllGistsOfK33g.filter(function (gist) {
			return gist.comments > 0;
		}));
		
	},function(){//onerror},{page:1, per_page:500});

See `samples/07-gists.html`

##GitHub Gist : Gh3.Gist

####Methods of Gh3.Gist

- `fetchContents(callback)` : retrieve contents (files) of the gist
- `fetchComments(callback)` : retrieve comments of the gist
- `getFileByName()` : return a file of the gist, found by his name
- `getFiles()` : return array of files objects
- `eachFile(callback)` : execute `callback` for each file of the gist (you have to call `fetchContents()` before)
- `getComments()` : return an array of `Gh3.GistComment` instances
- `eachComment(callback)` : execute `callback` for each comment of the gist (you have to call `fetchComments()` before)
- `filterComments(comparator)` : return an array of `Gh3.GistComment` instances filtered by `comparator`  (you have to call `fetchComments()` before)

###Get a public gist by id

	var oneGist = new Gh3.Gist({id:"2287018"});
	
	oneGist.fetchContents(function (err, res) {
		if(err) {
			throw "outch ..."
		}

		console.log("oneGist : ", oneGist);
		console.log("Files : ", oneGist.files);
		
		oneGist.eachFile(function (file) {
			console.log(file.filename, file.language, file.type, file.size);
		});
	});

####Get content of a file of a gist

	console.log(oneGist.getFileByName("use.thing.js").content);

See `samples/07-gists.html`

###Get comments of a public gist

	var anOtherGist = new Gh3.Gist({id:"1096826"});

	anOtherGist.fetchContents(function (err, res) {
		if(err) { throw "outch ..." }

		anOtherGist.fetchComments(function (err, res) {
			if(err) { throw "outch ..." }

			anOtherGist.eachComment(function (comment) {
				console.log(comment.body, "By ", comment.user.login);
			});
		});
	});

See `samples/07-gists.html`

###Filter comments of a public gist

	var PaulIrishGist = new Gh3.Gist({id:"3098860"});

	PaulIrishGist.fetchContents(function (err, res) {
		if(err) { throw "outch ..." }
		
		PaulIrishGist.fetchComments(function (err, res) {
			if(err) { throw "outch ..." }

			console.log(
				PaulIrishGist.filterComments(function (comment) {
					return comment.user.login == "codepo8";
				})
			);
		});

	});

See `samples/08-gists_comments.html`

... to be continued

##History

- 2012.07.25 : '0.0.1' : first version
- 2012.07.26 : '0.0.2' : fixes
- 2012.07.26 : '0.0.3' : gists pagination
- 2012.07.28 : '0.0.4' :
	* refactoring : Gh3.Helper
	* gists filtering
	* gist comments filtering
	* file commits filtering
	* commits sorting
	* new Type : Gh3.Repositories (with pagination)
- 2012.07.29 : '0.0.5' :
	* Gh3.Repositories : add search ability		
	* add Gh3.Users : search user ability
- 2012.07.29 : '0.0.6' :
	* async.js compliant
- 2014.04.20 : '1.0.0' : bower package + semantic versioning
- 2014.04.20 : '1.0.1' : temporary fixes

##License

Gh3 is available under the terms of the [MIT-License](http://en.wikipedia.org/wiki/MIT_License#License_terms).

Copyright 2014-2015, Philippe Charrière
