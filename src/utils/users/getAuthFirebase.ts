import { getAuth } from "firebase-admin/auth";

const getAuthFirebase = async (idToken : string) => {
  try {
    const decoded = await getAuth().verifyIdToken(idToken);
    return decoded;
  } catch (e){
    return null;
  }
};

export default getAuthFirebase
