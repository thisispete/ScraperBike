#Scraperbike

Enterprise OWA be **hella retarded**, this shit here will gost-ride the motherf*cking cloud, go 18 dummy in your busted-a$$ ride! For real.

(Scrapes your OWA Calendar and publishes an ics file that you can subscribe to via your favorite calendar app.)


##That Go

###Installation

- create a new heroku app
- follow the instructions to git push your files to heroku
- do all the following config using your credentials / config settings / etc
- subscribe to your new calendar at http://[yourappname].herokuapp.com/calendar, use the same username and password for the HTTP basic auth

### Config

edit the **config.json** with *username, password, url*

*or*

set Node environment variables on your server ie heroku:

```bash
heroku config:set username = [your owa username]
```

```bash
heroku config:set password = [your owa password]
```

```bash
heroku config:set url = [your owa url]
```

*config override heiararchy:*

1. config.json
2. Node environment variables
3. Command-line arguments

#### Timezone

https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

edit the **config.json** timezone

*and*

```bash
heroku config:set timezone = [your timezone string in quotes]
```

####Also in **config.json**

- days = number of days starting today to scrape forward
- publishTitle = title that appears on calendar once you subscribe


