const app = require('./src/app');
const env = require('./src/config/env');

app.listen(env.port, () => {
  console.log(`WaitLess API running on port ${env.port} (${env.nodeEnv})`);
});
