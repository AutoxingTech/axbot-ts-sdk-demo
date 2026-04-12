import { robotApi } from './node_modules/@kingsimba/axbot-sdk/dist/robotApi.js';
robotApi.init({
  getApiBase: () => '/robot-api',
  onApiCalled: (info) => console.log('TEST onApiCalled called!', info)
});

robotApi.getDeviceInfo().catch(() => { });
