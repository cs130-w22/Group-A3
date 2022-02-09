from datetime import datetime, timedelta, timezone
from typing import Any
from typing_extensions import Self
from flask import request
import jwt


class Token:
    """
    Python-representation of a JWT session token.

    Example:

    ```json
    { "id": 0 }
    ```
    """

    def __init__(self, secret: str, user_id: int) -> None:
        """
        Prepare a token for serialization with the given user ID.
        """
        self.payload = {"id": user_id}
        self._secret = secret

    def __repr__(self) -> str:
        return str(self.payload)

    def to_jwt(self) -> str:
        """
        Convert the provided dictionary payload into a Base64-encoded JWT.

        Tokens expire in 31 days, and cannot be used before the time they
        were issued at.
        """
        return jwt.encode(
            {
                **self.payload,
                # Tokens are valid for 31 days.
                "exp": datetime.now(tz=timezone.utc) + timedelta(days=31),
                # Tokens should not be accepted before the present day.
                "nbf": datetime.now(tz=timezone.utc),
            },
            self._secret,
            algorithm="HS256",
        ).decode("utf-8")


def get_token(secret: str) -> Token:
    """
    Get the JSON map encoded in the request's "Authorization" header.
    Expiration is automatically checked by PyJWT. If the signature is
    expired, an ExpiredSignatureError is thrown.

    The "nbf" and "exp" claims are required for each token. If they are
    missing, then this function will throw an error.

    Similarly, should the JWT be valid but missing a required property
    (see Token class doc), it will throw a KeyError.
    """
    return Token(
        secret,
        jwt.decode(
            request.headers.get("Authorization"),
            secret,
            algorithms=["HS256"],
            options={"require": ["exp", "nbf"]},
        )["id"],
    )
