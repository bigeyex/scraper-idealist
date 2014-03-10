scraper-idealist
================

scrap NGO information from idealist

Usage:

Step 1: Install casper.js following instructions.
http://docs.casperjs.org/en/latest/installation.html

Step 2: Run in scrape mode for several search keywords. Scraper will merge orgnizations with the same name.

Command Line:
casperjs scraper.js scrape *[keyword]* *[project_name]*
Example:
casperjs scraper.js scrape lesbian LGBT_project

Step 3: Run in detail mode to fetch organization details (with username and password provided) and output in JSON and CSV.

Command Line:
casperjs scraper.js scrape *[project_name]* *[username]* *[password]*
Example:
casperjs scraper.js detail LGBT_project 'username' password