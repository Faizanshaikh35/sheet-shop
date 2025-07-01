import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { oauth2Client } from "../services/google";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {useEffect} from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!state) {
    return redirect("/app/settings?error=invalid_state");
  }

  if (!code) {
    return redirect("/app/settings?error=missing_code");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // First, get the shop's ID using the shop query
    const shopQueryResponse = await admin.graphql(
      `#graphql
      query GetShopId {
        shop {
          id
        }
      }`
    );


    const shopData = await shopQueryResponse.json();
    const shopId = shopData.data.shop.id;



    // Return success flag to client
    return json<{success: boolean, tokens: any}>({ success: true, tokens });
  } catch (error) {
    console.error("Google OAuth error:", error);
    return redirect("/app/settings?error=auth_failed");
  }
};

export default function GoogleAuthCallback() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  console.log("Loader Response", data);

  useEffect(()=> {
      if (data?.success) {
        navigate("/app/settings")
    }
  }, [data?.success])


  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>Completing authentication...</h2>
      <p>Please wait while we connect your Google account.</p>
      {!data?.success && (
        <button onClick={() => window.location.href = "/app/settings"}>
          Return to Settings
        </button>
      )}
    </div>
  );
}
