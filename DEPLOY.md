# Deploying `gradebetter`

## Local Hardware

If you're deploying this to your own hardware, it isn't so bad. You just have to
make a `virtualenv` for the backend and connect it to your postgres instance.

To serve the frontend, you can build it with `yarn && yarn run build` then move
it behind an HTTPS proxy.

## Cloud Deployment

We deploy `gradebetter` in two parts to two separate providers:
* Frontend to Netlify
* Backend to Heroku

It's an overly complicated process because we don't have admin permissions over
our project repo to add GitHub actions to do it for us.

### Frontend

To deploy the frontend, `cd frontend`, `yarn`, `yarn run build`
and then upload the `build` folder to Netlify.

### Backend

To deploy the backend, it's a little more involved. We have to log into Heroku,
add the Heroku remote, then push our changes to it:

```
heroku login
heroku git:remote -a MY_APP_ID
git push my_branch:main
```
