/*
 * @Description: node服务
 * @Version: 4.0.0
 * @Date: 2021-07-06 11:39:38
 * @LastEditors: Yawen Yang
 * @LastEditTime: 2021-12-09 10:35:54
 */
const koa = require('koa');
const axios = require('axios');
 // 引入 koa-static
const staticFiles = require('koa-static')

const Router = require('koa-router')

const crypto = require('crypto');
const app = new koa();
const router = new Router()
app.use(staticFiles('./'))

const keyMap = {
    '54088bb07d2df3c46b79f80300b0abbe': 'd23bf3f2507ec46e6abd6aadc4e320bb',
    '6370a348ba8bddd565b19cb9aea370de': '70e8826d6d9cac49dc6f2536f701c0c6',
    '99b142aaece96330d0f3ffb565ffb3ef': '6107efae4ed9e4228403c6625c8e2511',
    '552d008a5b9816121503c69c9a133ce3': '552d008a5b9816121503c69c9a133ce3'
};

app.use(async(ctx, next)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
    ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    if (ctx.method == 'OPTIONS') {
      ctx.body = 200; 
    } else {
     await next();
    }
})

router.get('/demo/login', async(ctx, next) => {
    const params = ctx.query;
    const prikey = keyMap[params.captcha_id];

    if(!prikey){
        ctx.response.status = 200;
        ctx.response.body = {'result': 'fail', 'reason': 'id is not in id pools '};;
    }

    const sign_token = crypto.createHmac('sha256', prikey).update(params.lot_number).digest('hex');
    const query = Object.assign(params,{
        sign_token
    });
    const result = await axios({
        method: 'get',
        params: query,
        url: 'http://gcaptcha4.geetest.com/validate'
    }).then((res)=>{
        return res.data
    }).catch(()=>{
        return {'result': 'success', 'reason': 'request geetest api fail'};
    })
    ctx.response.status = 200;
    ctx.response.body = result;
})

app.use(router.routes())
    .listen(9013, ()=>{
        console.log('server is running in 9013');
    });