import React,{useEffect,useState} from 'react'


const useWhileCard = () => {
    const [state,setState] = useState('')
    console.log('Entrando em useWhileCard')
    useEffect(() =>{
        console.log('Atualizando dentro useEffect')
            setState((newState) => {
                const cardName = newState.cardName ? newState.cardName : '';
                const lastNumber = typeof newState.lastNumber == 'number' ? newState : ''

                if(lastNumber){        
                    return {
                        cardName: cardName,
                        lastNumber: lastNumber,
                    }
                }
            })
    },[])

    
    return [state,setState]
}

export default useWhileCard