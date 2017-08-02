const CDP = require('chrome-remote-interface');
const Koa = require('koa');
const app = new Koa();

const viewportWidth = 1440;
const viewportHeight = 900;

app.use(async ctx => {
  ctx.body = await capture(ctx.request.query.url);
});

app.listen(3000);
console.log(`Koa on port: 3000`);

const capture = function (url) {
  return new Promise((resolve, reject) => {
    CDP.New().then((target) => {
      return CDP({ target });
    }).then(async (client) => {
      console.log(url)
      // Extract used DevTools domains.
      const { DOM, Emulation, Network, Page, Runtime } = client;

      // Enable events on domains we are interested in.
      await Page.enable();
      await DOM.enable();
      await Network.enable();

      // Set up viewport resolution, etc.
      const deviceMetrics = {
        width: viewportWidth,
        height: viewportHeight,
        deviceScaleFactor: 0,
        mobile: false,
        fitWindow: false,
      };
      await Emulation.setDeviceMetricsOverride(deviceMetrics);
      await Emulation.setVisibleSize({ width: viewportWidth, height: viewportHeight });

      await Page.enable();
      console.log(url);
      await Page.navigate({ url: url });
      Page.loadEventFired(() => {
        setTimeout(async () => {
          console.log(Date.now())
          const { root: { nodeId: documentNodeId } } = await DOM.getDocument();
          const { nodeId: bodyNodeId } = await DOM.querySelector({
            selector: '.export-container',
            nodeId: documentNodeId,
          });

          const { model: { height } } = await DOM.getBoxModel({ nodeId: bodyNodeId });
          await Emulation.setVisibleSize({ width: deviceMetrics.width, height: height });
          await Emulation.setDeviceMetricsOverride({ width: deviceMetrics.width, height: height, screenWidth: deviceMetrics.width, screenHeight: height, deviceScaleFactor: 1, fitWindow: false, mobile: false });
          await Emulation.setPageScaleFactor({ pageScaleFactor: 1 });
          const { data } = await Page.captureScreenshot();
          console.log(Buffer.from(data, 'base64'))
          resolve(Buffer.from(data, 'base64'));
          const id = client.target.id;
          client.close();
          CDP.Close({ id });
        }, 10000);
      });
    }).catch((err) => {
      console.error(err);
    });
  })
}