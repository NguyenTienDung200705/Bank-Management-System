function getPagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const size = Math.min(Math.max(parseInt(query.size, 10) || 10, 1), 100);
  const offset = (page - 1) * size;
  return { page, size, offset, limit: size };
}

function buildPageResult({ rows, count }, page, size) {
  return {
    items: rows,
    pagination: {
      page,
      size,
      totalItems: count,
      totalPages: Math.ceil(count / size) || 1,
    },
  };
}

module.exports = { getPagination, buildPageResult };
