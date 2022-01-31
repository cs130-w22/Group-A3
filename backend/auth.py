from flask import request
from flask_jwt import JWT
from functools import wraps
import jwt

def token_required(f):
   @wraps(f)
   def decorator(*args, **kwargs):
       token = None
       if 'x-access-tokens' in request.headers:
           token = request.headers['x-access-tokens']
 
       if not token:
           return {'message': 'a valid token is missing'}, 400
       try:
           data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
           current_user = Users.query.filter_by(public_id=data['public_id']).first()
       except:
           return {'message': 'token is invalid'}, 400
 
       return f(current_user, *args, **kwargs)
   return decorator