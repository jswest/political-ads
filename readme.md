# Political ads
## John Sheffield Beebe-West

```
	................................................
	.      _____   ______   _______   __       __  .
	.    /     | /      \ /       \ /  |  _  /  |  .
	.    $$$$$ |/$$$$$$  |$$$$$$$  |$$ | / \ $$ |  .
	.       $$ |$$ \__$$/ $$ |__$$ |$$ |/$  \$$ |  .
	.  __   $$ |$$      \ $$    $$< $$ /$$$  $$ |  .
	. /  |  $$ | $$$$$$  |$$$$$$$  |$$ $$/$$ $$ |  .
	. $$ \__$$ |/  \__$$ |$$ |__$$ |$$$$/  $$$$ |  .
	. $$    $$/ $$    $$/ $$    $$/ $$$/    $$$ |  .
	.  $$$$$$/   $$$$$$/  $$$$$$$/  $$/      $$/   .
	................................................
```

----

This repository includes the ability to visualize and manipulate data about political ads. The data used here is from the [Political TV Ad Archive](http://politicaladarchive.org/). While I have not included the seed data, to replicate the dataset, you need only head over to [their data download page](http://politicaladarchive.org/data) and download both "details of ad airings on TV" and "list of unique ads archived". Save the details of ad airings as `/data/seed/instances.csv` and save the unique ads as `/data/seed/ads.csv`. Then run the four scripts in `/scripts/` folder:

- `node scripts/01-write-sponsor-list.js`
- After you run this, `cp data/sponsors-raw.csv data/sponsors.csv`
- Add the party to `data/sponsors.csv`
- `node scripts/02-write-party-candidate-and-subject-counts.js`
- `node scripts/03/write-candidate-instances.js`
- `node scripts/04/write-subject-instances.js`

Once you have done that, you have `.csv` and `.json` files in the `/data/` folder, which you can use as you see fit.

If you wish to visualize the data, first install the node module `http-server` globally:

- `npm install -g http-server`
- `cd charts/
- `http-server`
- navigate to `http://localhost:8080`

Ta-da.

The visualization javascript is rough, and I would love some PRs.  