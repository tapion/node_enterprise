const jwkToPem = require('jwk-to-pem');
const request = require('request');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const TOKEN_USE_ACCESS = 'access';
const TOKEN_USE_ID = 'id';

const ALLOWED_TOKEN_USES = [TOKEN_USE_ACCESS, TOKEN_USE_ID];
const ISSUER = `https://cognito-idp.${process.env.AUTH_COGNITO_REGION}.amazonaws.com/${process.env.AUTH_COGNITO_POOLID}`;

// One time initialisation to download the JWK keys and convert to PEM format. Returns a promise.
function _init() {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${ISSUER}/.well-known/jwks.json`,
      json: true,
    };
    request.get(options, function (err, resp, body) {
      if (err) {
        // console.debug();
        reject(new AppError(`Failed to download JWKS data. err: ${err}`, 401)); // don't return detailed info to the caller
        return;
      }
      if (!body || !body.keys) {
        reject(
          new AppError(
            `JWKS data is not in expected format. Response was: ${JSON.stringify(
              resp
            )}`,
            401
          )
        ); // don't return detailed info to the caller
        return;
      }
      const pems = {};
      for (let i = 0; i < body.keys.length; i += 1) {
        pems[body.keys[i].kid] = jwkToPem(body.keys[i]);
      }
      //console.info(`Successfully downloaded ${body.keys.length} JWK key(s)`);
      resolve(pems);
    });
  });
}

// Verify the Authorization header and return a promise.
function _verifyProm(pems, auth) {
  return new Promise((resolve, reject) => {
    if (pems.err) {
      reject(new Error(pems.err.message || pems.err));
      return;
    }
    // Check the format of the auth header string and break out the JWT token part
    if (!auth || auth.length < 10) {
      reject(
        new AppError(
          "Invalid or missing Authorization header. Expected to be in the format 'Bearer <your_JWT_token>'.",
          401
        )
      );
      return;
    }
    const authPrefix = auth.substring(0, 7).toLowerCase();
    if (authPrefix !== 'bearer ') {
      reject(
        new AppError(
          "Authorization header is expected to be in the format 'Bearer <your_JWT_token>'.",
          401
        )
      );
      return;
    }
    const token = auth.substring(7);

    // Decode the JWT token so we can match it to a key to verify it against
    const decodedNotVerified = jwt.decode(token, { complete: true });
    if (!decodedNotVerified) {
      // console.debug(`Invalid JWT token. jwt.decode() failure.`);
      reject(new AppError('Invalid JWT token. jwt.decode() failure.', 401)); // don't return detailed info to the caller
      return;
    }
    if (
      !decodedNotVerified.header.kid ||
      !pems[decodedNotVerified.header.kid]
    ) {
      // console.debug(
      //   `Invalid JWT token. Expected a known KID ${JSON.stringify(
      //     Object.keys(pems)
      //   )} but found ${decodedNotVerified.header.kid}.`
      // );
      reject(
        new AppError(
          `Invalid JWT token. Expected a known KID ${JSON.stringify(
            Object.keys(pems)
          )} but found ${decodedNotVerified.header.kid}.`,
          401
        )
      ); // don't return detailed info to the caller
      return;
    }

    // Now verify the JWT signature matches the relevant key
    jwt.verify(
      token,
      pems[decodedNotVerified.header.kid],
      {
        issuer: ISSUER,
        maxAge: process.env.AUTH_COGNITO_TKNEXPIRATION,
      },
      function (err, decodedAndVerified) {
        if (err) {
          // console.debug(`Invalid JWT token. jwt.verify() failed: ${err}.`);
          if (err instanceof jwt.TokenExpiredError) {
            reject(
              new AppError(
                `Invalid JWT token. jwt.verify() failed: ${err}.`, 401
              )
            );
          } else {
            reject(
              new AppError(
                'Authorization header contains  2 an invalid JWT token.', 401
              )
            ); // don't return detailed info to the caller
          }
          return;
        }

        // The signature matches so we know the JWT token came from our Cognito instance, now just verify the remaining claims in the token

        // Verify the token_use matches what we've been configured to allow
        if (ALLOWED_TOKEN_USES.indexOf(decodedAndVerified.token_use) === -1) {
          // console.debug(
          //   `Invalid JWT token. Expected token_use to be ${JSON.stringify(
          //     ALLOWED_TOKEN_USES
          //   )} but found ${decodedAndVerified.token_use}.`
          // );
          reject(
            new AppError(
              `Invalid JWT token. Expected token_use to be ${JSON.stringify(
                ALLOWED_TOKEN_USES
              )} but found ${decodedAndVerified.token_use}.`, 401
            )
          ); // don't return detailed info to the caller
          return;
        }

        // Verify the client id matches what we expect. Will be in either the aud or the client_id claim depending on whether it's an id or access token.
        const clientId = decodedAndVerified.aud || decodedAndVerified.client_id;
        // console.log(clientId, process.env.AUTH_COGNITO_CLIENTID);
        // if (clientId !== process.env.AUTH_COGNITO_CLIENTID) {
        //   // console.debug(
        //   //   `Invalid JWT token. Expected client id to be ${process.env.AUTH_COGNITO_CLIENTID} but found ${clientId}.`
        //   // );
        //   reject(
        //     new AppError(
        //       `Invalid JWT token. Expected client id to be ${process.env.AUTH_COGNITO_CLIENTID} but found ${clientId}.`, 401
        //     )
        //   ); // don't return detailed info to the caller
        //   return;
        // }

        // Done - all JWT token claims can now be trusted
        return resolve(decodedAndVerified);
      }
    );
  });
}

// Verify the Authorization header and call the next middleware handler if appropriate
function _verifyMiddleWare(pemsDownloadProm, req, res, next) {
  pemsDownloadProm
    .then((pems) => {
      return _verifyProm(pems, req.get('Authorization'));
    })
    .then((decoded) => {
      // Caller is authorised - copy some useful attributes into the req object for later use
      console.debug(`Valid JWT token. Decoded: ${JSON.stringify(decoded)}.`);
      req.user = {
        sub: decoded.sub,
        token_use: decoded.token_use,
      };
      if (decoded.token_use === TOKEN_USE_ACCESS) {
        // access token specific fields
        req.user.scope = decoded.scope.split(' ');
        req.user.username = decoded.username;
      }
      if (decoded.token_use === TOKEN_USE_ID) {
        // id token specific fields
        req.user.email = decoded.email;
        req.user.username = decoded['cognito:username'];
      }
      next();
    })
    .catch((err) => {
      // console.log(err);
      next(err);
      // const status = err instanceof AuthError ? 401 : 500; // Either not auth or internal error
      // res.status(status).send(err.message || err);
    });
}

// Get the middleware function that will verify the incoming request
function _getVerifyMiddleware() {
  // Fetch the JWKS data used to verify the signature of incoming JWT tokens
  const pemsDownloadProm = _init().catch((err) => {
    // Failed to get the JWKS data - all subsequent auth requests will fail
    console.error(err);
    return { err };
  });
  return function (req, res, next) {
    _verifyMiddleWare(pemsDownloadProm, req, res, next);
  };
}

exports.validRoles = (...roles) => {
  return (req, res, next) => {
    let find = false;
    roles.forEach((rol) => {
      if (req.authRoles.includes(rol)) {
        find = true;
      }
    });
    if (find) {
      next();
    } else {
      next(new AppError('User do not allowed to this action', 403));
    }
  };
};

exports.getVerifyMiddleware = _getVerifyMiddleware;
