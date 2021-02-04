'use strict'

const RESULTS_PER_PAGE = 10
const MAX_ADJACENT_PAGE_BTNS = 2
const MAX_ADJACENT_MOBILE_PAGE_BTNS = 1
const PREVIEW_SIZE = 300
const NUM_LEADING_CHARS = 30
let results = void 0
let postsData = void 0
let pageResults = void 0
const currentPageIndex = 0

const runSearch = function runSearch (json_data, posts_data) {
  postsData = posts_data
  let searchTerm = getQueryVariable('query')

  if (!searchTerm || searchTerm === '+') {
    searchTerm = ' '
  }

  document.getElementById('search-box-search').value = searchTerm

  // Radio button check box logic
  const searchTypeUrlQueryParam = new URLSearchParams(window.location.search)
  let searchType = searchTypeUrlQueryParam.get('search-type') || 'content-search'
  document.querySelector(`input[name="search-type"][value="${searchType}"]`).click()
  searchType = document.querySelector('input[name="search-type"]:checked').value

  if (searchTerm && searchType === 'content-search') {
    // Load the pre-built lunr index
    const idx = lunr.Index.load(JSON.parse(json_data))
    // Get lunr to perform a search
    results = idx.search(searchTerm)
    console.log('>>>> Posts Data', posts_data)
    console.log('>>>> Results', results)
    pageResults = splitPages(results, RESULTS_PER_PAGE)

    window.onload = displaySearchResults(searchTerm)
  }

  if (searchTerm && searchType === 'document-search') {
    const documentSearchLambdaUrl = document.getElementById('document_search_lambda_url').innerHTML
    const xhr = new XMLHttpRequest()
    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === 4) {
        console.log(this.responseText)
      }
    })

    xhr.open('POST', `${documentSearchLambdaUrl}/api/documentsearch`)
    xhr.setRequestHeader('x-api-key', '') // Simple API key to prevents bots from spamming
    xhr.send()
  }
}

// -------------------------------- CODE FOR CONTENT SEARCH ----------------------------------------------

// Bolds the keywords in the preview string
function highlightKeywords (content, previewStartPosition, matchMetadata) {
  const matchMap = {}

  // Create an object containing search hit position and length of search hit in the document (for content within preview)
  for (const keyword in matchMetadata) {
    var positionArray

    if (!matchMetadata[keyword].content) {
      return
    }

    positionArray = matchMetadata[keyword].content.position

    for (let positionIndex = 0; positionIndex < positionArray.length; positionIndex++) {
      const hitPosition = positionArray[positionIndex][0]
      if (hitPosition >= previewStartPosition && hitPosition < previewStartPosition + PREVIEW_SIZE) {
        matchMap[hitPosition] = positionArray[positionIndex][1]
      }
    }
  }

  // Go through each search hit and bold it
  if (Object.keys(matchMap).length !== 0) {
    let processedPreview = ''
    let currPosition = previewStartPosition
    for (const wordPosition in matchMap) {
      var wordEnd = parseInt(wordPosition) + parseInt(matchMap[wordPosition]) + 1
      processedPreview += content.substring(currPosition, wordPosition) + '<b>' + content.substring(wordPosition, wordEnd) + '</b>'
      currPosition = wordEnd
    }

    if (wordEnd < previewStartPosition + PREVIEW_SIZE) {
      processedPreview += content.substring(currPosition, previewStartPosition + PREVIEW_SIZE)
    }
    return processedPreview
  }

  return content.substring(previewStartPosition, previewStartPosition + PREVIEW_SIZE)
}

// Find the earliest space in the preview closest to (firstPosition - NUM_LEADING_CHARS)
function returnStartOfPreview (content, firstPosition) {
  if (firstPosition - NUM_LEADING_CHARS <= 0) {
    return 0
  } else {
    for (let index = firstPosition - NUM_LEADING_CHARS; index < firstPosition; index++) {
      if (content.charAt(index) === ' ') {
        return index
      }
    }
    return firstPosition
  }
}

