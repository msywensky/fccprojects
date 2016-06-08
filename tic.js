
class Tic {
	
	constructor(playerPiece,cpuPiece) {
		this.gameTimeout = 3000;
		this.playerPiece = playerPiece;
		this.cpuPiece = cpuPiece;
		this.moves = [];
		//this.PromptPiece();
	}
	
	CPUMove() {
		var move = this.getCPUMove();
		if (move) {
			if (this.PlacePieceCheckWinner(this.cpuPiece,move[0],move[1]) != null) {
				this.CPUWinMessage();
				return;
			} 
			
			if (!this.MoveAvailable()) {
				this.StalemateMessage();
			}	
		} else {
			//should never happen
			this.StalemateMessage();
		}
	}
	
	getCPUMove() {
		
		let tBoard;// = this.boardCopy(this.board);
		let bestScore=-1000;
		let tScore=0;
		let bestMove = null;
		
		if (this.moves.length == 0) {
			return [Math.floor(Math.random() * 2), Math.floor(Math.random() * 2)];
		}
		for (let x=0;x<3;x++) {
			for (let y=0;y<3;y++) {
				if (this.isSquareEmpty(x,y,tBoard)) {
 					tBoard = this.boardCopy(this.board);
					this.PlacePiece(this.cpuPiece,x,y,tBoard);
					tScore = this.getMoveScore(x,y,tBoard,true,1);
					this.debugShowScore(x,y,tScore);
					
					if (tScore > bestScore) {
						bestScore = tScore;
						bestMove = [x,y];
					}
				}
			}
		}
		this.debugShowBoard(bestMove[0],bestMove[1],this.board,true,1,bestScore);
		return bestMove;
	}
	
	debugShowScore(x,y,score) {
		console.log("move " + x + "," + y + " was scored " + score);
	}
	
	debugShowBoard(x,y,board,cpuTurn,level, score) {
		console.log(x + "," + y, " score:" + score);
		console.log(JSON.stringify(board[0]));
		console.log(JSON.stringify(board[1]));
		console.log(JSON.stringify(board[2]));
	}
	
	getMoveScore(x,y,tBoard,cpuTurn,level) {
		let bestScore = 100;
		let tScore = 0;
		let winningPiece = this.CheckWinner(tBoard);
		let tPiece = this.playerPiece;
		let currentBoard = tBoard;
		
		if (winningPiece === this.cpuPiece) {
			return 10 - level;
		} else if(winningPiece === this.playerPiece) {
			return level - 10;
		}
		cpuTurn = !cpuTurn;
		if (cpuTurn) {
			tPiece = this.cpuPiece;
			bestScore = -100;
		}
		for (let x2=0;x2<3;x2++) {
			for (let y2=0;y2<3;y2++) {
				if (this.isSquareEmpty(x2,y2,tBoard)) {
 					tBoard = this.boardCopy(currentBoard);
					this.PlacePiece(tPiece,x2,y2,tBoard);
					tScore = this.getMoveScore(x2,y2,tBoard,cpuTurn,level+1);
					
					if ( (cpuTurn && (tScore > bestScore)) ||
						(!cpuTurn && (tScore < bestScore)) ) {
						bestScore = tScore;
					}
					
				}
			}
		}
		return bestScore;
	}
	
	boardCopy(board) {
		let bCopy = [];
		bCopy[0] = board[0].slice();
		bCopy[1] = board[1].slice();
		bCopy[2] = board[2].slice();
		return bCopy;
	}
	
	PlayerMove(x,y) {
		if (!this.isSquareEmpty(x,y)) {
			console.log("move " + x + "," + y + " is invalid");
			return false;
		}
		if (this.PlacePieceCheckWinner(this.playerPiece, x, y) != null) {
			this.PlayerWinMessage();
			return true;
		}
		if (this.MoveAvailable()) {
			this.CPUMove();
			return true;
		} else {
			this.StalemateMessage();
			return true;
		}
	}
	
	PlayerWinMessage() {
		if (this.PlayerWinCallback) {
			this.PlayerWinCallback();
		}
	}
	
	StalemateMessage() {
		if (this.StalemateCallback) {
			this.StalemateCallback();
		}
	}
	
	CPUWinMessage() {
		if (this.CPUWinCallback) {
			this.CPUWinCallback();
		}
	}
	
	MoveAvailable() {
		for (let x=0;x<3;x++) {
			for (let y=0;y<3;y++) {
				if (this.isSquareEmpty(x,y)) {
					return true;
				}
			}
		}
		return false;
	}
	
	StartGame() {
		this.board = [['1','2','3'],['4','5','6'],['7','8','9']];
		this.moves = [];
		//this.ClearSquares();
		this.CPUMove();
	}
	
	
	PlacePiece(piece, x, y, tBoard) {
		if (tBoard === undefined) {
			tBoard = this.board;
		}
		if (this.isSquareEmpty(x,y,tBoard)) {
			tBoard[x][y] = piece;
			return true;
		} else {
			return false;
		}		
	}

