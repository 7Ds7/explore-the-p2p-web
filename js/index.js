import {$} from '/js/utils.js'

(function () {
  const DOM = {
    entriesList: $('.entries-list'),
    categories: $('.categories'),
    showAllButton: $('.categories-show-all'),
    searchInput: $('.search-input')
  }

  const COLORS = [
    "pink",
    "red",
    "orange",
    "yellow",
    "green",
    "teal",
    "blue",
    "purple"
  ]

  const CATEGORIES = [
    "websites",
    "apps",
    "tools",
    "videos",
    "sounds",
    "events",
    "ideas",
    "words",
    "collections"
  ]

  let files
  let entries
  let filteredEntries
  let filters = new Set()

  setup()

  async function setup () {
    if (!window.DatArchive) {
      // TODO
    }

    files = new DatArchive(window.location)

    renderCategories(CATEGORIES)

    await readEntries()
    renderEntries(entries)

    // event listeners
    $('button.category').forEach(c => c.addEventListener('click', onToggleFilter))
    DOM.showAllButton.addEventListener('click', onClearFilters)
    DOM.searchInput.addEventListener('keyup', onSearchChange)
  }

  // filesystem
  async function readEntries () {
    let entriesFile = await files.readFile('data/entries.json')
    entries = JSON.parse(entriesFile)
    filteredEntries = entries
  }

  // rendering
  function renderEntries (entries) {
    let els = ''
    for (let i = 0; i < entries.length; i++) {
      els += renderEntry(entries[i])
    }
    DOM.entriesList.innerHTML = els
  }

  function renderEntry (e) {
    let clsStr = e.classes
      ? e.classes.reduce((acc, val) => acc +  val + ' ', '')
      : ''

    let descriptionEl = ''
    if (e.description) {
      descriptionEl = `<p class="entry-description">${e.description}</p>`
    }

    let imageEl = ''
    if (e.image) {
      imageEl = `<img src=${e.image} class="entry-image" aria-hidden="true" />`
    }

    let screenshotEl = ''
    if (e.screenshot) {
      screenshotEl = `<img src=${e.screenshot} class="entry-screenshot" aria-hidden="true" />`
    }

    return `
      <div class="entry ${clsStr}">
        <h3 class="entry-title">${e.title}</h3>

        ${descriptionEl}
        ${imageEl}
        ${screenshotEl}

        <div class="entry-links">
          ${e.datURL ? `<a href="${e.datURL}">dat</a>` : ''}
          ${e.httpURL ? `<a href="${e.httpURL}">http</a>` : ''}
        </div>
      </div>
    `
  }

  function renderCategories () {
    for (let i = 0; i < CATEGORIES.length; i++) {
      DOM.categories.innerHTML += renderCategoryButton(CATEGORIES[i])
    }
  }

  function renderCategoryButton (c) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    return `
      <button class="btn btn--${color} category big-text" aria-pressed="${filters.has(c)}">
        ${c}
      </button>
    `
  }

  // events
  function onToggleFilter (e) {
    const category = e.target.innerText

    filters.has(category) ? filters.delete(category) : filters.add(category)
    e.target.setAttribute('aria-pressed', filters.has(category))

    filterEntries()
  }

  function onClearFilters () {
    filters.clear()
    filteredEntries = entries

    $('button.category').forEach(c => c.setAttribute('aria-pressed', 'false'))
    DOM.showAllButton.classList.add('hidden')

    renderEntries(filteredEntries)
  }

  function onSearchChange(e) {
    onClearFilters()
    let searchEntries = searchFilter(entries, e.target.value)
    renderEntries(searchEntries)
  }
  
  function searchFilter(arr, str) {
    let res = []
    for (var i = 0; i < arr.length; i++) {
      for (var key in arr[i]) {
        if ( typeof(arr[i][key]) !== 'string') {
          for (var ai = 0; ai < arr[i][key].length; ai++) {
            if (stringExist(arr[i][key][ai], str)) {
              res.push(arr[i])
              break
            }
          }
        } else if ( stringExist(arr[i][key], str) ) {
          res.push(arr[i])
          break
        }
      }
    }
    if ( res.length === 0 ) {
      res.push({
        title: `No results for "${str}"`,
        description: 'Please try another search term',
        classes: ["grid-column--4"]
      })
    }
    return res;
  }
  
  function stringExist(haystack, needle) {
   if (haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1) {
     return true;
   }
  }

  function filterEntries () {
    const shouldShowEntry = (e) => {
      if (!e.categories) {
        return false
      }

      for (let i = 0; i < e.categories.length; i++) {
        if (filters.has(e.categories[i])) {
          return true
        }
      }
      return false
    }

    if (!filters.size) {
      filteredEntries = entries
      DOM.showAllButton.classList.add('hidden')
    } else {
      filteredEntries = entries.filter(shouldShowEntry)
      DOM.showAllButton.classList.remove('hidden')
    }

    renderEntries(filteredEntries)
  }
})()