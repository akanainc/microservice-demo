# NodeAMQPDemo

This is a simple little application that demonstrates an RPC capability over AMQP.  It has 2 components.

## Server 

server.js - a worker process that binds to a CloudAMQP Queue (dynamically creating the queue on an exchange defined in the source code).  It pulls messages off the queue, using a functionName message header to determine which of the functions in the defined akana namespace to invoke.  It then places the response from the invoked function on the replyto queue specified by the requestor.

## Client

client.js - a single invocation client that tests the RPC mechanism by putting the second command line argument into a message, and setting the functionName header to the first command line argument.

## Execution

The project includes a Procfile used by Heroku to define server.js as a worker dyno.  

There's a nice turorial on how to use node in Heroku [here](https://devcenter.heroku.com/articles/getting-started-with-nodejs#set-up).  In a nutshell you need to install the Heroku toolbelt, then run ```heroku login```, ```git clone```, cd into the cloned folder, ```heroku create``` to define a Heroku app,```git push heroku master``` to deploy it, and then use ```heroku ps:scale web=0``` and ```heroku ps:scale worker=1``` to configure the app to run only the worker.

Alternatively you can simply run the worker process locally with ```node server.js```.  If you're going to run this locally you will need to install amqplib with ```npm install amqplib```.

Test it using the client app.  Change the function name header on line 19, and the message that's being sent, then execute ```node client.js fibonaaci 10```.  That's that.