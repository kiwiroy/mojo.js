import t from 'tap';
import App from '../lib/app.js';

t.test('App', async t => {
  const app = new App();

  app.get('/', ctx => ctx.render({text: 'Hello Mojo!'}));

  const client = await app.newMockClient();

  await t.test('Hello World', async t => {
    const res = await client.get('/');
    t.equal(res.status, 200, 'right status');
    t.equal(await res.text(), 'Hello Mojo!', 'right content');
    t.done();
  });

  await client.stop();
  t.done();
});