import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();


const boardRows = 3;
const boardColumns = 3;


function Square(props) {
    return (
        <button
            style = {props.style}
            className="square"
            onClick={() => props.onClick()}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {
    renderSquare(i) {
        let styleColor = {backgroundColor: "white"};

        if (this.props.winningPositions) {
            if (this.props.winningPositions.includes(i)) {
                styleColor = {backgroundColor: "cyan"}
            }
        }


        return (
            <Square
                style={styleColor}
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    CreateBoard() {
        let boardParts = [];

        for (let y = 0; y < boardColumns; y++) {
            let rowParts = [];
            let columnMultiplier = boardRows*y;
            for (let i = 0; i < boardRows; i++) {
                rowParts.push(this.renderSquare(columnMultiplier + i));
            }
            boardParts.push(<div className="board-row" id={"board-row-" + y}>{rowParts}</div>);
        }
        return boardParts;
    }


    render() {
        return (
            <div>
                {this.CreateBoard()}

                {/*
                // Automated with CreateBoard
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
                */}

            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null)
            }],
            stepNumber: 0,
            XIsNext: true,
            descendingOrder: true
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        //Ignore entries if the square is already used or the game has been won
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        squares[i] = this.state.XIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares
            }]),
            stepNumber: history.length,
            XIsNext: !this.state.XIsNext
        });
    }

    jumpTo(step) {
        this.setState({
           stepNumber: step,
           XIsNext: (step % 2) === 0,
        });
    }


    actionAtMove(history, move) {
        let formattedResult;
        const currentMove = history[move].squares;
        let index;
        let position;

        if (move < 2) {
            index = currentMove.length;
            // noinspection StatementWithEmptyBodyJS
            while (index-- && !currentMove[index]);
            position = calculateGridPosition(index);
            formattedResult = currentMove[index] + " at " + position[0] + ' : ' + position[1];

        } else {
            index = currentMove.length;
            const lastMove = move - 1;
            const previousMove = history[lastMove].squares;
            // noinspection StatementWithEmptyBodyJS
            while (index-- && currentMove[index] === previousMove[index]);
            position = calculateGridPosition(index);
            formattedResult = currentMove[index] + " at " + position[0] + ' : ' + position[1];
        }

        return formattedResult;
    }

    moveReversal() {
        let desc = !this.state.descendingOrder ? "Descending Order" : "Ascending Order";

        return (
            <button onClick={() => this.setState({descendingOrder: !this.state.descendingOrder})}>{desc}</button>
        );
    }


    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);


        const moves = history.map((step, move) => {
            const displayMove = this.actionAtMove(history, move);

            const desc = (move) => {
                let result;
                let strong = [];

                if (move) {
                    result = 'Go to move #' + move + ' (' + displayMove + ')';
                } else {
                    result = 'Go to game start';
                }
                if (move === this.state.stepNumber) {
                    strong.push (<strong>{result}</strong>);
                    result = strong;
                }
                return result;
            };

            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc(move)}</button>
                </li>
            );
        });

        if (!this.state.descendingOrder) {
          moves.reverse(); //Does this need a splice?
        }

        let status;
        let winningPositions;
        if (winner) {
            winningPositions = winner.slice(1);
            status = 'Winner: ' + winner[0];
        } else if (this.state.stepNumber === (boardColumns * boardRows)) {
            status = 'Draw'
        } else {
            status = 'Next player: ' + (this.state.XIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        winningPositions = {winningPositions}
                        squares = {current.squares}
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>{this.moveReversal()}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);




/*
Helper function to figure out grid position
@return array with row position at 0 and column position at index 1
 */
function calculateGridPosition(number) {
    let position = [];
    let row = Math.ceil((number + 1) / boardColumns);
    position.push(row);
    let column = (number + 1) % boardColumns;
    if (column === 0) {column = boardColumns} //TODO: fix column display (there must be a more elegant way than this)
    position.push(column);
    return position;
}




// Helper function to determine winner
// Returns array, with winner mark on index 0 and the three winning positions at 1-3
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {

            let winnerResults = lines[i];
            winnerResults.unshift(squares[a]);

            //TODO: Do with state
            return winnerResults;
        }
    }
    return null;
}

