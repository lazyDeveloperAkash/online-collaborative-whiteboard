const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    // db: process.env.REDIS_DB,
    // password: REDIS_PASSWORD,
    retryStrategy: (time)=> {
        return Math.min(time*50, 2000);
    }
})

redis.on('connect', ()=>{
    console.log('connected to redis');
})

redis.on('error', (err) => {
    console.log('redis error=> ' + err);
})

module.exports = redis;