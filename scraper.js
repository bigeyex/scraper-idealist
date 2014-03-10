var casper = require('casper').create();
var fs = require('fs');



function extract_list(){
	var users = document.querySelectorAll('.assetName a');
	var user_result = "";
	for(var i=0;i<users.length;i++){
		var result = [];
		var user = users[i];
		console.log(user);
		console.log(user.innerText);
		result.push(['"'+user.innerText+'"', user.href]);
		
		user_result+=result.toString()+'\n';
	}
	return user_result;
}

function scrape_list_page(url){
	casper.start();
	console.log('start scraping...');
	casper.thenOpen(url,function(){
		var name;console.log('before evaluation...');
		name = this.evaluate(extract_list);
		// fs.write('./result.txt', name, 'a');
		console.log(name);
	});

	casper.then(function(){
		//this.capture('step2.png',{top:0,left:0,width:1024,height:768});
	});

	casper.run();
}

function main(){
	console.log('hello casper');
	var search_key_arg = 'environment';
	// casper.start();
	// casper.thenOpen('http://www.idealist.org/search/v2/?qs=QlpoOTFBWSZTWVpN6mgAAFSfgAMAMAIBAAAAuuX_oCAAiQlU8hMjI0M0jQShRo9GhGoPQNOkOlVZGsHIZSJtUGMIig3pf7BE3AlY4eBn4kbAa4GSlYJ7f0YoBl8G5Yi8jLU6VVFGYw6jjvY0_TGmkFAHlUky3F6EZfDFdSLuSxN5cys0oSr-LuSKcKEgtJvU0A==',function(){
	// 	console.log('begin to evaluate');
	// 	this.evaluate(function(search_word){
	// 		// document.querySelector('input[name="search_user_query"]').value=search_word;
	// 		// document.querySelector('form[name="search_form"]').submit();
	// 	}, search_key);
	// 	//this.capture('step2.png',{top:0,left:0,width:1024,height:768});
	// });
	var url = 'http://www.idealist.org/';
	casper.start();
	console.log('start scraping...');
	casper.thenOpen(url,function(){
		console.log('before evaluation...' + search_key_arg);
		this.fill('form[name="search_form"]', {
			'search_user_query' : search_key_arg,
			'search_type' : 'org'
		}, true);
	});
	
	casper.then(function(){
		console.log(this.evaluate(extract_list));
	});

	casper.then(function(){
		this.capture('step2.png',{top:0,left:0,width:1024,height:768});
	});

	casper.run();
}
//jsonstringify
//JSON.parse()

main();

