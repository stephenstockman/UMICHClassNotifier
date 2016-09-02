# UMICHClassNotifier
Simple NodeJS program that takes advantage of UMICH's UMScheduleOfClasses API to notify students when a desired course is available. Checks are done every 2 minutes and code can be edited to change the frequency of checking along with the courses checked.

#Setup
- Install NodeJS
- Download main.js and place in a folder/Directory
- NPM imstall cluster, nodemailer, and request into the same folder/Directory

#Settings
- Set frequency variable for how often you want it to check in minutes(1min-59min scale)
- Obtain client ID and Secret from https://api.it.umich.edu/store/site/pages/subscriptions.jag
- Enter the ID and secret in authorize()
- Enter Gmail email and password under sendMail(), similarly in setMessage setfrom: and to:

#Running
- Open NodeJS command prompt cd to folder/directory of main.js
- Edit main.js according to settings described below.
- run node main.js
