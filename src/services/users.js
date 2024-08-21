import axios from "axios";
const baseUrl = process.env.REACT_APP_BE_SIDE_URL+"/users";

const getAll = async () => {
  const response = await axios.get(baseUrl);
  return response.data;
};

const addUser = async (user) => {
  const response = await axios.post(baseUrl, user);
  return response.data;
};

export default { getAll, addUser };
