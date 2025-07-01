import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { oauth2Client } from "../services/google";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {useEffect} from "react";
import db from "../db.server";
import {CONNECTOR_TYPE} from "../constant/index";
import {findShopByShopId, getAdminShopInfo, getConnectorByType} from "../services/query";

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
    const shopData = await getAdminShopInfo(admin);
    const shopId = shopData.data.shop.id;
    const shopName = shopData.data.shop.name;

    let shop = await findShopByShopId(shopId);

    if (!shop) {
      shop = await db.shop.create({
        data: {
          name: shopName,
          shopId: shopId
        }
      });
      console.log("New shop created:", shop);
    } else {
      console.log("Shop already exists:", shop);
    }

    // Now create/update the connector record
    const connectorData = {
      type: CONNECTOR_TYPE.GOOGLE,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      tokenType: tokens.token_type,
      refreshTokenExpiresIn: tokens.refresh_token_expires_in,
      expiryDate: tokens.expiry_date,
      shopId: shop.id,
    };

    const existingConnector = await getConnectorByType(shop.id, CONNECTOR_TYPE.GOOGLE);

    if (existingConnector) {
      const updateConnector = await db.connector.update({
        where: {
          id: existingConnector.id
        },
        data: connectorData
      })
      console.log("updateConnector", updateConnector)
    } else {
      const newConnector = await db.connector.create({
        data: connectorData
      })
      console.log("newConnector", newConnector)
    }

    console.log("Connector processed:", existingConnector);


    // Return success flag to client
    return json({ success: true });
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
