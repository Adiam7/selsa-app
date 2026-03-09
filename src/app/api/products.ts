import type { NextApiRequest, NextApiResponse } from 'next';

const dummyProducts = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: (Math.random() * 100).toFixed(2),
  image: `/images/product-${(i % 5) + 1}.jpg`,
  images: [],
}));

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const page = parseInt((req.query.page as string) || '1');
  const perPage = 6;
  const start = (page - 1) * perPage;
  const paginated = dummyProducts.slice(start, start + perPage);

  const numPages = Math.ceil(dummyProducts.length / perPage);
  res.status(200).json({
    products: paginated,
    pagination: {
      current_page: page,
      num_pages: numPages,
      has_previous: page > 1,
      has_next: page < numPages,
      previous_page: page > 1 ? page - 1 : null,
      next_page: page < numPages ? page + 1 : null,
    },
  });
}
