import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import randomCodeGenerator from '../utils/randomCodeGenerator'
import devunoWhite from '../assets/devuno/devuno_logo_white.png'

const Homepage = () => {
    const [roomCode, setRoomCode] = useState('')

    return (
        <div className='Homepage'>
        
           
                <div className='homepage-form'>     
                <img src={devunoWhite} className='homepage-logo' alt='logotipo'/>
                    <div className='homepage-join'>
                        <input type='text' placeholder='GAME CODE' id='input-code' className='input-for-code' onChange={(event) => setRoomCode(event.target.value)} />
                        <Link to={`/play?roomCode=${roomCode}`}><button className="game-button-green"> <p> JOIN GAME </p> </button></Link>
                    </div>
                    <h1 className=''>OR</h1>
                    <div className='homepage-create'>
                        <Link to={`/play?roomCode=${randomCodeGenerator(5)}`}><button className="game-button-orange"> 
                        <p> CREATE GAME </p> </button></Link>
                    </div>
                </div>
            </div>
        
    )
}

export default Homepage
