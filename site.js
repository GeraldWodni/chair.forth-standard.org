// a chair helper
// (c)copyright 2019 by Gerald Wodni <gerald.wodni@gmail.com>
"use strict";

const redis = require("redis");

module.exports = {
    setup: function( k ) {

        k.router.get("/monitor", ( req, res, next ) => {
            k.jade.render( req, res, "monitor", { className: "connecting" } );
        });

        k.router.postman("/start", ( req, res, next ) => {
            var minutes = req.postman.int( "minutes" );

            k.rdb.publish("monitor", JSON.stringify({ "minutes": minutes }) );

            k.jade.render( req, res, "message", {
                className: "simple",
                message: "Started"
            });
        });

        k.ws(k.website, "/subscribe", function( ws ) {
            var subscriber = k.rdb.cloneClient();
            subscriber.on("message", (channel, message) => {
                ws.send(message);
            });
            ws.onerror = function( err ) {
                try {
                    console.log( "WS Err:", err );
                }
                catch(err) {
                    console.log( "Error Closing:", err );
                }
            };
            subscriber.subscribe("monitor");
        });

        k.router.get("/", ( req, res, next ) => {
            k.jade.render( req, res, "home", {
                className: "simple"
            });
        });
    }
}

