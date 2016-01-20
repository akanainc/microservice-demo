// This client takes two params:
//    1 - the function name to use in the RPC call
//    2 - the string used as parameters to the function, make sure you quote the string if it has spaces or other special chars

var amqp = require('amqplib/callback_api');
// Replace the amqp URL below with the URL from your AMQP system, e.g. CloudAMQP.
// CLoudAMQP Users can find this URL on the instance detaiuls page from your Control Panel
var url = process.env.CLOUDAMQP_URL || "amqp://user:password@host/exchange";

amqp.connect(url, function(err, conn) {
  conn.createChannel(function(err, ch) {
    ch.assertQueue('', {exclusive: true}, function(err, q) {
      var corr = generateUuid();
      var functionName = process.argv[2];
      var inputString = process.argv[3];

      console.log('Executing: ' + functionName + " with input: " + inputString);

      ch.consume(q.queue, function(msg) {
        if (msg.properties.correlationId == corr) {
          console.log(' [.] Got %s', msg.content.toString());
          setTimeout(function() { conn.close(); process.exit(0) }, 500);
        }
      }, {noAck: true});

      var headers = {'functionName': functionName};
      
      // Replace 'demo' below with your queue name.  This must match your server queue name
      ch.sendToQueue('demo',
      new Buffer(inputString),
      { correlationId: corr, replyTo: q.queue, headers: headers });
    });
  });
});

function generateUuid() {
  return Math.random().toString() +
         Math.random().toString() +
         Math.random().toString();
}