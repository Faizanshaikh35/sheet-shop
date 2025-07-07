import {ActionFunction} from '@remix-run/node';
import {authenticate} from "../shopify.server";


export const action: ActionFunction = async ({request}) => {
  const {topic, shop, session} = await authenticate.webhook(request);

  switch (topic) {
    case 'PRODUCT_UPDATE':
      if (session) {
        console.log("This is the webhook session")
      }
      break;
    default:
      throw new Response('Unhandled webhook topic', {status: 404});
  }

  throw new Response();
};
