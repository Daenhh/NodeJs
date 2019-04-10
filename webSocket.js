var app=require('http').createServer(handler);
var ws=require('nodejs-websocket');
var fs=require('fs');
app.listen(8080);
function handler(req,res){
    fs.readFile('/node/client.html',function(err,data){
        if(err){
            res.writeHead(500);
            return res.end('error ');
        }
        res.writeHead(200);
        res.end(data);
    });
}
var AllUserData = new Array();
var server=ws.createServer(function(conn){
   // console.log('new connection');
    conn.on("text",function(str){
        //broadcast(server,str);
	console.log(str);
	if(str.substring(0,8) === "FirstCon"){ 
	    for(var i = 0; i < AllUserData.length; i++){
		if(AllUserData[i].id === str.substring(9)){
		    conn.sendText("Have A Connection.")
		    return ;
		}		    
 	    }
	    AllUserData.push({
	        id: str.substring(9),
 	  	conn1: conn,
		conn2: null,
  	    })
	    broadcast(server,str.substring(9) + "-1 connection.");
	}
	else if(str.substring(0,7) === "NextCon"){
	    for(var i = 0; i < AllUserData.length; i++){
		if(str.substring(8) === AllUserData[i].id){
		    if(AllUserData[i].conn2 === null){
		   	AllUserData[i].conn2 = conn;
		 	broadcast(server,str.substring(8) + "-2 connection.");
		    	return ;
		    }
		    else{
			conn.sendText("Have A Connection.");
			return ;
		    }
		}
	    }
	    conn.sendText("No First Connection!")
	}
	else{
	    for(var i = 0; i< AllUserData.length; i++){
		if(conn === AllUserData[i].conn1 & AllUserData[i].conn2 !== null){
		    AllUserData[i].conn2.sendText(str);
		    conn.sendText(str);
		    return ;
		}
		else if(conn === AllUserData[i].conn2){
		    AllUserData[i].conn1.sendText(str);
		    conn.sendText(str);
		    return ;
		}
	    }
	}
    });
    conn.on("close",function(code,reason){
        console.log('connection closed');
	for(var i = 0;i < AllUserData.length; i++)
	{
	    if(conn === AllUserData[i].conn1){
		AllUserData.splice(i, 1);
		return ;
	    }
	    else if(conn === AllUserData[i].conn2){
		AllUserData[i].conn2 = null;
                return ;
	    }
	}
    });
    conn.on("error",function(code,reason){
	console.log('close error')
	for(var i = 0;i < AllUserData.length; i++)
	{
	    if(conn === AllUserData[i].conn1)
	    {
		AllUserData.splice(i, 1);
		return;    
	    }
	    else if(conn === AllUserData[i].conn2){
		AllUserData[i].conn2 = null;
                return ;
	    }
	}
    });
}).listen(5000);

console.log('webSocket server running at wss://daenhh.top:5000');
 
function broadcast(server, msg) {
    server.connections.forEach(function (conn) {
        conn.sendText(msg);
    })
}
