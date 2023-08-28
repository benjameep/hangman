const $main = document.getElementById("main")
const $menu = document.getElementById("menu")
const $phrase = document.getElementById("phrase")
const $edit = document.getElementById("edit")
const $options = document.getElementById("options")
const $done = document.getElementById("done")

let words = JSON.parse(localStorage.getItem('words') || '[]')

let word, guesses, mode, reveal = false

function saveWords() {
  localStorage.setItem('words', JSON.stringify(words))
}

const search = location.search.slice(1)
if(search != 'edit' && words.length == 0) {
  location.search = 'edit'
  console.log("redirecting to edit")
} else if(search == 'edit') {
  words = words.map(({text}) => ({text, used: false}))
  saveWords()
  setupEdit()
} else if (search == '') {
  setupOptions()
} else {
  word = atob(search)

  i = words.findIndex(({text}) => text == word)
  if (i > -1) {
    words[i].used = true
    saveWords()
  }
  
  setupHangman(word)
}

function setupEdit() {
  $edit.classList.remove('hide')
  $done.classList.remove('hide')
  $edit.value = words.map(words => words.text).join('\n')
  $done.onclick = () => {
    location.search = ''
  }
  $edit.onkeyup = () => {
    words = $edit.value.split('\n').map(w => w.trim()).filter(n => n).map(text => ({text, used: false}))
    saveWords()
    setupOptions()
  }
  setupOptions()
}

function setupOptions() {
  $options.classList.remove('hide')
  $options.innerHTML = words
    .map(({text, used}) => `<a href="?${btoa(text)}" class=${used ? "used" : ""}>${text.replace(/[A-Za-z]/g,'_').replace(/\s+/g, ' ')}</a>`)
    .join('')
}

function setupHangman(w){
  word = w
  mode = 'game'
  guesses = {}
  $menu.classList.add('hide')
  $main.classList.remove('hide')
  render()
  document.body.onkeydown = e => {
    if (!e.ctrlKey && !e.shiftKey && !e.metaKey && /^[a-z]$/i.test(e.key))
      guess(e.key.toLowerCase())
    if (e.metaKey && e.key == 'i') {
      reveal = true
      render()
      document.body.addEventListener('keyup', () => {
        reveal = false
        render()
      }, {once:true})
    }
  }
}

function render() {
  $phrase.innerHTML = word.split('').map(letter => {
    if (/[^a-z]/i.test(letter)) return `<span class="punc">${letter}</span>`
    if (letter === ' ') return `<span class="space"></span>`
    if (letter.toLowerCase() in guesses || reveal) return `<span class="letter">${letter}</span>`
    return `<span class="letter blank"></span>`
  }).join('')
  
  Object.entries(guesses).forEach(([letter, guess]) => {
    document.querySelector(`.guess.${letter}`).classList.add(guess ? 'correct' : 'incorrect')
  })
}

function guess(letter){
  guesses[letter] = word.toLowerCase().includes(letter)
  render()
}

