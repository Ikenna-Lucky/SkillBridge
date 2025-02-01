//Basically what we are doing here is to create a middleware that will help us find the cookie , then the token and then  the UserId we are looking for
//the userId is stored in the token and the token is stored in the cookie
import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({ success: false, message: "Not Authorized, Login Again" });
  }
  try {
    //To decode the token, we use jwt.
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Not Authorized, Login Again",
      });
    }
    next();
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;
