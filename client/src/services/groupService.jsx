export const getGroups = async (isSuperAdmin = false, page = 1, limit = 10) => {
    const endpoint = isSuperAdmin ? '/groups' : '/groups/my-groups';
    const response = await api.get(endpoint, {
      params: { page, limit }
    });
    return {
      data: response.data.items,
      pagination: response.data.pagination
    };
  };