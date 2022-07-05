import React, { useEffect, useState } from 'react'
import PACK_OF_CARDS from '../utils/packOfCards'
import shuffleArray from '../utils/shuffleArray'
import io from 'socket.io-client'
import queryString from 'query-string'
import Spinner from './Spinner'
import VisaoPlayer from '../pageComponents/visaoPlayer'
import useSound from 'use-sound'
import devunoWhite from '../assets/devuno/devuno_logo_white.png'

import bgMusic from '../assets/sounds/game-bg-music.mp3'
import unoSound from '../assets/sounds/uno-sound.mp3'
import shufflingSound from '../assets/sounds/shuffling-cards-1.mp3'
import skipCardSound from '../assets/sounds/skip-sound.mp3'
import draw2CardSound from '../assets/sounds/draw2-sound.mp3'
import wildCardSound from '../assets/sounds/wild-sound.mp3'
import draw4CardSound from '../assets/sounds/draw4-sound.mp3'
import gameOverSound from '../assets/sounds/game-over-sound.mp3'
import useWhileCard from '../customHooks/useWhileCard'
import { waitFor } from '@testing-library/react'

//NUMBER CODES FOR ACTION CARDS
//SKIP - 404
//DRAW 2 - 252
//WILD - 300
//DRAW 4 WILD - 600
//WHILECARD - 100
//BREAK - 101
//PASS - 102
//JOKER - 700

let socket
// const ENDPOINT = 'http://localhost:5000'
const ENDPOINT = 'http://localhost:5000'

