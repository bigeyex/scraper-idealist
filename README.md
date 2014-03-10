scraper-idealist
================

Scrape NGO information from idealist
NOTICE: It only scrape NGO within United States.

#Usage:

##Step 1: 
Install casper.js following instructions.
http://docs.casperjs.org/en/latest/installation.html

##Step 2: 
Run in scrape mode for several search keywords. Scraper will merge orgnizations with the same name.
You may want to run this command for several times. Use it with the same project name to combine results.

Command Line:

    casperjs scraper.js scrape [keyword] [project_name]

Example:

    casperjs scraper.js scrape lesbian LGBT_project

##Step 3: 
Run in detail mode to fetch organization details (with username and password provided) and output in JSON and CSV.
Command Line:

    casperjs scraper.js scrape [project_name] [username] [password]

Example:

    casperjs scraper.js detail LGBT_project 'username' password
