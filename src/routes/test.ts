import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  if (req.header("x-auth-token") === '1') {
    res.status(200).send({message: 'TEST Success', package: data});
  } else {
    res.status(400).send({message: 'TEST Failure'});
  }

  return;
});

export default router;
