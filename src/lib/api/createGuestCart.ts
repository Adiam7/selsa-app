export async function createGuestCart() {
  const res = await fetch('/api/cart/create', { method: 'POST' });
  const data = await res.json();

  if (!res.ok || !data.id) {
    throw new Error(data.error || 'Failed to create guest cart');
  }

  return data.id as string;
}
