var casper = require('casper').create();
var fs = require('fs');
var org_set = {};
var detail_set = {};

// merge to_be_merged to the global set org_set
function merge_into_org_set(to_be_merged){
	for(var item in to_be_merged){
		org_set[item] = to_be_merged[item];
	}
}

// helper function
// if the css selector exists, return its innerHTML; return '' elsewise
function get_inner_text(selector){
	var element = document.querySelector(selector);
	if(element === null){
		return '';
	}
	else{
		return element.innerText;
	}
}

function detail_in_csv(){
	var headers = ['Email','Phone','Website','Address','Date Founded','Government ID number','Fax','keywords','description'];
	var result = 'Name,'+headers.join(',')+'\n';
	for(var d in detail_set){
		var record = detail_set[d];
		result+='"'+d+'"';
		for(var h in headers){
			var field = headers[h];
			result+=',';
			if(field in record){
				result+='"'+record[field]+'"';
			}
		}
		result += "\n";
	}
	return result;

}

// evaluate the organization detail page and
// extract information such as phone number and email address
// @return: an object containing org information
function eval_extract_detail(){
	var dts = document.querySelectorAll('#contentGroupB .content:first-child dt');
	var dds = document.querySelectorAll('#contentGroupB .content:first-child dd');
	var record = {};
	for(var dt=0;dt<dts.length;dt++){
		var dt_content = dts[dt].innerText;
		if(dt_content !== ''){
			dt_content = dt_content.replace(':','');
			dd_content = dds[dt].innerText;
			record[dt_content] = dd_content;
		}
	}
	record['description'] = document.querySelector('#description .content').innerText;
	record['keywords'] = document.querySelector('dd.keywords').innerText;
	return record;
}

function eval_extract_list(){
	var users = document.querySelectorAll('.assetName a');
	var result = {};
	for(var i=0;i<users.length;i++){
		var user = users[i];
		result[user.innerText] = user.href;
	}
	return result;
}

function on_extract_list(casper){
	casper.waitFor(function(){	// wait for: condition function
		return this.evaluate(function(){
			return document.querySelector('div.content').style.opacity == 1;
		});
	}, function(){		// wait for: then function
		casper.echo("scraping... "+this.getCurrentUrl());
		merge_into_org_set(this.evaluate(eval_extract_list));
		if(this.exists('a.next')){	// if there is the next page, click the link
			this.wait(1000, function(){
				this.click('a.next');
				this.emit('results.load');
			});
		}
	});

}

function scrape_list_page(url){
	casper.start();
	console.log('start scraping...');
	casper.thenOpen(url,function(){
		var name;console.log('before evaluation...');
		name = this.evaluate(eval_extract_list);
		// fs.write('./result.txt', name, 'a');
		console.log(name);
	});

	casper.then(function(){
		//this.capture('step2.png',{top:0,left:0,width:1024,height:768});
	});

	casper.run();
}

function scrape_idealist_page(keyword, output_file){
	if(fs.isFile(output_file)){
		org_set = JSON.parse(fs.read(output_file));
	}
	var url = 'http://www.idealist.org/';
	
	casper.on('results.load', function(){
		on_extract_list(this);
	});
	casper.start();
	console.log('start scraping...');
	casper.thenOpen(url,function(){
		this.fill('form[name="search_form"]', {
			'search_user_query' : keyword,
			'search_type' : 'org'
		}, true);
	});

	casper.then(function(){
		this.emit('results.load');
	});

	casper.then(function(){
		this.capture('step2.png',{top:0,left:0,width:1024,height:768});
		fs.write(output_file, JSON.stringify(org_set), 'w');
		// console.log();
	});

	casper.run();
}

function detail_idealist_page(list_file, username, password){
	if(fs.isFile(list_file)){
		org_set = JSON.parse(fs.read(list_file));
		var url = 'http://www.idealist.org/';
		casper.start(url);
		console.log('logging in......');
		login_idealist(username, password);

		var index=0;	//　I need an index out of the then scope for lazy function calling
		var keys = Object.keys(org_set);	//  stores all the name of the orgs.
		for(var i=0;i<keys.length;i++){
			casper.then(function(){
				var org_name = keys[index];
				var org_url = org_set[org_name];
				casper.open(org_url).then(function(){
					console.log('fetching: '+org_url);
					var data = this.evaluate(eval_extract_detail);
					detail_set[org_name] = data;
					console.log(JSON.stringify(data));
				});
				index++;

			})
		}
		casper.then(function(){
			console.log('writting JSON file '+list_file+'.json ...');
			fs.write(list_file+'.json', JSON.stringify(detail_set), 'w');
			console.log('writting CSV file '+list_file+'.csv ...');
			fs.write(list_file+'.csv', detail_in_csv(), 'w');
		});
		casper.run();
	}
	else{
		return;
	}
}

function login_idealist(username, password){
	var url = 'http://www.idealist.org/';
	// casper.start(url);
	casper.then(function(){
		this.viewport(1280,768);
		this.click('#login_link');
	});
	casper.then(function(){
		this.wait(2000);
	});
	casper.then(function(){
		this.wait(2000);
		this.fill('form[name="content"]', {
			'content_prompt_login' : username,
			'content_prompt_password' : password
		}, true);
		this.wait(2000);
		
	});
	casper.then(function(){
	});
	// casper.run();
}


function main(){
	switch(casper.cli.get(0)){
		case 'scrape':
			console.log('Scrape mode. Keyword: '+casper.cli.get(1)+' Output file: '+casper.cli.get(2));
			scrape_idealist_page(casper.cli.get(1), casper.cli.get(2));
			break;
		case 'detail':
			console.log('Fetching detail mode. Input file: '+casper.cli.get(1)+' Output file: '+casper.cli.get(1)+'.json');
			console.log('Logging in with '+casper.cli.get(2)+' password: '+casper.cli.get(3));

			detail_idealist_page(casper.cli.get(1), casper.cli.get(2), casper.cli.get(3));
			break;
		case 'login':
			console.log('Logging in with '+casper.cli.get(1)+' password: '+casper.cli.get(2));
			login_idealist(casper.cli.get(1),casper.cli.get(2));
			break;

	}
	// casper.start();
	// casper.thenOpen('http://www.idealist.org/search/v2/?qs=QlpoOTFBWSZTWVpN6mgAAFSfgAMAMAIBAAAAuuX_oCAAiQlU8hMjI0M0jQShRo9GhGoPQNOkOlVZGsHIZSJtUGMIig3pf7BE3AlY4eBn4kbAa4GSlYJ7f0YoBl8G5Yi8jLU6VVFGYw6jjvY0_TGmkFAHlUky3F6EZfDFdSLuSxN5cys0oSr-LuSKcKEgtJvU0A==',function(){
	// 	console.log('begin to evaluate');
	// 	this.evaluate(function(search_word){
	// 		// document.querySelector('input[name="search_user_query"]').value=search_word;
	// 		// document.querySelector('form[name="search_form"]').submit();
	// 	}, search_key);
	// 	//this.capture('step2.png',{top:0,left:0,width:1024,height:768});
	// });
	

}
//jsonstringify
//JSON.parse()

main();

