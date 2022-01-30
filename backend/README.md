# backend

The backend for our grading solution supports operations on user-sensitive data.

## Get Started

You will need
* Docker
* Python 3.x.x
* `virtualenv`

```sh
# Set up our database container and run it. The following commands
# will redirect your image output to /dev/null. If you want to see the
# output, you should write to a file.
docker image build . -t gradebetter
docker run -p "5432:5432" gradebetter 2>&1 1>&/dev/null &
# In the future, you can run: docker start MY_CONTAINER_ID

# Set up our Python virtual environment.
virtualenv env
source env/bin/activate
pip install -r requirements.txt
python main.py
```

You're all set! Remember to run `black` in this directory before
committing.

## Useful Tools

If you want to see how your SQL query is running, [DataGrip](https://www.jetbrains.com/datagrip/)
or another similar database browser makes life much easier.
