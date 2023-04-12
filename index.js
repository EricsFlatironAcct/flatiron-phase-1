console.log(`For more information about data drawn from this page, see https://www.amiiboapi.com/docs/`)
const gameFilter = document.getElementById('sidebar').querySelector('select');
//Use filter to select game series and populate characters
gameFilter.addEventListener('change', e=>{
    clearCharacterList()
    refreshCharacterList(e.target.value)
})
const characterList = document.getElementById('character-list')
let amiiboLib = []
let filteredCharacters = []
let gameList = []

//Generate list of game series' to update filter 
const gameOptionNodes = document.querySelectorAll('option')
const gameOptions =[]
gameOptionNodes.forEach(option=>gameOptions.push(option.value))
 gameOptions.sort();
 clearGameFilter();
 refreshGameFilter();

//obtain amiibos. The fetch from https://www.amiiboapi.com/api/amiibo/?showusage was used to generate local db
fetch("http://localhost:3000/amiibo").then(resp=>resp.json()).then(amiiboObjs=>{
    amiiboLib=amiiboObjs
    refreshCharacterList(gameFilter.value)
})

//Helper functions
function clearGameFilter(){
    while(gameFilter.length>0){
        gameFilter.removeChild(gameFilter.firstElementChild)
    }
}
//update the filter if any new game series are added
function refreshGameFilter(){
    gameOptions.forEach(option=>{
        const newOption = document.createElement('option')
        newOption.innerHTML = option
        newOption.value = option
        gameFilter.append(newOption)
    })
    //force a selected filter
    gameFilter[0].setAttribute('selected', 'true')
}

//empties current character list
function clearCharacterList(){
    characterList.replaceChildren()
}

function refreshCharacterList(seriesName){
    //creates a modified array of selected filter
    filteredCharacters=[]
    filteredCharacters = amiiboLib.filter(amiibo=>{
        if(amiibo.gameSeries.localeCompare(seriesName)==0)  return true
        else return false
    })
    filteredCharacters.sort((a, b) => a.name.localeCompare(b.name))
    //displays each character from the array
    filteredCharacters.forEach(character=>{
        const characterLi = document.createElement('li')
        const characterButton = document.createElement('button')
        characterButton.innerHTML = character.name
        characterButton.addEventListener('click', resetSelectedAmiibo.bind(null, character))
        characterLi.append(characterButton)
        characterList.append(characterLi)
    })
    //Inializes the first character as the displayed Amiibo
    resetSelectedAmiibo(filteredCharacters[0])
}
function resetSelectedAmiibo(character){
    if(character==undefined)return
    clearGameList('3ds')
    clearGameList('switch')
    clearGameList('wii-u')
    //add new game list and update Amiibo
    nullGame = {
        gameName: 'None',
        amiiboUsage: {
            usage:'No game selected. Select a game to show usage'
        }
    }
    document.getElementById('amiibo-image').src=character.image
    document.getElementById('amiibo-name').innerHTML=character.name
    firstDisplayed = false
    //check each console games from object and add them to the list, if none are found, add a default "none" game. Display the first game's usage
    if(character.gamesSwitch.length>0){
        character.gamesSwitch.forEach(game=>addGame(game, 'switch'))
        updateUsage(character.gamesSwitch[0])
        firstDisplayed = true
    }
    else addGame(nullGame, 'switch')

    if(character.games3DS.length>0){
        character.games3DS.forEach(game=>addGame(game, '3ds'))
        if(!firstDisplayed){
           updateUsage(character.games3DS[0])
           firstDisplayed = true
        }
    }
    else addGame(nullGame, '3ds')

    if(character.gamesWiiU.length>0){
        character.gamesWiiU.forEach(game=>addGame(game, 'wii-u'))
        if(!firstDisplayed){
            updateUsage(character.games3DS[0])
            firstDisplayed = true
         }
    }
    else addGame(nullGame, 'wii-u')
    
}
function clearGameList(system){
    const games = document.getElementById(`game-list-${system}`)
    games.replaceChildren(`${system}`.toUpperCase())    
}
function addGame(game, system){
    const newGameObj = document.createElement('p')
    newGameObj.innerHTML = game.gameName
    //only add event listeners for valid games
    if(game.gameName.localeCompare('None')!=0){
        newGameObj.addEventListener('click', updateUsage.bind(null, game))
    }
    document.getElementById(`game-list-${system}`).append(newGameObj)
}
//updates the usage text for the selected game
function updateUsage(game){
    let usageText = game.amiiboUsage[0].Usage
    usageText = usageText.slice(0,1).toLowerCase() + usageText.slice(1)
    document.getElementById('amiibo-usage').innerHTML= `In ${game.gameName}, you can ${usageText}`
}
