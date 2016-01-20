var akana = {};
var amqp = require('amqplib/callback_api');
// Replace the amqp URL below with the URL from your AMQP system, e.g. CloudAMQP.
// CLoudAMQP Users can find this URL on the instance detaiuls page from your Control Panel
var url = process.env.CLOUDAMQP_URL || "amqp://user:password@host/exchange";

// Consumer
amqp.connect(url,function(err, conn) {
  conn.createChannel(function(err, ch) {
    // Pick a queue name you want to use, demo is just for this example
    var q = 'demo';

    ch.assertQueue(q, {durable: false});
    ch.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    ch.consume(q, function reply(msg) {
      console.log("Function Name: %s", msg.properties.headers.functionName);
      
      var r;
      if (!akana[msg.properties.headers.functionName]) {
        r = "Unknown function name";
      } else {
        r = akana[msg.properties.headers.functionName](msg.content);
      }
      
      ch.sendToQueue(msg.properties.replyTo,
        new Buffer(r.toString()),
        {correlationId: msg.properties.correlationId});

      ch.ack(msg);
    });
  });
});

// Write some functions you want to invoke
// Make sure they are in the akana namespace as below
akana.hello = function(n) {
  return "Hello: " + n + " from all of us here at Akana";
};

akana.reflect = function(n) {
  return n;
};

akana.fibonacci = function(n) {
    var a = 0, b = 1, c;
    if (n < 3) return 1;
    while (--n)
        c = a + b, a = b, b = c;
    return c;
};