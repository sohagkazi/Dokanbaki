const dbConnect = require('./lib/mongodb').default;

async function test() {
    try {
        console.log('Calling dbConnect...');
        await dbConnect();
        console.log('Connection Successful!');
        process.exit(0);
    } catch (e) {
        console.error('Connection Failed:', e);
        process.exit(1);
    }
}

test();