	PlacePieceCheckWinner(piece, x, y) {
		if (this.PlacePiece(piece, x, y)) {
			this.board[x][y] = piece;
			this.moves.push({x:x,y:y,piece:piece});
			this.DrawPieceCallback(piece,x,y);
			return this.CheckWinner();
		} 
		return false;
	}
	
	isSquareEmpty(x,y, tBoard) {
		if (tBoard === undefined) {
			tBoard = this.board;
		}
		return (tBoard[x][y] !== 'X') && (tBoard[x][y] !== 'O');
	}
	
	CheckWinner(b) {
		if (b === undefined) {
			b = this.board;
		}
		for(let x=0;x<3;x++) {
			if ( ( !this.isSquareEmpty(x,0,b)) && (b[x][0] === b[x][1]) && (b[x][1] === b[x][2]) ) {
				return b[x][0];
			}
		}
		
		for(let y=0;y<3;y++) {
			if ( ( !this.isSquareEmpty(0,y,b)) && (b[0][y] === b[1][y]) && (b[1][y] === b[2][y]) ) {
				return b[0][y];
			}
		}
		
		if ( (!this.isSquareEmpty(0,0,b)) && (b[0][0] === b[1][1]) && (b[1][1] === b[2][2]) ) {
				return b[0][0];
		}

		if ( (!this.isSquareEmpty(2,0,b)) && (b[2][0] === b[1][1]) && (b[1][1] === b[0][2]) ) {
				return b[2][0];
		}
		return null;
	}
	
}

var tic;

$(document).ready( function() {

	$("#txtPiece").focus();
	$("#txtPiece").keyup(function(e) {
		console.log(e.keyCode);
		if ( (e.keyCode ==  88) || (e.keyCode == 79) ) {
			var player="O", cpu="X";
			if (e.keyCode == 88) {
				console.log("X selected");
				player="X";
				cpu="O";
			}
			
			$("#board").animate( { "bottom": "+=300px"}, "slow", function() {
				$("#txtPiece").prop("disabled",true);
				tic = initObject(player,cpu);
				$("#txtMove").focus();
			});
		} else {
			//$("#txtPiece").val("");
		}
	});
	
	$("#txtMove").keyup(function(e) {
		let k = e.keyCode;
		if ( (k >= 49) && (k <= 57) ) {
			$("#txtMove").prop("disabled",true);
			let move = k - 48;
			let x = Math.floor((move-1) / 3);
			let y = ((move-1) % 3);
			console.log("Your move is:" + x + "," + y);
			redrawBoard(x,y);
		}
	});
});

function redrawBoard(x,y) {
	$("#board").animate( { "bottom": "+=500px"}, "slow", function() {
		$("#choose").hide(true);
		if (x > -1) {
			if (!tic.PlayerMove(x,y)) {
				$("#divMessage").text("Invalid move");
			} else {
				$("divMessage").text("");
			}
		} else {
			resetBoard();
			
		}
		$("#txtMove").val("");
		$("#txtMove").prop("disabled",false);
		$("#txtMove").focus();
		$("#board").css("bottom","-300px");
		$("#board").animate( { "bottom": "+=300px"}, "slow");
	});
}

function resetBoard() {
	for (var x=0;x<3;x++) {
		for (var y=0;y<3;y++) {
			getSquare(x,y).text( (y+1 + x*3).toString()) ;
		}
	}
	tic.moves.map(function(move) {
		getSquare(move.x,move.y).text(move.piece);
	})
}

function getSquare(x,y) {
	return $('#square' + x + "-" + y);
}

function clearLastMoveClass() {
	for(let x=0;x<3;x++) {
		for (let y=0;y<3;y++) {
			getSquare(x,y).removeClass("lastmove");
		}
	}
}


function newGame() {
	$("#movelog").css("visibility","hidden");
	setTimeout(function() {
		redrawBoard(-1,-1);
		tic.StartGame();
		$("#movelog").css("visibility","");
		$("#divMessage").text("");
	}, 4000);
}

function initObject(player,cpu) {
	let t = new Tic(player,cpu);
	
	t.PlayerWinCallback = function() {
		$("#divMessage").text("You win!!!  That's Impossible!");
		//newGame();
	};
	
	t.StalemateCallback = function() {
		$("#divMessage").text("We tied.  Starting again shortly.");
		newGame();
	};
	
	t.CPUWinCallback = function () {
		$("#divMessage").text("I win!  Starting again shortly.");
		newGame();
	};
	
	t.DrawPieceCallback = function(piece, x, y) {
		clearLastMoveClass();
		console.log("drawpiececallback called " + piece + ": " + x + "," + y);
		getSquare(x,y).text(piece).addClass("lastmove");
	}
	
	t.StartGame();
	return t;
}