const Game = (props) => {
    const [lastNumber, setLastNumber] = useState('')
    const [isWhileCardOnPile, setIsWhileCardOnPile] = useState('')

    const data = queryString.parse(props.location.search)

    //initialize socket state
    const [room, setRoom] = useState(data.roomCode)
    const [roomFull, setRoomFull] = useState(false)
    const [users, setUsers] = useState([])
    const [currentUser, setCurrentUser] = useState('')
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([])

    useEffect(() => {
        const connectionOptions =  {
            "forceNew" : true,
            "reconnectionAttempts": "Infinity", 
            "timeout" : 10000,                  
            "transports" : ["websocket"]
        }
        socket = io.connect(ENDPOINT, connectionOptions)

        socket.emit('join', {room: room}, (error) => {
            if(error)
                setRoomFull(true)
        })

        //cleanup on component unmount
        return function cleanup() {
            socket.emit('disconnect')
            //shut down connnection instance
            socket.off()
        }
    }, [])



    //initialize game state
    const [gameOver, setGameOver] = useState(true)
    const [winner, setWinner] = useState('')
    const [turn, setTurn] = useState('')
    const [player1Deck, setPlayer1Deck] = useState([])
    const [player2Deck, setPlayer2Deck] = useState([])
    const [currentColor, setCurrentColor] = useState('')
    const [currentNumber, setCurrentNumber] = useState('')
    const [playedCardsPile, setPlayedCardsPile] = useState([])
    const [drawCardPile, setDrawCardPile] = useState([])

    const [isChatBoxHidden, setChatBoxHidden] = useState(true)
    const [isUnoButtonPressed, setUnoButtonPressed] = useState(false)
    const [isSoundMuted, setSoundMuted] = useState(false)
    const [isMusicMuted, setMusicMuted] = useState(true)

    const [playBBgMusic, { pause }] = useSound(bgMusic, { loop: true })
    const [playUnoSound] = useSound(unoSound)
    const [playShufflingSound] = useSound(shufflingSound)
    const [playSkipCardSound] = useSound(skipCardSound)
    const [playDraw2CardSound] = useSound(draw2CardSound)
    const [playWildCardSound] = useSound(wildCardSound)
    const [playDraw4CardSound] = useSound(draw4CardSound)
    const [playGameOverSound] = useSound(gameOverSound)

    //runs once on component mount
    useEffect(() => {
        //shuffle PACK_OF_CARDS array
        const shuffledCards = shuffleArray(PACK_OF_CARDS)

        //extract first 7 elements to player1Deck
        const player1Deck = shuffledCards.splice(0, 7)

        //extract first 7 elements to player2Deck
        const player2Deck = shuffledCards.splice(0, 7)

        //extract random card from shuffledCards and check if its not an action card
        let startingCardIndex
        while(true) {
            startingCardIndex = Math.floor(Math.random() * 94)
            if(shuffledCards[startingCardIndex]==='skipR' || shuffledCards[startingCardIndex]==='_R'      || shuffledCards[startingCardIndex]==='D2R' ||
            shuffledCards[startingCardIndex]==='skipG'    || shuffledCards[startingCardIndex]==='_G'      || shuffledCards[startingCardIndex]==='D2G' ||
            shuffledCards[startingCardIndex]==='skipB'    || shuffledCards[startingCardIndex]==='_B'      || shuffledCards[startingCardIndex]==='D2B' ||
            shuffledCards[startingCardIndex]==='skipY'    || shuffledCards[startingCardIndex]==='_Y'      || shuffledCards[startingCardIndex]==='D2Y' ||
            shuffledCards[startingCardIndex]==='W'        || shuffledCards[startingCardIndex]==='D4W'     ||
            shuffledCards[startingCardIndex]==='WHILE_R'  || shuffledCards[startingCardIndex]==='WHILE_G' || 
            shuffledCards[startingCardIndex]==='WHILE_B'  || shuffledCards[startingCardIndex]==='WHILE_Y' ||
            shuffledCards[startingCardIndex]==='BREAK_R'  || shuffledCards[startingCardIndex]==='BREAK_G' || 
            shuffledCards[startingCardIndex]==='BREAK_B'  || shuffledCards[startingCardIndex]==='BREAK_Y' ||
            shuffledCards[startingCardIndex]==='PASS_R'   || shuffledCards[startingCardIndex]==='PASS_G'  || 
            shuffledCards[startingCardIndex]==='PASS_B'   || shuffledCards[startingCardIndex]==='PASS_Y'  ||
            shuffledCards[startingCardIndex]==='JOKER_W'
            
            ) {
                continue;
            }
            else
                break;
        }

        //extract the card from that startingCardIndex into the playedCardsPile
        const playedCardsPile = shuffledCards.splice(startingCardIndex, 1)

        //store all remaining cards into drawCardPile
        const drawCardPile = shuffledCards

        //send initial state to server
        socket.emit('initGameState', {
            gameOver: false,
            turn: 'Player 1',
            player1Deck: [...player1Deck],
            player2Deck: [...player2Deck],
            currentColor: playedCardsPile[0].charAt([playedCardsPile[0].length - 1]),
            currentNumber: playedCardsPile[0].charAt(0),
            playedCardsPile: [...playedCardsPile],
            drawCardPile: [...drawCardPile],
            lastNumber: playedCardsPile[0].charAt(0),
            isWhileCardOnPile: false
        })
    }, [])

    useEffect(() => {

        socket.on('initGameState', ({ gameOver, turn, player1Deck, player2Deck, currentColor, currentNumber, playedCardsPile, drawCardPile, lastNumber, isWhileCardOnPile }) => {
            setGameOver(gameOver)
            setTurn(turn)
            setPlayer1Deck(player1Deck)
            setPlayer2Deck(player2Deck)
            setCurrentColor(currentColor)
            setCurrentNumber(currentNumber)
            setPlayedCardsPile(playedCardsPile)
            setDrawCardPile(drawCardPile)
            setLastNumber(lastNumber)
            setIsWhileCardOnPile(isWhileCardOnPile)

        })

        socket.on('updateGameState', ({ gameOver, winner, turn, player1Deck, player2Deck, currentColor, currentNumber, playedCardsPile, drawCardPile, lastNumber, isWhileCardOnPile = false}) => {
            console.log("drawnCardPile: ",drawCardPile)
            const booleanWhieldCard = isWhileCardOnPile !== undefined ? isWhileCardOnPile : false

            gameOver && setGameOver(gameOver)
            gameOver===true && playGameOverSound()
            winner && setWinner(winner)
            turn && setTurn(turn)
            player1Deck && setPlayer1Deck(player1Deck)
            player2Deck && setPlayer2Deck(player2Deck)
            currentColor && setCurrentColor(currentColor)
            currentNumber && setCurrentNumber(currentNumber)
            playedCardsPile && setPlayedCardsPile(playedCardsPile)
            drawCardPile && setDrawCardPile(drawCardPile)
            lastNumber && setLastNumber(lastNumber)
            isWhileCardOnPile && setIsWhileCardOnPile(isWhileCardOnPile)
            console.log("Current number update: ",currentNumber)
            console.log("Last number conf update: ",lastNumber)
            console.log('isWhileCardOnPile update: ', isWhileCardOnPile)
            setUnoButtonPressed(false)
        })

        socket.on("roomData", ({ users }) => {
            setUsers(users)
        })

        socket.on('currentUserData', ({ name }) => {
            setCurrentUser(name)
        })

        socket.on('message', message => {
            setMessages(messages => [ ...messages, message ])

            const chatBody = document.querySelector('.chat-body')
            chatBody.scrollTop = chatBody.scrollHeight
        })
    }, [])

    return (
        <div className={`Game backgroundColorR backgroundColor${currentColor}`}>
            {(!roomFull) ? <>

                <div className='topInfo'>
                    <img className='topInfoImg' src={devunoWhite} />
                    <h1>Game Code: {room}</h1>
                    <span>
                        <button className='game-button-sound' onClick={() => setSoundMuted(!isSoundMuted)}>{isSoundMuted ? <span className="material-icons">volume_off</span> : <span className="material-icons">volume_up</span>}</button>
                        <button className='game-button-sound' onClick={() => {
                            if(isMusicMuted)
                                playBBgMusic()
                            else
                                pause()
                            setMusicMuted(!isMusicMuted)
                        }}>{isMusicMuted ? <span className="material-icons">music_off</span> : <span className="material-icons">music_note</span>}</button>
                    </span>
                </div>

                {/* PLAYER LEFT MESSAGES */}
                {users.length===1 && currentUser === 'Player 2' && <h1 className='topInfoText'>Player 1 has left the game.</h1> }
                {users.length===1 && currentUser === 'Player 1' && <h1 className='topInfoText'>Waiting for Player 2 to join the game.</h1> }

                {users.length===2 && <>

                    {gameOver ? <div>{winner !== '' && <><h1>GAME OVER</h1><h2>{winner} wins!</h2></>}</div> :
                    <div>
                        {/* PLAYER 1 VIEW */}
                        {currentUser === 'Player 1' && <>  

                       { <VisaoPlayer  player='Player 1'
                                        turn={turn }
                                        currentColor={currentColor}
                                        player1Deck={player1Deck}
                                        player2Deck={player2Deck}
                                        drawCardPile={drawCardPile}
                                        isSoundMuted={isSoundMuted}
                                        playShufflingSound={playShufflingSound}
                                        playedCardsPile={playedCardsPile}
                                        currentNumber={currentNumber}
                                        playSkipCardSound={playSkipCardSound}
                                        playDraw2CardSound={playDraw2CardSound}
                                        playWildCardSound={playWildCardSound}
                                        playDraw4CardSound={playDraw4CardSound}
                                        //onCardDrawnHandler={onCardDrawnHandler}
                                        socket={socket}
                                        message={message}
                                        messages={messages}
                                        setMessage={setMessage}
                                        setMessages={setMessages}
                                        lastNumber={lastNumber}
                                        isWhileCardOnPile={isWhileCardOnPile}

                        />}
                        </>
                        }

                        {/* PLAYER 2 VIEW */}
                        {currentUser === 'Player 2' && <>

                                  <VisaoPlayer  player='Player 2'
                                        turn={turn }
                                        currentColor={currentColor}
                                        player1Deck={player1Deck}
                                        player2Deck={player2Deck}
                                        drawCardPile={drawCardPile}
                                        isSoundMuted={isSoundMuted}
                                        playShufflingSound={playShufflingSound}
                                        playedCardsPile={playedCardsPile}
                                        currentNumber={currentNumber}
                                        playSkipCardSound={playSkipCardSound}
                                        playDraw2CardSound={playDraw2CardSound}
                                        playWildCardSound={playWildCardSound}
                                        playDraw4CardSound={playDraw4CardSound}
                                        //onCardDrawnHandler={onCardDrawnHandler}
                                        socket={socket}
                                        message={message}
                                        messages={messages}
                                        setMessage={setMessage}
                                        setMessages={setMessages}
                                        lastNumber={lastNumber}
                                        isWhileCardOnPile={isWhileCardOnPile}
                                />
                        </> }
                    </div> }
                </> }
            </> : <h1>Room full</h1> }

            <br />
            <a href='/'><button className="game-button-quit">QUIT</button></a>
        </div>
    )
}

export default Game