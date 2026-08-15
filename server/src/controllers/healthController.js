function getHealth(req, res) {
  res.json({
    success: true,
    message: 'WaitLess API is running',
  });
}

module.exports = {
  getHealth,
};
