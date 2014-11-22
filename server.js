var http = require('http');
var exp = require("express");
var app = exp()
var socket = require("socket.io")
var fs = require("fs")


server = http.createServer(app);
server.listen(8124);

var io = socket.listen(server)

var resetString = "RHBKQBHRPPPPPPPPXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.P.P.P.P.P.P.P.P.R.H.B.K.Q.B.H.R"
function useacc(usepass){
	this.id = usepass
	this.board = [resetString]
	this.vs = [usepass[0]]
	this.boardNum = 0

}

function writeNewAccount(acc,sock){
	console.log(acc)
	acc = JSON.parse(acc)
		console.log(!fs.existsSync("acc/"+acc[0]+".txt"))
		if(!fs.existsSync("acc/"+acc[0]+".txt")){
			console.log("writing")
			fs.writeFile("acc/"+acc[0]+".txt",JSON.stringify(new useacc(acc)),function(){
				sock.emit("newAccount","no error")
				return "account created"
			})
			
		}else{
			return "username taken"
		}
}

function login(log,sock){
	fs.readFile("acc/"+log[0]+".txt",function(er,data){
		console.log(data)
		account = JSON.parse(data)
		if(log[1] === account.id[1]){
			console.log("verified")
			sock.emit("attempt login",account)
		}
		else{
			console.log("wrong password")
			sock.emit("attempt login","wrong password")
		}
	})
}


function newGame(sock,logVs){
	fs.readFile("acc/"+logVs[0][0]+".txt",function(er,data){
		account = JSON.parse(data)
		console.log(account.id)
		console.log(logVs[0])
		if(account.id[1] == logVs[0][1]){
			account.board.push(resetString)
			account.vs.push(logVs[1])
			account.boardNum++
			fs.writeFile("acc/"+account.id[0]+".txt",JSON.stringify(account))
			sock.emit("vsAdded","check")
		}
	})
}
//login(["qwe","ewsq"])
//writeNewAccount(["user","pass"])
//writeNewAccount(["jack","pass"])


app.get("/",function(req,resp){
	resp.sendfile("index.html")
})

app.get("/chessPieces.jpg",function(req,resp){
	resp.sendfile("chessPieces.jpg")
})

app.get("/signin.html",function(req,resp){
	resp.sendfile("signin.html")
})

//socket
io.sockets.on("connection",function(socket){

	socket.on("jack",function(data){
		console.log("new player connected")
	})
	socket.on("newacc",function(data){
		//console.log(socket)
		if(writeNewAccount(JSON.parse(data),socket)=="username taken")socket.emit("newAccount","username taken")
	})

	socket.on("login",function(data){
		//console.log(data.id)
		login(JSON.parse(data),socket)
	})

	socket.on("writeAccount",function(data){
		fs.writeFile("acc/"+data.id[0]+".txt",JSON.stringify(data))
	})

	socket.on("newGame",function(data){
		console.log(data[1])
		newGame(socket,data)
	})
})