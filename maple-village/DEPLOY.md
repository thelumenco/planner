# Putting Honeybrook live (honey-brook.web.app)

You do this once. After step 5, every push to the `honeybrook-public` branch goes live by itself.

## 1. Check two things in the Firebase console (console.firebase.google.com, project honey-brook)
- **Authentication → Sign-in method:** **Google** and **Email/Password** both show "Enabled".
- **Authentication → Settings → Authorised domains:** `honey-brook.web.app` and `honey-brook.firebaseapp.com` are listed
  (they are by default).

## 2. Get the code on your computer
In a terminal, in whichever folder you keep projects in:

```
git clone https://github.com/thelumenco/planner.git honeybrook
cd honeybrook
git checkout honeybrook-public
cd maple-village
npm install
```

(Already have the repo cloned? Then `cd` into it, `git fetch`, `git checkout honeybrook-public`, `git pull`,
`cd maple-village`, `npm install`.)

## 3. Build the game
```
npm run build:public
```
It builds the game and runs the leak check. You should see **"leak check: clean"**. If you don't, stop and tell Claude.

## 4. Deploy the security rules and the first version of the game
```
firebase login
firebase deploy --only firestore:rules,hosting
```
When it finishes, open **https://honey-brook.web.app**: you should see the Honeybrook welcome screen asking you to
sign in.

## 5. Turn on automatic deploys from GitHub
Still in the `maple-village` folder:
```
firebase init hosting:github
```
Answer its questions like this:
- **For which GitHub repository would you like to set up a GitHub workflow?** `thelumenco/planner`
- **Set up the workflow to run a build script before every deploy?** No
- **Set up automatic deployment to your site's live channel when a PR is merged?** No
- It may ask to **overwrite** files or write new workflow files: say **No** to anything that would replace
  `.github/workflows/honeybrook-deploy.yml`. If it writes other new workflow files (with names like
  `firebase-hosting-merge.yml` or `firebase-hosting-pull-request.yml`), delete them: the Honeybrook one already
  does the job.

What matters is that it creates a secret in your GitHub repository called
**FIREBASE_SERVICE_ACCOUNT_HONEY_BROOK** (you can check: GitHub → the repo → Settings → Secrets and variables →
Actions). If the secret has a slightly different name, tell Claude and the workflow will be updated to match.

## 6. Done
From now on Claude pushes to `honeybrook-public`, GitHub builds the game, runs the leak check, and puts it live at
honey-brook.web.app a minute or two later. Only that branch ever deploys; your personal branch never does.

If you ever change the security rules (Claude will tell you), run `firebase deploy --only firestore:rules` again from
`maple-village`.
