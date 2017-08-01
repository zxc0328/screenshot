const CDP = require('chrome-remote-interface');
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
    ctx.body = await capture(ctx.request.query.url);
});

app.listen(3000);
console.log(`Koa on port: 3000`);

const capture = function (url) {
    return new Promise((resolve, reject) => {
        CDP({ host: "chrome" }, async (client) => {
            const { Page } = client;

            await Page.enable();
            await Page.navigate({ url: url});
            Page.loadEventFired(async () => {
                setTimeout(async () => {
                    const { data } = await Page.captureScreenshot();
                    console.log(Buffer.from(data, 'base64'))
                    resolve(Buffer.from(data, 'base64'));
                }, 0);
            });
        }).on('error', (err) => {
            console.error(err);
            reject(err);
        });
    })
}