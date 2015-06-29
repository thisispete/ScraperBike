#Scraperbike

OWA be **hella retarded**, this shit here will gost-ride the motherfucking cloud, go 18 dummy in your busted-ass ride! For real.

(Scrapes your OWA Calendar and publishes an ics file that you can subscribe to via your favorite calendar app.)


###That Go:

edit the **config.json** with *username, password, url*

## *or*

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