import axios from "axios";
const baseUrl = import.meta.env.VITE_BE_SIDE_URL + "/blogs";

let token = null;

const setToken = (newToken) => {
  token = `bearer ${newToken}`;
};

const getAll = async () => {
  console.log(token);
  const config = {
    headers: { Authorization: token },  // Attach token here
  };
  const response = await axios.get(baseUrl, config);  // Pass config with headers
  return response.data;
};

// Function to get a blog by ID
const getById = async (id) => {
  console.log(token);
  const config = {
    headers: { Authorization: token },  // Attach token here
  };
  const response = await axios.get(`${baseUrl}/${id}`, config);  // GET request to fetch blog by ID
  return response.data;
};

const create = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post(baseUrl, newObject, config);
  return response.data;
};

const update = async (newObject) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.put(
    `${baseUrl}/${newObject.id}`,
    newObject,
    config
  );
  return response.data;
};

const remove = async (id) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.delete(`${baseUrl}/${id}`, config);
  return response.data;
};

const postComment = async (comment, id) => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post(
    `${baseUrl}/${id}/comments`,
    comment,
    config
  );
  return response.data;
};

const generateBlogs = async () => {
  const config = {
    headers: { Authorization: token },
  };
  const response = await axios.post(`${baseUrl}/generate-blogs`, {}, config);
  return response.data;
};

export default { getAll,getById, create, update, remove, setToken, postComment, generateBlogs };
