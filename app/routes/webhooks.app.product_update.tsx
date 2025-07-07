import type {ActionFunctionArgs} from "@remix-run/node";
import {authenticate} from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  // Authenticate webhook
  const { payload, topic, shop } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
    return new Response();
};
