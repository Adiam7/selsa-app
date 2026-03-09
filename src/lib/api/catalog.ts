import { apiClient } from './client';

export async function getCatalogProductByExternalId(externalProductId: string) {
  try {

    // ✅ First, fetch the catalog product (not variant) by external_product_id
    const productRes = await apiClient.get(
      `/catalog/products/by-external-id/${externalProductId}/`
    );

    // const productRes = await axios.get(`/catalog/products/?external_product_id=${externalProductId}`);
    const catalogProduct = productRes.data;

    if (!catalogProduct || Object.keys(catalogProduct).length === 0) {
      return null;
    }

    // ✅ Now fetch variants for this catalog product
    // before optimization
    // const variantsRes = await axios.get(`/catalog/products/${catalogProduct.id}/variants/`);
    // const variants = variantsRes.data;

    // After optimization
    const variants = catalogProduct.variants;

    // Optionally, include variants inside the returned object
    return { ...catalogProduct, variants };

  } catch (err) {
    // Error handled silently
    throw err;
  }
}

export async function getCatalogProductBySlug(slug: string) {
  const res = await apiClient.get(`/catalog/products/by-slug/${slug}/`);
  return res.data;
}
