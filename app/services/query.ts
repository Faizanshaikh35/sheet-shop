import db from "../db.server";
import {CONNECTOR_TYPE} from "../constant/index";
export const getConnectorByType = (shopId, type) => {
  return db.connector.findFirst({ where: { shopId, type } });
}

export const findShopByShopId = (shopId) => {
 return db.shop.findUnique({ where: { shopId } });
}

export const getAdminShopInfo = async (admin) => {
  const shopQueryResponse = await admin.graphql(
    `#graphql
      query GetShopId {
        shop {
          id,
          name
        }
      }`
  );

  return shopQueryResponse.json();
}

export const deleteConnectorByShopId = async (shopId, type) => {
  return db.connector.deleteMany({ where: { shopId, type } })
}

export async function updateConnector(id: string, data: any) {
  return db.connector.update({
    where: { id },
    data
  });
}
