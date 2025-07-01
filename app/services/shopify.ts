export async function getAllShopifyProducts(admin: any) {
  const products = [];
  let cursor = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const response = await admin.graphql(
      `#graphql
      query GetProducts($cursor: String) {
        products(first: 100, after: $cursor) {
          edges {
            node {
              id
              title
              description
              variants(first: 1) {
                edges {
                  node {
                    price
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
      { cursor }
    );

    const data = await response.json();
    const productEdges = data.data.products.edges;

    products.push(...productEdges.map((edge: any) => ({
      id: edge.node.id,
      title: edge.node.title,
      description: edge.node.description,
      price: edge.node.variants.edges[0]?.node.price || "0.00"
    })));

    hasNextPage = data.data.products.pageInfo.hasNextPage;
    cursor = data.data.products.pageInfo.endCursor;
  }

  return products;
}
