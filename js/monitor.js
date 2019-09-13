console.log("waiting...");
document.addEventListener( "DOMContentLoaded", () => {
    const url = location.origin.replace(/^https?:/, 'ws:') + "/subscribe";

    var interval = null;
    var minutes = 0;

    function connect() {
        var ws = null;
        try {
            ws = new WebSocket( url, ["monitor"] );
        } catch( err ) {
            console.log( "Websocket open-error, attempting reconnect...", err );
            return window.setTimeout( connect, 5000 );
        }
        ws.onerror = function(err) {
            console.log( "ERR:", err );
        };
        ws.onopen = function() {
            console.log( "Websocket opened." );
            document.body.classList.remove("connecting");
            document.body.classList.add("thanks");
        };
        ws.onmessage = function(message) {
            var data = JSON.parse( message.data );

            if( data.minutes ) {
                if( interval != null )
                    window.clearInterval( interval );

                minutes = data.minutes - 1;
                document.querySelector("#timer h1").textContent = minutes;
                document.body.classList.remove("thanks");
                document.body.classList.add("timer");

                interval = window.setInterval( function() {
                    if( minutes-- == 0 ) {
                        document.body.classList.remove("timer");
                        document.body.classList.add("thanks");
                    }

                    document.body.classList.toggle( "lastMinute", minutes < 5 );

                    document.querySelector("#timer h1").textContent = minutes;
                }, 60000 );
            }
        };
        ws.onclose = function() {
            console.log( "Websocket closed, attempting reconnect..." );
            window.setTimeout( connect, 500 );
        };
    }
    connect();
});