// Find the position of the first keyword match in the document
function returnFirstKeywordPosition (matchMetadata) {
  let firstPosition = -1

  // Iterate over each keyword in the search query
  for (const keyword in matchMetadata) {
    if (matchMetadata[keyword].content !== undefined) {
      const positionArray = matchMetadata[keyword].content.position

      // Find the earliest first position across all keywords
      for (let positionIndex = 0; positionIndex < positionArray.length; positionIndex++) {
        if (firstPosition == -1 || firstPosition > positionArray[positionIndex][0]) {
          firstPosition = positionArray[positionIndex][0]
        }
      }
    }
  }

  return firstPosition
}

// Return the preview content for each search result - returns the snippet that has the first hit in the document (up to 300 chars)
function returnResultsList (results) {
  let searchPara = ''
  const post_data = postsData // Obtain JSON var of all the posts in the site

  // Iterate over the results
  for (let i = 0; i < results.length; i++) {
    const key = parseInt(results[i].ref)
    const resultObject = post_data[key]
    const matchMetadata = results[i].matchData.metadata

    const titleTruncateLength = 90
    var resultTitle = resultObject.title.substring(0, titleTruncateLength)

    if (resultObject.title.length > titleTruncateLength) {
      const indexOfLastWord = resultObject.title.substring(0, titleTruncateLength).lastIndexOf(' ')
      var resultTitle = resultObject.title.substring(0, indexOfLastWord)
      resultTitle += ' ...'
    }
    searchPara += '<a class="search-content" href="' + resultObject.url + '">' + ' ' + resultTitle + '</a>'

    // Find the position of the earliest keyword in the document
    const firstPosition = returnFirstKeywordPosition(matchMetadata)

    // Find the preview start position
    const previewStartPosition = returnStartOfPreview(resultObject.content, firstPosition)

    // Process the preview to embolden keywords
    const processedPreview = highlightKeywords(resultObject.content, previewStartPosition, matchMetadata)
    // var postDate = new Date(resultObject['datestring']).toDateString().substring(4);
    searchPara += '<p class="search-content permalink">' + resultObject.url + '</p><br>'
    // searchPara += '<p class="search-content" > '+ postDate + ' ...' + processedPreview + '...</p><br>';

    if (processedPreview) {
      searchPara += '<p class="search-content" > ' + ' ...' + processedPreview + '...</p><br>'
    }
  }

  return searchPara
}

// Display search results if there are results, else, state that there are no results found
function displaySearchResults (searchTerm) {
  document.getElementById('loading-spinner').style.display = 'none'
  const searchResultsCount = document.getElementById('search-results-count')
  searchResultsCount.innerHTML = results.length + ' result'
  searchResultsCount.innerHTML += (results.length === 1) ? ' ' : 's '
  searchResultsCount.innerHTML += "for '" + searchTerm + "'"
  document.getElementsByName('query')[1].setAttribute('value', searchTerm)

  paginateSearchResults()
  if (!results.length || pageResults.length <= 1) return
  displayPagination()
}

function paginateSearchResults () {
  if (!results.length) return
  const searchPageIndicator = document.getElementById('search-page-indicator')
  searchPageIndicator.style.display = pageResults.length > 1 ? 'flex' : 'none'
  searchPageIndicator.innerHTML = 'Page ' + (currentPageIndex + 1) + ' of ' + pageResults.length

  const searchResults = document.getElementById('search-results')
  searchResults.innerHTML = returnResultsList(pageResults[currentPageIndex])
  document.getElementsByClassName('search-results-display')[0].style.display = 'block'
}

function changePage (curr, index) {
  changePageUtil(curr, index)
  paginateSearchResults()
}

// Obtain the query string, load the pre-built lunr index, and perform search
function getQueryVariable (variable) {
  const query = window.location.search.substring(1)
  const vars = query.split('&')

  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')

    if (pair[0] === variable) {
      const dirtyString = decodeURIComponent(pair[1].replace(/\+/g, '%20'))
      return DOMPurify.sanitize(dirtyString, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      })
    }
  }
}

// ----------------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------- CODE FOR DOCUMENT SEARCH ----------------------------------------------------------------

// ----------------------------------------------------------------------------------------------------------------------------------------
