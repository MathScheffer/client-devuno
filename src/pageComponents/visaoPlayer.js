import React, { useEffect, useState } from 'react'
import useSound from 'use-sound'
import unoSound from '../assets/sounds/uno-sound.mp3'

import Spinner from '../components/Spinner'
import useWhileCard from '../customHooks/useWhileCard'


const VisaoPlayer = ({
    player,
    turn,
    currentColor,
    player1Deck,
    player2Deck,
    drawCardPile,
    isSoundMuted,
    playShufflingSound,
    playedCardsPile,
    currentNumber,
    playSkipCardSound,
    playDraw2CardSound,
    playWildCardSound,
    playDraw4CardSound,
    //onCardDrawnHandler,
    socket,
//transferir para o componente
    message,messages,setMessage,setMessages,
    lastNumber,
    isWhileCardOnPile
}) => {

    const [isUnoButtonPressed, setUnoButtonPressed] = useState(false)
    const [playUnoSound] = useSound(unoSound)
    const [isChatBoxHidden, setChatBoxHidden] = useState(true)

    const onCardPlayedHandler = (played_card) => { 
        //extract player who played the card
        const cardPlayedBy = turn
        switch(played_card) {
            //if card played was a number card
            case '0R': case '1R': case '2R': case '3R': case '4R': case '5R': case '6R': case '7R': case '8R': case '9R': case '_R': case '0G': case '1G': case '2G': case '3G': case '4G': case '5G': case '6G': case '7G': case '8G': case '9G': case '_G': case '0B': case '1B': case '2B': case '3B': case '4B': case '5B': case '6B': case '7B': case '8B': case '9B': case '_B': case '0Y': case '1Y': case '2Y': case '3Y': case '4Y': case '5Y': case '6Y': case '7Y': case '8Y': case '9Y': case '_Y': {
                //extract number and color of played card
                const numberOfPlayedCard = played_card.charAt(0)
                const colorOfPlayedCard = played_card.charAt(1)
                if(currentNumber == 100){
                    if(cardPlayedBy == 'Player 1'){
                       whileCardLoop('Player 1',played_card,numberOfPlayedCard)
                    }else{
                        whileCardLoop('Player 2', played_card, numberOfPlayedCard)
                    }
                    
                }else if(currentColor === colorOfPlayedCard) {
                    //check who played the card and return new state accordingly
                    if(cardPlayedBy === 'Player 1') {
                        if(player1Deck.length===2 && !isUnoButtonPressed) {
                            forgotUno('Player 1','Player 2',played_card,colorOfPlayedCard,numberOfPlayedCard)
                        }
                        else {
                            !isSoundMuted && playShufflingSound()

                            const removeIndex = player1Deck.indexOf(played_card)
                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]

                            socketEmitUpdateGameState('Player 1', 'Player 2',
                                played_card,updatedPlayer1Deck, 
                                colorOfPlayedCard,numberOfPlayedCard)
                        }
                    }
                    else {
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        //then update turn, currentColor and currentNumber
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if(player2Deck.length===2 && !isUnoButtonPressed) {

                            forgotUno("player2","Player 1",played_card,colorOfPlayedCard,numberOfPlayedCard)
                        }
                        else {
                            !isSoundMuted && playShufflingSound()
                            //send new state to server
                            const removeIndex = player2Deck.indexOf(played_card)
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)];
                            socketEmitUpdateGameState('Player 2',
                            'Player 1',
                             played_card, updatedPlayer2Deck,colorOfPlayedCard,
                              numberOfPlayedCard)
                             
                        }
                    }
                }
                //check for number match
                else if(currentNumber === numberOfPlayedCard) {
                    //check who played the card and return new state accordingly
                    if(cardPlayedBy === 'Player 1') {
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        //then update turn, currentColor and currentNumber
                        const removeIndex = player1Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty

                        if(player1Deck.length===2 && !isUnoButtonPressed) {

                            forgotUno("Player 1","Player 2",played_card,colorOfPlayedCard,numberOfPlayedCard)
                        }
                        else {
                            !isSoundMuted && playShufflingSound()

                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            socketEmitUpdateGameState("Player 1","Player 2",played_card,
                                updatedPlayer1Deck,colorOfPlayedCard,numberOfPlayedCard)
                        }
                    }
                    else {
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        //then update turn, currentColor and currentNumber
                        const removeIndex = player2Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if(player2Deck.length===2 && !isUnoButtonPressed) {

                            forgotUno("Player 2","Player 1",played_card,colorOfPlayedCard,numberOfPlayedCard)
                        }
                        else {
                            !isSoundMuted && playShufflingSound()

                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            socketEmitUpdateGameState("Player 2","Player 1",played_card
                                ,updatedPlayer2Deck,colorOfPlayedCard,numberOfPlayedCard)
                        }
                    }
                }
                //if no color or number match, invalid move - do not update state
                else {
                    alert('Invalid Move!')
                }
                break;
            }
            //if card played was a skip card
            case 'skipR': case 'skipG': case 'skipB': case 'skipY': {
                //extract color of played skip card
                const colorOfPlayedCard = played_card.charAt(4)
                //check for color match
                if(currentNumber == 100){
                    if(cardPlayedBy == 'Player 1'){
                       whileCardLoop('Player 1', played_card,404)
                    }else{
                        whileCardLoop('Player 2', played_card,404)
                    }
                    
                }
                else if(currentColor === colorOfPlayedCard) {
                    //check who played the card and return new state accordingly
                    if(cardPlayedBy === 'Player 1') {
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        //then update currentColor and currentNumber
                        const removeIndex = player1Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if(player1Deck.length===2 && !isUnoButtonPressed) {

                            forgotUno("Player 1","Player 1",played_card,colorOfPlayedCard,404)
                        }
                        else {
                            !isSoundMuted && playSkipCardSound()

                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            socketEmitUpdateGameState("Player 1","Player 1",played_card,updatedPlayer1Deck,
                                colorOfPlayedCard,404)
                        }

                    }
                    else {
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        //then update currentColor and currentNumber
                        const removeIndex = player2Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if(player2Deck.length===2 && !isUnoButtonPressed) {

                            forgotUno('Player 2','Player 2',played_card,colorOfPlayedCard,404)
                        }
                        else {
                            !isSoundMuted && playSkipCardSound()

                            const removeIndex = player2Deck.indexOf(played_card)
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            socketEmitUpdateGameState('Player 2','Player 2',played_card,
                                updatedPlayer2Deck,colorOfPlayedCard,404)
                        }
                    }
                }
                //check for number match - if skip card played on skip card
                else if(currentNumber === 404) {
                    //check who played the card and return new state accordingly
                    if(cardPlayedBy === 'Player 1') {
                        //remove the played card from player1's deck and add it to playedCardsPile (immutably)
                        //then update currentColor and currentNumber - turn will remain same
                        const removeIndex = player1Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if(player1Deck.length===2 && !isUnoButtonPressed) {

                            forgotUno('Player 1','Player 1',played_card,colorOfPlayedCard,404)
                        }
                        else {
                            !isSoundMuted && playSkipCardSound()

                            const removeIndex = player1Deck.indexOf(played_card)
                            const updatedPlayer1Deck = [...player1Deck.slice(0, removeIndex), ...player1Deck.slice(removeIndex + 1)]
                            socketEmitUpdateGameState('Player 1','Player 1',played_card,
                                updatedPlayer1Deck,colorOfPlayedCard,404)
                        }
                    }
                    else {
                        //remove the played card from player2's deck and add it to playedCardsPile (immutably)
                        //then update currentColor and currentNumber - turn will remain same
                        const removeIndex = player2Deck.indexOf(played_card)
                        //if two cards remaining check if player pressed UNO button
                        //if not pressed add 2 cards as penalty
                        if(player2Deck.length===2 && !isUnoButtonPressed) {
                            forgotUno('Player 2','Player 2',played_card,colorOfPlayedCard,404)
                        }
                        else {
                            !isSoundMuted && playSkipCardSound()

                            const removeIndex = player2Deck.indexOf(played_card)
                            const updatedPlayer2Deck = [...player2Deck.slice(0, removeIndex), ...player2Deck.slice(removeIndex + 1)]
                            socketEmitUpdateGameState('Player 2','Player 2',played_card,
                                updatedPlayer2Deck,colorOfPlayedCard, 404)
                        }
                    }
                }
                //if no color or number match, invalid move - do not update state
                else {
                    alert('Invalid Move!')
                }
                break;
            }
            //if card played was a draw 2 card
            case 'D2R': case 'D2G': case 'D2B': case 'D2Y': {
                //extract color of played skip card
                const colorOfPlayedCard = played_card.charAt(2)
                //check for color match
                if(currentNumber == 100){
                    if(cardPlayedBy == 'Player 1'){
                       whileCardLoop('Player 1', played_card, 252 )
                    }else{
                        whileCardLoop('Player 2',played_card, 252)
                    }
                }
                else if(currentColor === colorOfPlayedCard) {
                    //check who played the card and return new state accordingly
                    if(cardPlayedBy === 'Player 1') {
                        const forgotPressUno = player1Deck.length===2 && !isUnoButtonPressed
                        drag2("Player 1",played_card,colorOfPlayedCard,"Player 2", forgotPressUno)
                    }
                    else {
                        const forgotPressUno = player2Deck.length===2 && !isUnoButtonPressed
                        drag2("Player 2",played_card,colorOfPlayedCard,"Player 1", forgotPressUno)
                    }
                }
                //check for number match - if draw 2 card played on draw 2 card
                else if(currentNumber === 252) {
                    //check who played the card and return new state accordingly
                    if(cardPlayedBy === 'Player 1') {

                        const forgotPressUno = player1Deck.length===2 && !isUnoButtonPressed
                        drag2("Player 1",played_card,colorOfPlayedCard,"Player 2", forgotPressUno)
                    }
                    else {

                        const forgotPressUno = player2Deck.length===2 && !isUnoButtonPressed
                        drag2("Player 2",played_card,colorOfPlayedCard,"Player 1", forgotPressUno)
                    }
                }
                //if no color or number match, invalid move - do not update state
                else {
                    alert('Invalid Move!')
                }
                break;
            }
            //if card played was a wild card
            case 'W': {
                //check who played the card and return new state accordingly
                if(currentNumber == 100){
                    if(cardPlayedBy == 'Player 1'){
                       whileCardLoop('Player 1',played_card,300)
                    }else{
                        whileCardLoop('Player 2', played_card, 300)
                    }
                    
                }
                else{
                    if(cardPlayedBy === 'Player 1') {
                        wildCard('Player 1','Player 2',played_card,
                         player1Deck.length===2 && !isUnoButtonPressed)
    
                    }
                    else {
                        wildCard('Player 2','Player 1',played_card,
                        player2Deck.length===2 && !isUnoButtonPressed)
                    }
                }
                
                break;
            }
            case 'WHILE_R': case 'WHILE_G': case 'WHILE_B': case 'WHILE_Y': {
                const colorOfPlayedCard = played_card.charAt(played_card.length-1)
                if(currentNumber == 100){
                    if(cardPlayedBy == 'Player 1'){
                       whileCardLoop('Player 1',played_card, 100)
                    }else{
                        whileCardLoop('Player 2',played_card,100)
                    }
                    
                }
                else if(currentColor === colorOfPlayedCard){
                    if(cardPlayedBy === 'Player 1'){
                        whileCard('Player 1','Player 2',played_card,colorOfPlayedCard,
                        player1Deck.length===2 && !isUnoButtonPressed)
                    }else{
                        whileCard("Player 2",'Player 1',played_card, colorOfPlayedCard,
                            player1Deck.length===2 && !isUnoButtonPressed)
                    }
                }else{
                    alert('Invalid Move!')
                }

                break;
            }
            case 'BREAK_R': case 'BREAK_G': case 'BREAK_B': case 'BREAK_Y':{
                if(cardPlayedBy === 'Player 1'){
                    breakCard('Player 1',turn,played_card)
                }else{
                    breakCard('Player 2',turn,played_card)
                }
                break;
            }
            case 'PASS_R': case 'PASS_G': case 'PASS_B': case 'PASS_Y':{
                if(cardPlayedBy === 'Player 1'){
                    pass('Player 1',turn,played_card)
                }else{
                    pass('Player 2',turn,played_card)
                }
                break;
            }
            case 'JOKER_W': {
                if(cardPlayedBy === 'Player 1'){
                    jokerCard('Player 1')
                }else{
                    jokerCard('Player 2')
                }
                break;
            }
            //if card played was a draw four wild card
            case 'D4W': {
                //check who played the card and return new state accordingly
                if(currentNumber == 100){
                    if(cardPlayedBy == 'Player 1'){
                       whileCardLoop('Player 1', played_card,600)
                    }else{
                        whileCardLoop('Player 2', played_card, 600)
                    }
                    
                }else if(cardPlayedBy === 'Player 1') {
                    drag4('Player 1',played_card,'Player 2',player1Deck.length===2 && !isUnoButtonPressed)
                }
                else {
                    drag4('Player 2',played_card,'Player 1',player1Deck.length===2 && !isUnoButtonPressed)
                }
            }
            break;
        }
    }

    const drag2 = (player,played_card,colorOfPlayedCard,opponent,isForgotUno=false) => {
        const nextTurn = player == 'Player 1' ? 'Player 2' : 'Player 1'

        const playerDeck = player == 'Player 1' ? player1Deck : player2Deck
        
        let opponentDeck = opponent == 'Player 1' ? player1Deck : player2Deck

        const modifiedDeck = [...drawCardPile]

        const opponentDrawCard1 = modifiedDeck.pop()
        const opponentDrawCard2 = modifiedDeck.pop()

        opponentDeck = [...opponentDeck.slice(0, opponentDeck.length), opponentDrawCard1, opponentDrawCard2, ...opponentDeck.slice(opponentDeck.length)]

        if(isForgotUno){
            forgotUno(player,nextTurn,played_card,colorOfPlayedCard,252,
                opponentDeck,modifiedDeck)
        }else{
            const removeIndex = playerDeck.indexOf(played_card);
            const updatedPlayerDeck = 
                [...playerDeck.slice(0,removeIndex), ...playerDeck.slice(removeIndex+1)]

            socketEmitUpdateGameState(player,nextTurn,played_card,updatedPlayerDeck,
                colorOfPlayedCard,252,modifiedDeck,opponentDeck)
        }
    }

    const drag4 = (player,played_card,opponent,isForgotUno=false) => {
        const newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
        const playerDeck = player == 'Player 1' ? player1Deck : player2Deck
        let opponentDeck = opponent == 'Player 1' ? player1Deck : player2Deck

        const modifiedDeck = [...drawCardPile]
        //VERIFICAR POSSIBILIDADE DE BUG SE HOUVER MENOS DE 4 CARTAS A SEREM TIRADAS
        const opponentDrawCard1 = modifiedDeck.pop()
        const opponentDrawCard2 = modifiedDeck.pop()
        const opponentDrawCard3 = modifiedDeck.pop()
        const opponentDrawCard4 = modifiedDeck.pop()      

        opponentDeck = [...opponentDeck.slice(0, opponentDeck.length), opponentDrawCard1, opponentDrawCard2,opponentDrawCard3,opponentDrawCard4, ...opponentDeck.slice(opponentDeck.length)]

        if(isForgotUno){
            forgotUno(player,player,played_card,newColor,600,
                opponentDeck,modifiedDeck)
        }else{
            
            const removeIndex = playerDeck.indexOf(played_card)
            const updatedPlayerDeck = 
                [...playerDeck.slice(0,removeIndex), ...playerDeck.slice(removeIndex+1)]
               

            socketEmitUpdateGameState(player,player,played_card,updatedPlayerDeck,
                newColor,600,modifiedDeck,opponentDeck)
        }
    }

    const wildCard = (player,turn,played_card,isForgotUno=false) => {
       let newColor = prompt('Enter first letter of new color (R/G/B/Y)')
       if(newColor){
        newColor = newColor.toUpperCase()
        const playerDeck = player == 'Player 1' ? player1Deck : player2Deck

            if(isForgotUno){
                forgotUno(player,turn,played_card,newColor,300)
            }else{
                const removeIndex = playerDeck.indexOf(played_card);
                const updatedPlayerDeck = [...playerDeck.slice(0,removeIndex), ...playerDeck.slice(removeIndex+1)]

                !isSoundMuted && playWildCardSound()
                socketEmitUpdateGameState(player,turn,played_card,updatedPlayerDeck,
                    newColor,300)
            }
        }else{
            alert("Invalid Color!")
        }
    }
        
    const whileCard = (player,turn,played_card,colorOfPlayedCard,isForgotUno=false) => {
        const playerDeck = player == 'Player 1' ? player1Deck : player2Deck

        if(isForgotUno){
            forgotUno(player, turn, played_card, colorOfPlayedCard, 100,null,null,true)
        }else{
            const removeIndex = playerDeck.indexOf(played_card)
            const updatedPlayerDeck = [...playerDeck.slice(0,removeIndex), ...playerDeck.slice(removeIndex+1)]

        socketEmitUpdateGameState(player,turn,played_card,updatedPlayerDeck,
            colorOfPlayedCard,100,null,null,true)
        }
    }

    const whileCardLoop = (player, played_card, numberOfPlayedCard) => {
    
        const playerDeck = player == 'Player 1' ? player1Deck : player2Deck
        const nextTurnIfSuccessfullPlay = player == 'Player 1' ? 'Player 2' : 'Player 1'
        const colorOfPlayedCard = played_card.charAt(played_card.length - 1)
        //Verifica se o card jogado contém o mesmo número da última carta numérica presente
        //na mesa
        const removeIndex = playerDeck.indexOf(played_card)
        const updatedPlayerDeck = 
        [...playerDeck.slice(0,removeIndex), ...playerDeck.slice(removeIndex+1)]

        if(lastNumber === numberOfPlayedCard){
            if(playerDeck.length===2 && !isUnoButtonPressed) {
                    forgotUno(player,nextTurnIfSuccessfullPlay,played_card,colorOfPlayedCard,numberOfPlayedCard, null,null,false)
            }else{
                socketEmitUpdateGameState(player,nextTurnIfSuccessfullPlay,played_card,updatedPlayerDeck,
                    colorOfPlayedCard,numberOfPlayedCard,null,null,false)
            }
        }else{
            alert("Number " + lastNumber + " required!")
        }
    }

    const breakCard = (player,turn,played_card) => {
        const colorOfPlayedCard = played_card.charAt(played_card.length - 1)
        const playerDeck = player == 'Player 1' ? player1Deck : player2Deck;
        const nextTurn = turn == 'Player 1' ? 'Player 2' : 'Player 1';
        if(colorOfPlayedCard === currentColor && isWhileCardOnPile){
            if(playerDeck.length===2 && !isUnoButtonPressed){
                forgotUno(player,nextTurn, played_card, colorOfPlayedCard,
                101)
            }else{
                const removeIndex = playerDeck.indexOf(played_card)
                const updatedPlayerDeck = [...playerDeck.slice(0,removeIndex), ...playerDeck.slice(removeIndex + 1)]
    
                socketEmitUpdateGameState(player,nextTurn,played_card,updatedPlayerDeck,colorOfPlayedCard,101)
            }
        }
        //Se não houver carta While, atuará como carta break
        else if( (colorOfPlayedCard === currentColor || currentNumber == 101 ) && !isWhileCardOnPile){
            if(playerDeck.length===2 && !isUnoButtonPressed){
                forgotUno(player,player, played_card, colorOfPlayedCard,
                101)
            }else{
                const removeIndex = playerDeck.indexOf(played_card)
                const updatedPlayerDeck = [...playerDeck.slice(0,removeIndex), ...playerDeck.slice(removeIndex + 1)]
    
                socketEmitUpdateGameState(player,player,played_card,updatedPlayerDeck,colorOfPlayedCard,101)
            }
        }
        else{
            alert(`Moviment Invalid! Current Color: ${currentColor}`)
        }
       
    }

    const pass = (player,turn,played_card) => {
        const colorOfPlayedCard = played_card.charAt(played_card.length - 1)
        const playerDeck = player == 'Player 1' ? player1Deck : player2Deck;
        const nextTurn = turn == 'Player 1' ? 'Player 2' : 'Player 1';

        if(colorOfPlayedCard === currentColor && isWhileCardOnPile){

            if(playerDeck.length===2 && !isUnoButtonPressed){
                forgotUno(player,player, played_card, colorOfPlayedCard,
                102)
            }else{
                const removeIndex = playerDeck.indexOf(played_card)
                const updatedPlayerDeck = [...playerDeck.slice(0,removeIndex), ...playerDeck.slice(removeIndex + 1)]
    
                socketEmitUpdateGameState(player,player,played_card,updatedPlayerDeck,colorOfPlayedCard,102)
            }
        }
        //Se não houver carta While, atuará como uma carta "numérica"
        else if((colorOfPlayedCard === currentColor || 102 == currentNumber) && !isWhileCardOnPile){
            if(playerDeck.length===2 && !isUnoButtonPressed){
                forgotUno(player,nextTurn, played_card, colorOfPlayedCard,
                102)
            }else{
                const removeIndex = playerDeck.indexOf(played_card)
                const updatedPlayerDeck = [...playerDeck.slice(0,removeIndex), ...playerDeck.slice(removeIndex + 1)]
    
                socketEmitUpdateGameState(player,nextTurn,played_card,updatedPlayerDeck,colorOfPlayedCard,102)
            }
        }
        else{
            alert("Moviment Invalid!")
        }
       
    }

    const jokerCard = (player, updatedDrawCardPile=null) => {
        const playerDeck = player == 'Player 1' ? player1Deck : player2Deck;
        const nextTurn = player == 'Player 1' ? 'Player 2' : 'Player 1';

        let cardWithoutColor = playedCardsPile[playedCardsPile.length - 1]
        cardWithoutColor = cardWithoutColor.split('_')[0]

        let jokerCardTransform = ''
        let nextNumber = '';

        if(cardWithoutColor == 'BREAK' || cardWithoutColor == 'PASS' ||
           cardWithoutColor == 'W'     || cardWithoutColor == 'WHILE'||
           cardWithoutColor == 'D4W'   || cardWithoutColor.includes('D2') ||
           cardWithoutColor.includes('skip')) {

            jokerCardTransform = 'JOKER_' + currentColor
            nextNumber = 700
        }else if(cardWithoutColor[0] >= 0 && cardWithoutColor[0] <= 9){

            jokerCardTransform = `JOKER_${currentNumber}_${currentColor}`
            nextNumber = currentNumber
        }
        if(updatedDrawCardPile){
            socketEmitUpdateGameState(player,nextTurn,jokerCardTransform,playerDeck,currentColor,nextNumber,updatedDrawCardPile,null,false)
            console.table([player,nextTurn,jokerCardTransform,playerDeck,currentColor,nextNumber,updatedDrawCardPile,null,false])

        }else if(playerDeck.length===2 && !isUnoButtonPressed && nextNumber != '' && jokerCardTransform != ''){

            forgotUno(player, nextTurn, jokerCardTransform,currentColor,nextNumber)
        }else if(nextNumber != '' && jokerCardTransform != ''){
            const removeIndex = playerDeck.indexOf('JOKER_W')
            const updatedPlayerDeck = [...playerDeck.slice(0,removeIndex), ...playerDeck.slice(removeIndex + 1)]

            socketEmitUpdateGameState(player, nextTurn, jokerCardTransform, updatedPlayerDeck,currentColor,nextNumber,null,null,false)
        }else{
            alert('Invalid move!')
        }

    }

    const onCardDrawnHandler = () => {
        //extract player who drew the card
        const cardDrawnBy = turn
        //check who drew the card and return new state accordingly
        
        if(cardDrawnBy === 'Player 1') {
            
            //remove 1 new card from drawCardPile and add it to player1's deck (immutably)
            //make a copy of drawCardPile array
            const copiedDrawCardPileArray = [...drawCardPile]
            //pull out last element from it
            const drawCard = copiedDrawCardPileArray.pop()
            //extract number and color of drawn card
            const colorOfDrawnCard = drawCard.charAt(drawCard.length - 1)
            let numberOfDrawnCard = drawCard.charAt(0)

            //se o número jogado é igual ao último número e há uma carta 'WHILE' na mesa 
            console.log('JOGADOR 1: ')
            console.log('drawCard: ',drawCard)
            
            if(drawCard == 'JOKER_W') {
                jokerCard('Player 1', copiedDrawCardPileArray)
            }
            else if(colorOfDrawnCard === currentColor && isWhileCardOnPile && (drawCard === 'BREAK_R' || drawCard === 'BREAK_G' || drawCard === 'BREAK_B' || drawCard === 'BREAK_Y')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 1','Player 2',drawCard,player1Deck,colorOfDrawnCard,101,copiedDrawCardPileArray )
            }
            else if((colorOfDrawnCard === currentColor) && !isWhileCardOnPile && (drawCard === 'BREAK_R' || drawCard === 'BREAK_G' || drawCard === 'BREAK_B' || drawCard === 'BREAK_Y')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 1','Player 1',drawCard,player1Deck,colorOfDrawnCard,101,copiedDrawCardPileArray)
            }
            else if(colorOfDrawnCard === currentColor && isWhileCardOnPile && (drawCard === 'PASS_R' || drawCard === 'PASS_G' || drawCard === 'PASS_B' || drawCard === 'PASS_Y')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 1','Player 1',drawCard,player1Deck,colorOfDrawnCard,102,copiedDrawCardPileArray,null,true )
            }
            else if(colorOfDrawnCard === currentColor && !isWhileCardOnPile && (drawCard === 'PASS_R' || drawCard === 'PASS_G' || drawCard === 'PASS_B' || drawCard === 'PASS_Y')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 1','Player 2',drawCard,player1Deck,colorOfDrawnCard,102,copiedDrawCardPileArray )
            }
            else if(numberOfDrawnCard == lastNumber && isWhileCardOnPile){
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 1','Player 2',drawCard,player1Deck,colorOfDrawnCard,numberOfDrawnCard,copiedDrawCardPileArray )
            }
            //se o número jogado não é igual ao último número da mesa e há uma carta "WHILE"
            //entao compra e mantem o turno
            else if(numberOfDrawnCard != lastNumber && isWhileCardOnPile){
                alert(`You drew ${drawCard}.`)
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard, ...player1Deck.slice(player1Deck.length)],
                    drawCardPile: [...copiedDrawCardPileArray],
                    isWhileCardOnPile: true
                })

            }
            else if(colorOfDrawnCard === currentColor && (drawCard === 'skipR' || drawCard === 'skipG' || drawCard === 'skipB' || drawCard === 'skipY')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 1','Player 1',drawCard,player1Deck,colorOfDrawnCard,404,copiedDrawCardPileArray )
            }
            else if(colorOfDrawnCard === currentColor && (drawCard === 'D2R' || drawCard === 'D2G' || drawCard === 'D2B' || drawCard === 'D2Y')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last two elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw2CardSound()
            
                const player2Updated = [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, ...player2Deck.slice(player2Deck.length)]
                socketEmitUpdateGameState('Player 1','Player 2',drawCard,player1Deck,colorOfDrawnCard,252,copiedDrawCardPileArray,player2Updated)
            }
            else if(drawCard === 'W') {
                alert(`You drew ${drawCard}. It was played for you.`)
                //ask for new color
                const newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                !isSoundMuted && playWildCardSound()

                socketEmitUpdateGameState('Player 1','Player 2',drawCard,player1Deck,newColor,300,copiedDrawCardPileArray)
            }
            else if(drawCard === 'D4W') {
                alert(`You drew ${drawCard}. It was played for you.`)
                const newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last four elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                const drawCard3 = copiedDrawCardPileArray.pop()
                const drawCard4 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw4CardSound()

                const player2Updated = [...player2Deck.slice(0, player2Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player2Deck.slice(player2Deck.length)]
                socketEmitUpdateGameState('Player 1','Player 2',drawCard,player1Deck,newColor,600,copiedDrawCardPileArray,player2Updated)
            }
            else if((colorOfDrawnCard === currentColor) && (drawCard === 'WHILE_R' || drawCard === 'WHILE_G' || drawCard === 'WHILE_B' || drawCard === 'WHILE_Y') ) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 1','Player 2',drawCard,player1Deck,colorOfDrawnCard,numberOfDrawnCard,copiedDrawCardPileArray,null,true)
            }
            //if not action card - check if drawn card is playable
            else if((numberOfDrawnCard == currentNumber || colorOfDrawnCard === currentColor) ) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 1','Player 2',drawCard,player1Deck,colorOfDrawnCard,numberOfDrawnCard, copiedDrawCardPileArray)
            }

            //else add the drawn card to player1's deck
            else {
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 2',
                    player1Deck: [...player1Deck.slice(0, player1Deck.length), drawCard, ...player1Deck.slice(player1Deck.length)],
                    drawCardPile: [...copiedDrawCardPileArray],
                    isWhileCardOnPile: false
                })
            }
        }
        else {
            //remove 1 new card from drawCardPile and add it to player2's deck (immutably)
            //make a copy of drawCardPile array
            const copiedDrawCardPileArray = [...drawCardPile]
            //pull out last element from it
            const drawCard = copiedDrawCardPileArray.pop()
            //extract number and color of drawn card
            const colorOfDrawnCard = drawCard.charAt(drawCard.length - 1)
            let numberOfDrawnCard = drawCard.charAt(0)
            console.log('JOGADOR 2: ')

            console.log('drawCard: ',drawCard)
            if(drawCard == 'JOKER_W') {
                jokerCard('Player 2', copiedDrawCardPileArray)
            }else if(colorOfDrawnCard === currentColor && isWhileCardOnPile && (drawCard === 'BREAK_R' || drawCard === 'BREAK_G' || drawCard === 'BREAK_B' || drawCard === 'BREAK_Y')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 2', 'Player 1',drawCard,player2Deck,colorOfDrawnCard,101,copiedDrawCardPileArray)
            }
            else if(colorOfDrawnCard === currentColor && !isWhileCardOnPile && (drawCard === 'BREAK_R' || drawCard === 'BREAK_G' || drawCard === 'BREAK_B' || drawCard === 'BREAK_Y')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 2', 'Player 2',drawCard,player2Deck,colorOfDrawnCard,101,copiedDrawCardPileArray)
            }
            else if(colorOfDrawnCard === currentColor && isWhileCardOnPile && (drawCard === 'PASS_R' || drawCard === 'PASS_G' || drawCard === 'PASS_B' || drawCard === 'PASS_Y')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 2','Player 2',drawCard,player2Deck,colorOfDrawnCard,102,copiedDrawCardPileArray,null,true)
            }
            else if(colorOfDrawnCard === currentColor && !isWhileCardOnPile && (drawCard === 'PASS_R' || drawCard === 'PASS_G' || drawCard === 'PASS_B' || drawCard === 'PASS_Y')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 2','Player 1',drawCard,player2Deck,colorOfDrawnCard,102,copiedDrawCardPileArray)
            }
            //se o número jogado é igual ao último número e há uma carta 'WHILE' na mesa 
            else if(numberOfDrawnCard == lastNumber && isWhileCardOnPile){
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()
                //send new state to server

                socketEmitUpdateGameState('Player 2','Player 1',drawCard,player2Deck,colorOfDrawnCard,numberOfDrawnCard,copiedDrawCardPileArray)
               
            }
            //se o número jogado não é igual ao último número da mesa e há uma carta "WHILE"
            //entao compra e mantem o turno
            else if(numberOfDrawnCard != lastNumber && isWhileCardOnPile){
                alert(`You drew ${drawCard}.`)
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard, ...player2Deck.slice(player2Deck.length)],
                    drawCardPile: [...copiedDrawCardPileArray],
                    isWhileCardOnPile: true
                })
            }

            else if(colorOfDrawnCard === currentColor && (drawCard === 'skipR' || drawCard === 'skipG' || drawCard === 'skipB' || drawCard === 'skipY')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 2','Player 2',drawCard,colorOfDrawnCard,404, copiedDrawCardPileArray)
            }
            else if(colorOfDrawnCard === currentColor && (drawCard === 'D2R' || drawCard === 'D2G' || drawCard === 'D2B' || drawCard === 'D2Y')) {
                alert(`You drew ${drawCard}. It was played for you.`)
                //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last two elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw2CardSound()
            
                const player1Updated = [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, ...player1Deck.slice(player1Deck.length)]
                socketEmitUpdateGameState('Player 2','Player 1',drawCard,player2Deck,colorOfDrawnCard,252,copiedDrawCardPileArray,player1Updated)
            }
            else if(drawCard === 'W') {
                alert(`You drew ${drawCard}. It was played for you.`)
                //ask for new color
                const newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                !isSoundMuted && playWildCardSound()

                socketEmitUpdateGameState('Player 2','Player 1',drawCard,player2Deck,newColor,300,copiedDrawCardPileArray)
            }
            else if(drawCard === 'D4W') {
                alert(`You drew ${drawCard}. It was played for you.`)
                //ask for new color
                const newColor = prompt('Enter first letter of new color (R/G/B/Y)').toUpperCase()
                //remove 2 new cards from drawCardPile and add them to player1's deck (immutably)
                //make a copy of drawCardPile array
                const copiedDrawCardPileArray = [...drawCardPile]
                //pull out last four elements from it
                const drawCard1 = copiedDrawCardPileArray.pop()
                const drawCard2 = copiedDrawCardPileArray.pop()
                const drawCard3 = copiedDrawCardPileArray.pop()
                const drawCard4 = copiedDrawCardPileArray.pop()
                !isSoundMuted && playDraw4CardSound()

                const player1Updated = [...player1Deck.slice(0, player1Deck.length), drawCard1, drawCard2, drawCard3, drawCard4, ...player1Deck.slice(player1Deck.length)]
                socketEmitUpdateGameState('Player 2','Player 2',drawCard,player2Deck,newColor,600,copiedDrawCardPileArray,player1Updated)
            }
            else if(colorOfDrawnCard === currentColor && (drawCard === 'WHILE_R' || drawCard === 'WHILE_G' || drawCard === 'WHILE_B' || drawCard === 'WHILE_Y') ) {
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 2','Player 1',drawCard,player2Deck,colorOfDrawnCard,numberOfDrawnCard,copiedDrawCardPileArray,null,true)
            }
            //if not action card - check if drawn card is playable
            else if((numberOfDrawnCard == currentNumber || colorOfDrawnCard === currentColor)) {
            
                alert(`You drew ${drawCard}. It was played for you.`)
                !isSoundMuted && playShufflingSound()

                socketEmitUpdateGameState('Player 2','Player 1',drawCard,player2Deck,colorOfDrawnCard,numberOfDrawnCard,copiedDrawCardPileArray,null,drawCard.includes('WHILE'))
            }
            //else add the drawn card to player2's deck
            else {
                !isSoundMuted && playShufflingSound()
                //send new state to server
                socket.emit('updateGameState', {
                    turn: 'Player 1',
                    player2Deck: [...player2Deck.slice(0, player2Deck.length), drawCard, ...player2Deck.slice(player2Deck.length)],
                    drawCardPile: [...copiedDrawCardPileArray],
                    isWhileCardOnPile: false
                })
            }
        }
    }

    const forgotUno = (player,turn, played_card, colorOfPlayedCard,numberOfPlayedCard, opponentsDeck=null, modifiedDeck=null, isWhileCardOnPile = false) => {
        const playerDeck = player == 'Player 1' ? player1Deck : player2Deck;
        const removeIndex = playerDeck.indexOf(played_card);

        alert('Oops! You forgot to press UNO. You drew 2 cards as penalty.')
        //make a copy of drawCardPile array
        const copiedDrawCardPileArray = modifiedDeck != null ? modifiedDeck : drawCardPile
        //pull out last two elements from it
        const drawCard1 = copiedDrawCardPileArray.pop()
        const drawCard2 = copiedDrawCardPileArray.pop()

        const updatedPlayerDeck = [...playerDeck.slice(0, removeIndex), ...playerDeck.slice(removeIndex + 1)]
        updatedPlayerDeck.push(drawCard1)
        updatedPlayerDeck.push(drawCard2)
        /**
         * TODO: Parametrizar lógica do Som
         * !isSoundMuted && playShufflingSound()*/

        socketEmitUpdateGameState(player,
            turn,played_card,updatedPlayerDeck, colorOfPlayedCard,numberOfPlayedCard,
            copiedDrawCardPileArray, opponentsDeck, isWhileCardOnPile)
    }
        /**
         * modifiedDrawCardPile -> Caso haja alteração no baralho antes de executar a função
         * oponnentsDeck -> Caso o deck do oponente seja modificado, passar este parâmetro
         */
    const socketEmitUpdateGameState = (
                                        winner,
                                        turn,
                                        played_card,
                                        updatedPlayerDeck,
                                        colorOfPlayedCard,
                                        numberOfPlayedCard,
                                        modifiedDrawCardPile = null,
                                        opponentsDeck = null,
                                        isWhileCardOnPile = false) => {

        let obj = "";
        const currentColorOfPlayedCard = colorOfPlayedCard ? colorOfPlayedCard : currentColor;
        const currentNumberOfPlayedCard = numberOfPlayedCard ? numberOfPlayedCard : currentNumber;

        let ln = ''
        try{
            ln =( typeof parseInt(currentNumber) == 'number') && (currentNumber < 10 )? currentNumber : lastNumber
        }catch(message){
            ln = currentNumber
        }

        if(winner=='Player 1'){
          obj =  opponentsDeck !== null ? 
            {
                gameOver: checkGameOver(player1Deck),
                winner: checkWinner(player1Deck, winner),
                turn: turn,
                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                player1Deck: [...updatedPlayerDeck],
                player2Deck:[...opponentsDeck],
                currentColor: currentColorOfPlayedCard,
                currentNumber: currentNumberOfPlayedCard,
                drawCardPile: modifiedDrawCardPile != null ? [...modifiedDrawCardPile] : drawCardPile,
                lastNumber: ln,
                isWhileCardOnPile: isWhileCardOnPile
            } : {
                gameOver: checkGameOver(player1Deck),
                winner: checkWinner(player1Deck, winner),
                turn: turn,
                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                player1Deck: [...updatedPlayerDeck],
                currentColor: currentColorOfPlayedCard,
                currentNumber: currentNumberOfPlayedCard,
                drawCardPile: modifiedDrawCardPile != null ? [...modifiedDrawCardPile] : drawCardPile,
                lastNumber: ln,
                isWhileCardOnPile: isWhileCardOnPile
            } 
        }else{
            obj =  opponentsDeck !== null ? {
                gameOver: checkGameOver(player2Deck),
                winner: checkWinner(player2Deck, winner),
                turn: turn,
                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                player1Deck: [...opponentsDeck],
                player2Deck: [...updatedPlayerDeck],
                currentColor: currentColorOfPlayedCard,
                currentNumber: currentNumberOfPlayedCard,
                drawCardPile: modifiedDrawCardPile != null ? [...modifiedDrawCardPile] : drawCardPile,
                lastNumber: ln,
                isWhileCardOnPile: isWhileCardOnPile
            } : {
                gameOver: checkGameOver(player2Deck),
                winner: checkWinner(player2Deck, winner),
                turn: turn,
                playedCardsPile: [...playedCardsPile.slice(0, playedCardsPile.length), played_card, ...playedCardsPile.slice(playedCardsPile.length)],
                player2Deck: [...updatedPlayerDeck],
                currentColor: currentColorOfPlayedCard,
                currentNumber: currentNumberOfPlayedCard,
                drawCardPile: modifiedDrawCardPile != null ? [...modifiedDrawCardPile] : drawCardPile,
                lastNumber: ln,
                isWhileCardOnPile: isWhileCardOnPile
            } 
        }

        socket.emit('updateGameState', obj)
    }


    const checkGameOver = (arr) => {
        return arr.length === 1
    }

    const checkWinner = (arr, player) => {
        return arr.length === 1 ? player : ''
    }

    const toggleChatBox = () => {
        const chatBody = document.querySelector('.chat-body')
        if(isChatBoxHidden) {
            chatBody.style.display = 'block'
            setChatBoxHidden(false)
        }
        else {
            chatBody.style.display = 'none'
            setChatBoxHidden(true)
        }
    }

    const sendMessage= (event) => {
        event.preventDefault()
        if(message) {
            socket.emit('sendMessage', { message: message }, () => {
                setMessage('')
            })
        }
    }

    const expectedTurnForSpinner = player == 'Player 1' ? 'Player 2' : 'Player 1'
    
  return (
      <div>
            <div className={ player == 'Player 1'? 'player2Deck' :'player1Deck'} style={{pointerEvents: 'none'}}>
                <p className='playerDeckText'>{player == 'Player 1' ? 'Player 2' : 'Player 1'}</p>
                { player == 'Player 1' && player2Deck.map((item, i) => (
                    <img
                        key={i}
                        className='Card'
                        onClick={() => onCardPlayedHandler(item)}
                        src={require(`../assets/card-back.png`).default}
                        />
                ))}
                { player == 'Player 2' && player1Deck.map((item, i) => (
                    <img
                        key={i}
                        className='Card'
                        onClick={() => onCardPlayedHandler(item)}
                        src={require(`../assets/card-back.png`).default}
                        />
                ))}
                {turn===expectedTurnForSpinner && <Spinner />}
            </div>
            <br />
            <div className='middleInfo' style={turn === expectedTurnForSpinner ? {pointerEvents: 'none'} : null}>
                <button className='button-baralho' disabled={turn !== player} onClick={onCardDrawnHandler}> 
                <div class='red-circle'> 
                DRAW CARD
                </div>
                </button>
                {playedCardsPile && playedCardsPile.length>0 &&
                <img
                    className='Card'
                    src={require(`../assets/cards-front/${playedCardsPile[playedCardsPile.length-1]}.png`).default}
                    /> }
                {turn == 'Player 1' &&
                    <button className='button-uno' disabled={player1Deck.length !== 2} onClick={() => {
                        setUnoButtonPressed(!isUnoButtonPressed)
                        playUnoSound()
                    }}>UNO</button>
                }

                {turn == 'Player 2' &&
                    <button className='button-uno' disabled={player2Deck.length !== 2} onClick={() => {
                        setUnoButtonPressed(!isUnoButtonPressed)
                        playUnoSound()
                    }}>UNO</button>
                }
            </div>
            <br />
            <div className={player=='Player 1' ? 'player1Deck' : 'player2Deck'} style={turn === expectedTurnForSpinner ? {pointerEvents: 'none'} : null}>
                <p className='playerDeckText'>{ player }</p>
                { player == 'Player 1' && player1Deck.map((item, i) => (
                    <img
                        key={i}
                        className='Card'
                        onClick={() => onCardPlayedHandler(item)}
                        src={require(`../assets/cards-front/${item}.png`).default}
                        />
                ))}
                { player == 'Player 2' && player2Deck.map((item, i) => (
                    <img
                        key={i}
                        className='Card'
                        onClick={() => onCardPlayedHandler(item)}
                        src={require(`../assets/cards-front/${item}.png`).default}
                        />
                ))}
            </div>

            <div className="chatBoxWrapper">
                <div className={player == 'Player 1' ? "chat-box chat-box-player1" : "chat-box chat-box-player2"}>
                    <div className="chat-head">
                        <h2>Chat Box</h2>
                        {!isChatBoxHidden ?
                        <span onClick={toggleChatBox} class="material-icons">keyboard_arrow_down</span> :
                        <span onClick={toggleChatBox} class="material-icons">keyboard_arrow_up</span>}
                    </div>
                    <div className="chat-body">
                        <div className="msg-insert">
                            {messages.map(msg => {
                                if(msg.user === 'Player 2')
                                    return <div className="msg-receive">{msg.text}</div>
                                if(msg.user === 'Player 1')
                                    return <div className="msg-send">{msg.text}</div>
                            })}
                        </div>
                        <div className="chat-text">
                            <input type='text' placeholder='Type a message...' value={message} onChange={event => setMessage(event.target.value)} onKeyPress={event => event.key==='Enter' && sendMessage(event)} />
                        </div>
                    </div>
                </div>
            </div> 
      </div>
  )}

export default VisaoPlayer