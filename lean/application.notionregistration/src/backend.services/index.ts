import express from 'express';
import { loadSecretConfiguration } from './configuration';
import { HttpStatusCode } from '@angular/common/http';
import axios from 'axios';
import crypto from 'crypto';
import session from 'express-session';
import { mapNotionPages, searchPages } from './pages.helper';
import { ClientIdentityService } from './client-identity.service';
import { AccessService } from './access.service';
import { EnglishWords } from '../replicated-models/words.entity';
import { PageService } from './page.service';

export function serve(server: express.Express) {
  const router = express.Router();
  server.use(express.json());
  const secrets = loadSecretConfiguration();

  router.get('/registered', async (req, res) => {
    const clientIdentityService = new ClientIdentityService(req);
    const accessService = new AccessService(
      clientIdentityService.getUserIdentity()
    );
    const access_token = (await accessService.retrieveAccessToken())
      ?.accessToken;

    if (!access_token) {
      res.json([]).status(HttpStatusCode.NoContent).end();
    } else {
      try {
        const pages = await searchPages(access_token);
        res.json(mapNotionPages(pages)).status(HttpStatusCode.Ok).end();
      } catch (err) {
        console.log(err);
        res.json([]).status(HttpStatusCode.NoContent).end();
      }
    }
  });

  router.get('/page/:pageId/englishwords', async (req, res) => {
    const clientIdentityService = new ClientIdentityService(req);
    const accessService = new AccessService(
      clientIdentityService.getUserIdentity()
    );
    const access_token = (await accessService.retrieveAccessToken())
      ?.accessToken;

    if (!access_token) {
      res.json(new EnglishWords()).status(HttpStatusCode.NoContent).end();
    } else {
      try {
        const pageService = new PageService(access_token);
        const pageId = req.params.pageId;
        res.json(await pageService.fetchAsync(pageId)).status(HttpStatusCode.Ok).end();
      } catch (err) {
        console.log(err);
        res.json(new EnglishWords()).status(HttpStatusCode.NoContent).end();
      }
    }
  });

  // Set up session middleware
  server.use(
    session({
      secret: secrets.SESSION_Secret_Key, // Use a strong secret key to sign the session ID cookie
      resave: false, // Don't resave the session if it wasn't modified
      saveUninitialized: true, // Save an uninitialized session
      cookie: { secure: false }, // Use secure: true in production (needs HTTPS)
    })
  );

  router.get('*', (req, res, next) => {
    // @ts-ignore
    // const generatedCSRFState = req.session.state ?? generateState();
    // @ts-ignore
    // req.session.state = req.session.state ?? generateState(); // If using sessions

    next();
  });

  router.get('/configuration', async (req, res) => {
    // @ts-ignore
    // const generatedCSRFState = req.session.state ?? generateState();
    // @ts-ignore
    // req.session.state = req.session.state ?? generateState(); // If using sessions
    const authorizationUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${
      secrets.NOTION_OAuthClient_ID
    }&response_type=code&owner=user&scope=read&redirect_uri=${encodeURIComponent(
      secrets.NOTION_OAuth_Reidrect_Uri
    )}`;
    res
      .json({
        enabled: secrets.notionEnabled,
        authUrl: authorizationUrl, // + `&state=${generatedCSRFState}`,
      })
      .status(HttpStatusCode.Ok)
      .end();
  });

  server.get('/callback', async (req, res) => {
    // Extract the `code` and `state` from the query string
    const { code, state } = req.query;
    const clientIdentityService = new ClientIdentityService(req);
    const accessService = new AccessService(
      clientIdentityService.getUserIdentity()
    );

    if (
      !code
      // || !state
    ) {
      return res.status(400).send('Missing code or state');
    }

    // // Validate the state to protect against CSRF
    // // @ts-ignore
    // if (state.toString() !== req.session.state) {
    //   return res.status(400).send('Invalid state');
    // }
    // // @ts-ignore;
    // delete req.session.state;

    try {
      // Step 3: Exchange the authorization code for an access token
      // Make the request to exchange the authorization code for an access token
      const tokenResponse = await axios.post(
        'https://api.notion.com/v1/oauth/token',
        {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: secrets.NOTION_OAuth_Reidrect_Uri, // Your redirect URI
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              secrets.NOTION_OAuthClient_ID +
                ':' +
                secrets.NOTION_OAuth_Client_Secret
            ).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const { access_token, workspace_id, bot_id, expires_in } =
        tokenResponse.data;

      // Now you can use the access token to make API calls to Notion on behalf of the user
      // Example: save the token to the session, database, or a secure store
      await accessService.storeAccessToken({
        accessToken: access_token,
        workspaceId: workspace_id,
        expiresIn: expires_in,
      });

      return res.redirect('/');
    } catch (error) {
      console.error('Error exchanging authorization code:', error);
      return res.status(500).send('Error exchanging authorization code');
    }
  });

  server.use('/api/portal', router);
}

// Utility function to generate state
function generateState() {
  return crypto.randomBytes(16).toString('hex');
}
