var akana = {};
var url = process.env.CLOUDAMQP_URL || "amqp://qlgmscns:kvcZM_64Xvkqzt1vawEwl3xOIwjdXPJQ@hyena.rmq.cloudamqp.com/qlgmscns";
var amqp = require('amqplib/callback_api');

// Consumer
amqp.connect(url,function(err, conn) {
  conn.createChannel(function(err, ch) {
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