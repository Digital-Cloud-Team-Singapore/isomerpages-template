// 'use strict'

// const RESULTS_PER_PAGE = 10
// const MAX_ADJACENT_PAGE_BTNS = 2
// const MAX_ADJACENT_MOBILE_PAGE_BTNS = 1
// const PREVIEW_SIZE = 300
// const NUM_LEADING_CHARS = 30
// let results = void 0
// let postsData = void 0
// let pageResults = void 0
// const currentPageIndex = 0

// const runSearch = function runSearch (json_data, posts_data) {
//   postsData = posts_data
//   let searchTerm = getQueryVariable('query')

//   if (!searchTerm || searchTerm === '+') {
//     searchTerm = ' '
//   }

//   document.getElementById('search-box-search').value = searchTerm

//   // Radio button check box logic
//   const searchTypeUrlQueryParam = new URLSearchParams(window.location.search)
//   let searchType = searchTypeUrlQueryParam.get('search-type') || 'content-search'
//   document.querySelector(`input[name="search-type"][value="${searchType}"]`).click()
//   searchType = document.querySelector('input[name="search-type"]:checked').value

//   if (searchTerm && searchType === 'content-search') {
//     // Load the pre-built lunr index
//     const idx = lunr.Index.load(JSON.parse(json_data))
//     // Get lunr to perform a search
//     results = idx.search(searchTerm)
//     console.log('>>>> Posts Data', posts_data)
//     console.log('>>>> Results', results)
//     pageResults = splitPages(results, RESULTS_PER_PAGE)

//     window.onload = displaySearchResults(searchTerm)
//   }

//   if (searchTerm && searchType === 'document-search') {
//     const documentSearchLambdaUrl = document.getElementById('document_search_lambda_url').innerHTML
//     const xhr = new XMLHttpRequest()
//     xhr.addEventListener('readystatechange', function () {
//       if (this.readyState === 4) {
//         console.log(this.responseText)
//       }
//     })

//     xhr.open('POST', `${documentSearchLambdaUrl}/api/documentsearch`)
//     xhr.setRequestHeader('x-api-key', '') // Simple API key to prevents bots from spamming
//     xhr.send()
//   }
// }

// // -------------------------------- CODE FOR CONTENT SEARCH ----------------------------------------------

// // Bolds the keywords in the preview string
// function highlightKeywords (content, previewStartPosition, matchMetadata) {
//   const matchMap = {}

//   // Create an object containing search hit position and length of search hit in the document (for content within preview)
//   for (const keyword in matchMetadata) {
//     var positionArray

//     if (!matchMetadata[keyword].content) {
//       return
//     }

//     positionArray = matchMetadata[keyword].content.position

//     for (let positionIndex = 0; positionIndex < positionArray.length; positionIndex++) {
//       const hitPosition = positionArray[positionIndex][0]
//       if (hitPosition >= previewStartPosition && hitPosition < previewStartPosition + PREVIEW_SIZE) {
//         matchMap[hitPosition] = positionArray[positionIndex][1]
//       }
//     }
//   }

//   // Go through each search hit and bold it
//   if (Object.keys(matchMap).length !== 0) {
//     let processedPreview = ''
//     let currPosition = previewStartPosition
//     for (const wordPosition in matchMap) {
//       var wordEnd = parseInt(wordPosition) + parseInt(matchMap[wordPosition]) + 1
//       processedPreview += content.substring(currPosition, wordPosition) + '<b>' + content.substring(wordPosition, wordEnd) + '</b>'
//       currPosition = wordEnd
//     }

//     if (wordEnd < previewStartPosition + PREVIEW_SIZE) {
//       processedPreview += content.substring(currPosition, previewStartPosition + PREVIEW_SIZE)
//     }
//     return processedPreview
//   }

//   return content.substring(previewStartPosition, previewStartPosition + PREVIEW_SIZE)
// }

// // Find the earliest space in the preview closest to (firstPosition - NUM_LEADING_CHARS)
// function returnStartOfPreview (content, firstPosition) {
//   if (firstPosition - NUM_LEADING_CHARS <= 0) {
//     return 0
//   } else {
//     for (let index = firstPosition - NUM_LEADING_CHARS; index < firstPosition; index++) {
//       if (content.charAt(index) === ' ') {
//         return index
//       }
//     }
//     return firstPosition
//   }
// }

// // Find the position of the first keyword match in the document
// function returnFirstKeywordPosition (matchMetadata) {
//   let firstPosition = -1

//   // Iterate over each keyword in the search query
//   for (const keyword in matchMetadata) {
//     if (matchMetadata[keyword].content !== undefined) {
//       const positionArray = matchMetadata[keyword].content.position

//       // Find the earliest first position across all keywords
//       for (let positionIndex = 0; positionIndex < positionArray.length; positionIndex++) {
//         if (firstPosition == -1 || firstPosition > positionArray[positionIndex][0]) {
//           firstPosition = positionArray[positionIndex][0]
//         }
//       }
//     }
//   }

//   return firstPosition
// }

// // Return the preview content for each search result - returns the snippet that has the first hit in the document (up to 300 chars)
// function returnResultsList (results) {
//   let searchPara = ''
//   const post_data = postsData // Obtain JSON var of all the posts in the site

//   // Iterate over the results
//   for (let i = 0; i < results.length; i++) {
//     const key = parseInt(results[i].ref)
//     const resultObject = post_data[key]
//     const matchMetadata = results[i].matchData.metadata

//     const titleTruncateLength = 90
//     var resultTitle = resultObject.title.substring(0, titleTruncateLength)

//     if (resultObject.title.length > titleTruncateLength) {
//       const indexOfLastWord = resultObject.title.substring(0, titleTruncateLength).lastIndexOf(' ')
//       var resultTitle = resultObject.title.substring(0, indexOfLastWord)
//       resultTitle += ' ...'
//     }
//     searchPara += '<a class="search-content" href="' + resultObject.url + '">' + ' ' + resultTitle + '</a>'

//     // Find the position of the earliest keyword in the document
//     const firstPosition = returnFirstKeywordPosition(matchMetadata)

//     // Find the preview start position
//     const previewStartPosition = returnStartOfPreview(resultObject.content, firstPosition)

//     // Process the preview to embolden keywords
//     const processedPreview = highlightKeywords(resultObject.content, previewStartPosition, matchMetadata)
//     // var postDate = new Date(resultObject['datestring']).toDateString().substring(4);
//     searchPara += '<p class="search-content permalink">' + resultObject.url + '</p><br>'
//     // searchPara += '<p class="search-content" > '+ postDate + ' ...' + processedPreview + '...</p><br>';

//     if (processedPreview) {
//       searchPara += '<p class="search-content" > ' + ' ...' + processedPreview + '...</p><br>'
//     }
//   }

//   return searchPara
// }

// // Display search results if there are results, else, state that there are no results found
// function displaySearchResults (searchTerm) {
//   document.getElementById('loading-spinner').style.display = 'none'
//   const searchResultsCount = document.getElementById('search-results-count')
//   searchResultsCount.innerHTML = results.length + ' result'
//   searchResultsCount.innerHTML += (results.length === 1) ? ' ' : 's '
//   searchResultsCount.innerHTML += "for '" + searchTerm + "'"
//   document.getElementsByName('query')[1].setAttribute('value', searchTerm)

//   paginateSearchResults()
//   if (!results.length || pageResults.length <= 1) return
//   displayPagination()
// }

// function paginateSearchResults () {
//   if (!results.length) return
//   const searchPageIndicator = document.getElementById('search-page-indicator')
//   searchPageIndicator.style.display = pageResults.length > 1 ? 'flex' : 'none'
//   searchPageIndicator.innerHTML = 'Page ' + (currentPageIndex + 1) + ' of ' + pageResults.length

//   const searchResults = document.getElementById('search-results')
//   searchResults.innerHTML = returnResultsList(pageResults[currentPageIndex])
//   document.getElementsByClassName('search-results-display')[0].style.display = 'block'
// }

// function changePage (curr, index) {
//   changePageUtil(curr, index)
//   paginateSearchResults()
// }

// // Obtain the query string, load the pre-built lunr index, and perform search
// function getQueryVariable (variable) {
//   const query = window.location.search.substring(1)
//   const vars = query.split('&')

//   for (let i = 0; i < vars.length; i++) {
//     const pair = vars[i].split('=')

//     if (pair[0] === variable) {
//       const dirtyString = decodeURIComponent(pair[1].replace(/\+/g, '%20'))
//       return DOMPurify.sanitize(dirtyString, {
//         ALLOWED_TAGS: [],
//         ALLOWED_ATTR: []
//       })
//     }
//   }
// }

// // ----------------------------------------------------------------------------------------------------------------------------------------

// // ---------------------------------------------- CODE FOR DOCUMENT SEARCH ----------------------------------------------------------------

// // ----------------------------------------------------------------------------------------------------------------------------------------

'use strict'

var RESULTS_PER_PAGE = 10
var MAX_ADJACENT_PAGE_BTNS = 2
var MAX_ADJACENT_MOBILE_PAGE_BTNS = 1
var PREVIEW_SIZE = 300
var NUM_LEADING_CHARS = 30
let results = void 0
let postsData = void 0
let pageResults = void 0
var currentPageIndex = 0

var runSearch = function runSearch (json_data, posts_data) {
  postsData = posts_data
  let searchTerm = getQueryVariable('query')

  if (!searchTerm || searchTerm === '+') {
    searchTerm = ' '
  }

  document.getElementById('search-box-search').value = searchTerm

  // Radio button check box logic
  var searchTypeUrlQueryParam = new URLSearchParams(window.location.search)
  let searchType = searchTypeUrlQueryParam.get('search-type') || 'content-search'
  document.querySelector(`input[name="search-type"][value="${searchType}"]`).click()
  searchType = document.querySelector('input[name="search-type"]:checked').value

  if (searchTerm && searchType === 'content-search') {
    var idx = lunr.Index.load(JSON.parse(json_data))
    results = idx.search(searchTerm)
    console.log('>>> searchTerm', searchTerm)
    console.log('>>> content-search results', results)
    pageResults = splitPages(results, RESULTS_PER_PAGE)
    window.onload = displaySearchResults(searchTerm)
  }

  if (searchTerm && searchType === 'document-search') {
    var documentSearchLambdaUrl = document.getElementById('document_search_lambda_url').innerHTML
    console.log('>>> documentSearchLambdaUrl', documentSearchLambdaUrl)
    var data = JSON.stringify({ query: 'How do I declare bankruptcy?' })

    var xhr = new XMLHttpRequest()
    xhr.withCredentials = true

    xhr.addEventListener('readystatechange', function () {
      if (this.readyState === 4) {
        console.log(this.responseText)
      }
    })

    xhr.open('POST', `${documentSearchLambdaUrl}/api/kendrasearch`)
    xhr.setRequestHeader('x-api-key', '61fa2710-794c-4fd9-9d86-52d27dcd6efd')
    xhr.setRequestHeader('Content-Type', 'application/json')

    xhr.send(data)
    var documents = [
      {
            "Id": "001f8222-2dc0-4cd1-af70-9c78d985842d-d72804df-c0c5-47a8-98dd-2e1a73e04441",
            "Type": "DOCUMENT",
            "AdditionalAttributes": [],
            "DocumentId": "s3://mlaw/_site/bankruptcy-and-debt-repayment-scheme/bankruptcy/index.html",
            "DocumentTitle": {
                "Text": "Bankruptcy",
                "Highlights": [
                    {
                        "BeginOffset": 0,
                        "EndOffset": 10,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentExcerpt": {
                "Text": "...BANKRUPTCY\n\n\n\n\n\n\n\n        \n\n\n    \n\n\n    \n        \n            \n                Bankruptcy\n\n\n            \n\n\n        \n\n\n    \n\n\n        \n            \n                \n                    Bankruptcy...",
                "Highlights": [
                    {
                        "BeginOffset": 3,
                        "EndOffset": 13,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 82,
                        "EndOffset": 92,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 187,
                        "EndOffset": 197,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentURI": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy-and-debt-repayment-scheme/bankruptcy/index.html",
            "DocumentAttributes": [
                {
                    "Key": "_source_uri",
                    "Value": {
                        "StringValue": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy-and-debt-repayment-scheme/bankruptcy/index.html"
                    }
                }
            ],
            "ScoreAttributes": {
                "ScoreConfidence": "LOW"
            }
        },
        {
            "Id": "001f8222-2dc0-4cd1-af70-9c78d985842d-7fddc0dc-ef3a-4b62-bb1d-00667a6eabea",
            "Type": "DOCUMENT",
            "AdditionalAttributes": [],
            "DocumentId": "s3://mlaw/_site/unclaimed-monies/bankruptcy/index.html",
            "DocumentTitle": {
                "Text": "Bankruptcy",
                "Highlights": [
                    {
                        "BeginOffset": 0,
                        "EndOffset": 10,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentExcerpt": {
                "Text": "...Assignee\n\n\n\nUnclaimed Monies\n\n\n\nBankruptcy Estate (Dividends & Refunds) (184 KB)\n\n\nBankruptcy Estate (Unproved & Untraced Dividends) (55 KB)\n\n\nBankruptcy Estate (Unknown Monies Deposited) (28 KB)\n\n\nDebt Repayment Scheme (Dividends & Refunds) (44 KB)\n\n\nDebt Repayment Scheme (Unknown Monies...",
                "Highlights": [
                    {
                        "BeginOffset": 35,
                        "EndOffset": 45,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 86,
                        "EndOffset": 96,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 146,
                        "EndOffset": 156,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentURI": "https://s3.us-east-1.amazonaws.com/mlaw/_site/unclaimed-monies/bankruptcy/index.html",
            "DocumentAttributes": [
                {
                    "Key": "_source_uri",
                    "Value": {
                        "StringValue": "https://s3.us-east-1.amazonaws.com/mlaw/_site/unclaimed-monies/bankruptcy/index.html"
                    }
                }
            ],
            "ScoreAttributes": {
                "ScoreConfidence": "LOW"
            }
        },
        {
            "Id": "001f8222-2dc0-4cd1-af70-9c78d985842d-20b599ee-ccd6-4773-8b46-fddac6ccf5f7",
            "Type": "DOCUMENT",
            "AdditionalAttributes": [],
            "DocumentId": "s3://mlaw/_site/bankruptcy/alternatives-to-bankruptcy/index.html",
            "DocumentTitle": {
                "Text": "Alternatives to Bankruptcy",
                "Highlights": [
                    {
                        "BeginOffset": 16,
                        "EndOffset": 26,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentExcerpt": {
                "Text": "...Alternatives to Bankruptcy\n\n\n                            \n                                    Introduction to Bankruptcy (Video)\n\n\n                                \n                                \n                                Introduction to Bankruptcy Video...",
                "Highlights": [
                    {
                        "BeginOffset": 19,
                        "EndOffset": 29,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 113,
                        "EndOffset": 123,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 248,
                        "EndOffset": 258,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentURI": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/alternatives-to-bankruptcy/index.html",
            "DocumentAttributes": [
                {
                    "Key": "_source_uri",
                    "Value": {
                        "StringValue": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/alternatives-to-bankruptcy/index.html"
                    }
                }
            ],
            "ScoreAttributes": {
                "ScoreConfidence": "LOW"
            }
        },
        {
            "Id": "001f8222-2dc0-4cd1-af70-9c78d985842d-d7880b08-6905-4379-a1db-ce3649c14af2",
            "Type": "DOCUMENT",
            "AdditionalAttributes": [],
            "DocumentId": "s3://mlaw/_site/bankruptcy/pre-bankruptcy/index.html",
            "DocumentTitle": {
                "Text": "Pre-Bankruptcy",
                "Highlights": [
                    {
                        "BeginOffset": 4,
                        "EndOffset": 14,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentExcerpt": {
                "Text": "...Alternatives to Bankruptcy\n\n\n                            \n                                    Introduction to Bankruptcy (Video)\n\n\n                                \n                                \n                                Introduction to Bankruptcy Video...",
                "Highlights": [
                    {
                        "BeginOffset": 19,
                        "EndOffset": 29,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 113,
                        "EndOffset": 123,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 248,
                        "EndOffset": 258,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentURI": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/pre-bankruptcy/index.html",
            "DocumentAttributes": [
                {
                    "Key": "_source_uri",
                    "Value": {
                        "StringValue": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/pre-bankruptcy/index.html"
                    }
                }
            ],
            "ScoreAttributes": {
                "ScoreConfidence": "LOW"
            }
        },
        {
            "Id": "001f8222-2dc0-4cd1-af70-9c78d985842d-0b3833dc-7ea8-43fe-99da-9fc863657b52",
            "Type": "DOCUMENT",
            "AdditionalAttributes": [],
            "DocumentId": "s3://mlaw/_site/bankruptcy/bankruptcy-notice/index.html",
            "DocumentTitle": {
                "Text": "Bankruptcy Notice",
                "Highlights": [
                    {
                        "BeginOffset": 0,
                        "EndOffset": 10,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentExcerpt": {
                "Text": "...Alternatives to Bankruptcy\n\n\n                            \n                                    Introduction to Bankruptcy (Video)\n\n\n                                \n                                \n                                Introduction to Bankruptcy Video...",
                "Highlights": [
                    {
                        "BeginOffset": 19,
                        "EndOffset": 29,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 113,
                        "EndOffset": 123,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 248,
                        "EndOffset": 258,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentURI": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/bankruptcy-notice/index.html",
            "DocumentAttributes": [
                {
                    "Key": "_source_uri",
                    "Value": {
                        "StringValue": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/bankruptcy-notice/index.html"
                    }
                }
            ],
            "ScoreAttributes": {
                "ScoreConfidence": "LOW"
            }
        },
        {
            "Id": "001f8222-2dc0-4cd1-af70-9c78d985842d-e021ed4c-b9bf-482a-87b3-358e486a6b1a",
            "Type": "DOCUMENT",
            "AdditionalAttributes": [],
            "DocumentId": "s3://mlaw/_site/bankruptcy/information-for-bankrupts/discharge-from-bankruptcy/index.html",
            "DocumentTitle": {
                "Text": "Discharge from Bankruptcy",
                "Highlights": [
                    {
                        "BeginOffset": 15,
                        "EndOffset": 25,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentExcerpt": {
                "Text": "...Alternatives to Bankruptcy\n\n\n                            \n                                    Introduction to Bankruptcy (Video)\n\n\n                                \n                                \n                                Introduction to Bankruptcy Video...",
                "Highlights": [
                    {
                        "BeginOffset": 19,
                        "EndOffset": 29,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 113,
                        "EndOffset": 123,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 248,
                        "EndOffset": 258,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentURI": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/information-for-bankrupts/discharge-from-bankruptcy/index.html",
            "DocumentAttributes": [
                {
                    "Key": "_source_uri",
                    "Value": {
                        "StringValue": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/information-for-bankrupts/discharge-from-bankruptcy/index.html"
                    }
                }
            ],
            "ScoreAttributes": {
                "ScoreConfidence": "LOW"
            }
        },
        {
            "Id": "001f8222-2dc0-4cd1-af70-9c78d985842d-68824bec-8532-43cf-bdcf-ed841da1a051",
            "Type": "DOCUMENT",
            "AdditionalAttributes": [],
            "DocumentId": "s3://mlaw/_site/bankruptcy/bankruptcy-flowchart/index.html",
            "DocumentTitle": {
                "Text": "Bankruptcy Flowchart",
                "Highlights": [
                    {
                        "BeginOffset": 0,
                        "EndOffset": 10,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentExcerpt": {
                "Text": "...Alternatives to Bankruptcy\n\n\n                            \n                                    Introduction to Bankruptcy (Video)\n\n\n                                \n                                \n                                Introduction to Bankruptcy Video...",
                "Highlights": [
                    {
                        "BeginOffset": 19,
                        "EndOffset": 29,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 113,
                        "EndOffset": 123,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 248,
                        "EndOffset": 258,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentURI": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/bankruptcy-flowchart/index.html",
            "DocumentAttributes": [
                {
                    "Key": "_source_uri",
                    "Value": {
                        "StringValue": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/bankruptcy-flowchart/index.html"
                    }
                }
            ],
            "ScoreAttributes": {
                "ScoreConfidence": "LOW"
            }
        },
        {
            "Id": "001f8222-2dc0-4cd1-af70-9c78d985842d-2ecdda28-e967-47fe-8f91-884134c8e85b",
            "Type": "DOCUMENT",
            "AdditionalAttributes": [],
            "DocumentId": "s3://mlaw/_site/bankruptcy/information-for-bankrupts/impact-of-bankruptcy/index.html",
            "DocumentTitle": {
                "Text": "Impact of Bankruptcy",
                "Highlights": [
                    {
                        "BeginOffset": 10,
                        "EndOffset": 20,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentExcerpt": {
                "Text": "...Alternatives to Bankruptcy\n\n\n                            \n                                    Introduction to Bankruptcy (Video)\n\n\n                                \n                                \n                                Introduction to Bankruptcy Video...",
                "Highlights": [
                    {
                        "BeginOffset": 19,
                        "EndOffset": 29,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 113,
                        "EndOffset": 123,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 248,
                        "EndOffset": 258,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentURI": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/information-for-bankrupts/impact-of-bankruptcy/index.html",
            "DocumentAttributes": [
                {
                    "Key": "_source_uri",
                    "Value": {
                        "StringValue": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy/information-for-bankrupts/impact-of-bankruptcy/index.html"
                    }
                }
            ],
            "ScoreAttributes": {
                "ScoreConfidence": "LOW"
            }
        },
        {
            "Id": "001f8222-2dc0-4cd1-af70-9c78d985842d-76afc692-65a5-4edc-8f12-ea5e7a7a5998",
            "Type": "DOCUMENT",
            "AdditionalAttributes": [],
            "DocumentId": "s3://mlaw/_site/bankruptcy-and-debt-repayment-scheme/bankruptcy-notice/index.html",
            "DocumentTitle": {
                "Text": "Bankruptcy Notice",
                "Highlights": [
                    {
                        "BeginOffset": 0,
                        "EndOffset": 10,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentExcerpt": {
                "Text": "...BANKRUPTCY NOTICE\n\n\n\n\n\n\n\n        \n\n\n    \n\n\n    \n        \n            \n                Bankruptcy Notice\n\n\n            \n\n\n        \n\n\n    \n\n\n        \n            \n                \n                    Bankruptcy Notice...",
                "Highlights": [
                    {
                        "BeginOffset": 3,
                        "EndOffset": 13,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 89,
                        "EndOffset": 99,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 201,
                        "EndOffset": 211,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentURI": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy-and-debt-repayment-scheme/bankruptcy-notice/index.html",
            "DocumentAttributes": [
                {
                    "Key": "_source_uri",
                    "Value": {
                        "StringValue": "https://s3.us-east-1.amazonaws.com/mlaw/_site/bankruptcy-and-debt-repayment-scheme/bankruptcy-notice/index.html"
                    }
                }
            ],
            "ScoreAttributes": {
                "ScoreConfidence": "LOW"
            }
        },
        {
            "Id": "001f8222-2dc0-4cd1-af70-9c78d985842d-c0ea070a-d329-4fe4-99ba-ffd0f4cc6c9f",
            "Type": "DOCUMENT",
            "AdditionalAttributes": [],
            "DocumentId": "s3://mlaw/_site/debt-repayment-scheme/forms1/index.html",
            "DocumentTitle": {
                "Text": "Forms - Bankruptcy Act",
                "Highlights": [
                    {
                        "BeginOffset": 8,
                        "EndOffset": 18,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentExcerpt": {
                "Text": "...Pre-Bankruptcy\n                                    \n\nBankruptcy Notice\n                                    \n\nAlternatives to Bankruptcy\n                                    \n\nIntroduction to Bankruptcy (Video)\n                                        \n\nInformation for Bankrupts...",
                "Highlights": [
                    {
                        "BeginOffset": 7,
                        "EndOffset": 17,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 56,
                        "EndOffset": 66,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 128,
                        "EndOffset": 138,
                        "TopAnswer": false
                    },
                    {
                        "BeginOffset": 193,
                        "EndOffset": 203,
                        "TopAnswer": false
                    }
                ]
            },
            "DocumentURI": "https://s3.us-east-1.amazonaws.com/mlaw/_site/debt-repayment-scheme/forms1/index.html",
            "DocumentAttributes": [
                {
                    "Key": "_source_uri",
                    "Value": {
                        "StringValue": "https://s3.us-east-1.amazonaws.com/mlaw/_site/debt-repayment-scheme/forms1/index.html"
                    }
                }
            ],
            "ScoreAttributes": {
                "ScoreConfidence": "LOW"
            }
        }
//       {
//         Id: 'e29fb3c1-7549-40e9-8fa4-4c5a36d775c2-c16c3f92-a1fc-470e-b63e-b2e31fd6c2c6',
//         Type: 'ANSWER',
//         AdditionalAttributes: [
//           {
//             Key: 'AnswerText',
//             ValueType: 'TEXT_WITH_HIGHLIGHTS_VALUE',
//             Value: {
//               TextWithHighlightsValue: {
//                 Text: "What is Diabetes?\n\n\nIn this section:\n\n\nWhat are the different types of diabetes?\n\n\nHow common is diabetes?\n\n\nWho is more likely to develop type 2 diabetes?\n\n\nWhat health problems can people with diabetes develop?\n\n\nDiabetes is a disease that occurs when your blood glucose, also called blood sugar, is too high.\n\n\nBlood glucose is your main source of energy and comes from the food you eat. Insulin, a\n\n\nhormone made by the pancreas, helps glucose from food get into your cells to be used for\n\n\nenergy. Sometimes your body doesn't make enough- - or any-insulin or doesn't use insulin\n\n\nwell.",
//                 Highlights: [
//                   {
//                     BeginOffset: 215,
//                     EndOffset: 310,
//                     TopAnswer: false
//                   },
//                   {
//                     BeginOffset: 227,
//                     EndOffset: 310,
//                     TopAnswer: false
//                   },
//                   {
//                     BeginOffset: 8,
//                     EndOffset: 16,
//                     TopAnswer: false
//                   },
//                   {
//                     BeginOffset: 71,
//                     EndOffset: 79,
//                     TopAnswer: false
//                   },
//                   {
//                     BeginOffset: 97,
//                     EndOffset: 105,
//                     TopAnswer: false
//                   },
//                   {
//                     BeginOffset: 146,
//                     EndOffset: 154,
//                     TopAnswer: false
//                   },
//                   {
//                     BeginOffset: 195,
//                     EndOffset: 203,
//                     TopAnswer: false
//                   },
//                   {
//                     BeginOffset: 215,
//                     EndOffset: 223,
//                     TopAnswer: false
//                   }
//                 ]
//               }
//             }
//           }
//         ],
//         DocumentId: '8847c64d-e14c-4009-b174-ea31f102dbf4',
//         DocumentTitle: {
//           Text: 'What_is_Diabetes_NIDDK-searchable',
//           Highlights: [
//             {
//               BeginOffset: 8,
//               EndOffset: 16,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentExcerpt: {
//           Text: 'What is Diabetes?\n\n\nIn this section:\n\n\nWhat are the different types of diabetes?\n\n\nHow common is diabetes?\n\n\nWho is more likely to develop type 2 diabetes?\n\n\nWhat health problems can people with diabetes develop?\n\n\nDiabetes is a disease that occurs when your blood glucose, also called blood sugar, i',
//           Highlights: [
//             {
//               BeginOffset: 0,
//               EndOffset: 300,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentURI: '',
//         DocumentAttributes: [
//           {
//             Key: '_excerpt_page_number',
//             Value: {
//               LongValue: 1
//             }
//           }
//         ],
//         ScoreAttributes: {
//           ScoreConfidence: 'VERY_HIGH'
//         }
//       },
//       {
//         Id: 'e29fb3c1-7549-40e9-8fa4-4c5a36d775c2-9e4f6396-0886-484d-b747-df5f88bd38f4',
//         Type: 'QUESTION_ANSWER',
//         AdditionalAttributes: [
//           {
//             Key: 'QuestionText',
//             ValueType: 'TEXT_WITH_HIGHLIGHTS_VALUE',
//             Value: {
//               TextWithHighlightsValue: {
//                 Text: 'What is diabetes?',
//                 Highlights: [
//                   {
//                     BeginOffset: 8,
//                     EndOffset: 16,
//                     TopAnswer: false
//                   }
//                 ]
//               }
//             }
//           },
//           {
//             Key: 'AnswerText',
//             ValueType: 'TEXT_WITH_HIGHLIGHTS_VALUE',
//             Value: {
//               TextWithHighlightsValue: {
//                 Text: 'Diabetes occurs when your blood glucose (also known as blood sugar) is too high.',
//                 Highlights: [
//                   {
//                     BeginOffset: 0,
//                     EndOffset: 8,
//                     TopAnswer: false
//                   }
//                 ]
//               }
//             }
//           }
//         ],
//         DocumentId: 'c18f6a1c9de54b6ecfe561c3ca5a71072afb8996aa154520ec548adb2b7db1d91611719438979',
//         DocumentTitle: {
//           Text: ''
//         },
//         DocumentExcerpt: {
//           Text: 'Diabetes occurs when your blood glucose (also known as blood sugar) is too high.',
//           Highlights: [
//             {
//               BeginOffset: 0,
//               EndOffset: 80,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentURI: '',
//         DocumentAttributes: [],
//         ScoreAttributes: {
//           ScoreConfidence: 'VERY_HIGH'
//         }
//       },
//       {
//         Id: 'e29fb3c1-7549-40e9-8fa4-4c5a36d775c2-50ee1ea4-a194-4fa5-b5e3-79b5792ed300',
//         Type: 'QUESTION_ANSWER',
//         AdditionalAttributes: [
//           {
//             Key: 'QuestionText',
//             ValueType: 'TEXT_WITH_HIGHLIGHTS_VALUE',
//             Value: {
//               TextWithHighlightsValue: {
//                 Text: 'What are the types of diabetes?',
//                 Highlights: [
//                   {
//                     BeginOffset: 22,
//                     EndOffset: 30,
//                     TopAnswer: false
//                   }
//                 ]
//               }
//             }
//           },
//           {
//             Key: 'AnswerText',
//             ValueType: 'TEXT_WITH_HIGHLIGHTS_VALUE',
//             Value: {
//               TextWithHighlightsValue: {
//                 Text: 'The most common types of diabetes are type 1 type 2 and gestational diabetes.',
//                 Highlights: [
//                   {
//                     BeginOffset: 25,
//                     EndOffset: 33,
//                     TopAnswer: false
//                   },
//                   {
//                     BeginOffset: 68,
//                     EndOffset: 76,
//                     TopAnswer: false
//                   }
//                 ]
//               }
//             }
//           }
//         ],
//         DocumentId: 'f9631f145435ce1dfc46b203f22453ac9e53e5bb536ad955bf3faf1bde6e70a61611719438979',
//         DocumentTitle: {
//           Text: ''
//         },
//         DocumentExcerpt: {
//           Text: 'The most common types of diabetes are type 1 type 2 and gestational diabetes.',
//           Highlights: [
//             {
//               BeginOffset: 0,
//               EndOffset: 77,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentURI: '',
//         DocumentAttributes: [],
//         ScoreAttributes: {
//           ScoreConfidence: 'HIGH'
//         }
//       },
//       {
//         Id: 'e29fb3c1-7549-40e9-8fa4-4c5a36d775c2-ccfab5d1-d483-497b-ad0d-9b00479d30b1',
//         Type: 'DOCUMENT',
//         AdditionalAttributes: [],
//         DocumentId: '8847c64d-e14c-4009-b174-ea31f102dbf4',
//         DocumentTitle: {
//           Text: 'What_is_Diabetes_NIDDK-searchable',
//           Highlights: [
//             {
//               BeginOffset: 8,
//               EndOffset: 16,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentExcerpt: {
//           Text: "...type of diabetes.\n\n\nGestational diabetes\n\n\nGestational diabetes develops in some women when they are pregnant. Most of the time, this\n\n\ntype of diabetes goes away after the baby is born. However, if you've had gestational diabetes,\n\n\nyou have a greater chance of developing type 2 diabetes later in...",
//           Highlights: [
//             {
//               BeginOffset: 11,
//               EndOffset: 19,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 35,
//               EndOffset: 43,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 58,
//               EndOffset: 66,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 147,
//               EndOffset: 155,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 225,
//               EndOffset: 233,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 284,
//               EndOffset: 292,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentURI: '',
//         DocumentAttributes: [
//           {
//             Key: '_excerpt_page_number',
//             Value: {
//               LongValue: 2
//             }
//           }
//         ],
//         ScoreAttributes: {
//           ScoreConfidence: 'HIGH'
//         }
//       },
//       {
//         Id: 'e29fb3c1-7549-40e9-8fa4-4c5a36d775c2-b79ba83f-d649-4c11-a4ef-c30be020069a',
//         Type: 'DOCUMENT',
//         AdditionalAttributes: [],
//         DocumentId: 'c117dbc3-9de1-4931-9b9b-cf0b7c0ab388',
//         DocumentTitle: {
//           Text: 'Diabetes_Tests_and_Diagnosis_NIDDK-searchable',
//           Highlights: [
//             {
//               BeginOffset: 0,
//               EndOffset: 8,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentExcerpt: {
//           Text: '...Diabetes Tests & Diagnosis | NIDDK 10/23/20, 3:28 PM\n\n\nDiabetes Tests & Diagnosis\n\n\nIn this section:\n\n\nWho should be tested for diabetes?\n\n\nType 1 diabetes\n\n\nType 2 diabetes\n\n\nGestational diabetes\n\n\nWhat tests are used to diagnose diabetes and prediabetes...',
//           Highlights: [
//             {
//               BeginOffset: 3,
//               EndOffset: 11,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 58,
//               EndOffset: 66,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 131,
//               EndOffset: 139,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 150,
//               EndOffset: 158,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 168,
//               EndOffset: 176,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 191,
//               EndOffset: 199,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 234,
//               EndOffset: 242,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentURI: '',
//         DocumentAttributes: [
//           {
//             Key: '_excerpt_page_number',
//             Value: {
//               LongValue: 1
//             }
//           }
//         ],
//         ScoreAttributes: {
//           ScoreConfidence: 'MEDIUM'
//         }
//       },
//       {
//         Id: 'e29fb3c1-7549-40e9-8fa4-4c5a36d775c2-457fda09-7a38-4ba5-8f2d-db849a150159',
//         Type: 'DOCUMENT',
//         AdditionalAttributes: [],
//         DocumentId: 'fcaa13f8-e3ee-41f3-9643-a7e6c81e6a17',
//         DocumentTitle: {
//           Text: 'Diabetes_Heart_Disease_and_Stroke_NIDDK-searchable',
//           Highlights: [
//             {
//               BeginOffset: 0,
//               EndOffset: 8,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentExcerpt: {
//           Text: '...Disease, and Stroke | NIDDK 10/23/20, 3:26 PM\n\n\nDiabetes, Heart Disease, and Stroke\n\n\nIn this section:\n\n\nWhat is the link between diabetes, heart disease, and stroke?\n\n\nWhat else increases my chances of heart disease or stroke if I have diabetes?\n\n\nHow can I lower my chances of a heart attack or...',
//           Highlights: [
//             {
//               BeginOffset: 51,
//               EndOffset: 59,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 133,
//               EndOffset: 141,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 240,
//               EndOffset: 248,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentURI: '',
//         DocumentAttributes: [
//           {
//             Key: '_excerpt_page_number',
//             Value: {
//               LongValue: 1
//             }
//           }
//         ],
//         ScoreAttributes: {
//           ScoreConfidence: 'MEDIUM'
//         }
//       },
//       {
//         Id: 'e29fb3c1-7549-40e9-8fa4-4c5a36d775c2-a77f2ab4-c248-47d6-b410-ba96cd41f9aa',
//         Type: 'DOCUMENT',
//         AdditionalAttributes: [],
//         DocumentId: 'f78aa361-fa1f-471e-a1af-be83ef27e93c',
//         DocumentTitle: {
//           Text: 'Preventing_Type_2_Diabetes_NIDDK-searchable',
//           Highlights: [
//             {
//               BeginOffset: 18,
//               EndOffset: 26,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentExcerpt: {
//           Text: '...niddk.nih.gov/health-information/diabetes/overview/preventing-type-2-diabetes Page 3 of 6\n\n\n\n\n\n\n\nPreventing Type 2 Diabetes I NIDDK 10/23/20, 3:27 PM\n\n\ndiabetes?\n\n\nGestational diabetes is a type of diabetes that develops during pregnancy. Most of the time,\n\n\ngestational diabetes goes away after...',
//           Highlights: [
//             {
//               BeginOffset: 36,
//               EndOffset: 44,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 72,
//               EndOffset: 80,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 118,
//               EndOffset: 126,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 155,
//               EndOffset: 163,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 179,
//               EndOffset: 187,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 201,
//               EndOffset: 209,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 274,
//               EndOffset: 282,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentURI: '',
//         DocumentAttributes: [
//           {
//             Key: '_excerpt_page_number',
//             Value: {
//               LongValue: 3
//             }
//           }
//         ],
//         ScoreAttributes: {
//           ScoreConfidence: 'MEDIUM'
//         }
//       },
//       {
//         Id: 'e29fb3c1-7549-40e9-8fa4-4c5a36d775c2-c242bb66-cc64-44a8-9537-2eed5eff49b9',
//         Type: 'DOCUMENT',
//         AdditionalAttributes: [],
//         DocumentId: 'fa222251-ecf8-4b4e-8d00-1069afed9800',
//         DocumentTitle: {
//           Text: 'Managing_Diabetes_NIDDK-searchable',
//           Highlights: [
//             {
//               BeginOffset: 9,
//               EndOffset: 17,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentExcerpt: {
//           Text: '...Managing Diabetes I NIDDK 10/23/20, 3:24 PM\n\n\nManaging Diabetes\nYou can manage your diabetes and live a long and healthy life by taking care of yourself\n\n\neach day.\n\n\nDiabetes can affect almost every part of your body. Therefore, you will need to manage your\n\n\nblood glucose...',
//           Highlights: [
//             {
//               BeginOffset: 12,
//               EndOffset: 20,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 58,
//               EndOffset: 66,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 87,
//               EndOffset: 95,
//               TopAnswer: false
//             },
//             {
//               BeginOffset: 170,
//               EndOffset: 178,
//               TopAnswer: false
//             }
//           ]
//         },
//         DocumentURI: '',
//         DocumentAttributes: [
//           {
//             Key: '_excerpt_page_number',
//             Value: {
//               LongValue: 1
//             }
//           }
//         ],
//         ScoreAttributes: {
//           ScoreConfidence: 'MEDIUM'
//         }
//       }
    ]
    // -------- CODE HERE--------
    // var idx = lunr.Index.load(JSON.parse(json_data))
    var idx = lunr(function () {
      this.ref('id')
      this.field('title')
      this.field('body')
      for (let index = 0; index < documents.length; index++) {
        var documentObj = documents[index]
        if (documentObj.Type === 'DOCUMENT' || documentObj.Type === 'ANSWER') {
          this.add({
            id: documentObj.Id,
            title: documentObj.DocumentTitle.Text,
            body: documentObj.DocumentExcerpt.Text
          })
        }
      }
    })
    console.log('>>> idx', idx)
    searchTerm = '*' + searchTerm + '*'
    results = idx.search(searchTerm)
    pageResults = splitPages(results, RESULTS_PER_PAGE)

    console.log('>>> results', results)
    console.log('>>> searchTerm', searchTerm)
    console.log('>>> pageResults', pageResults)
    document.getElementById('loading-spinner').style.display = 'none'
    var searchResultsCount = document.getElementById('search-results-count')
    searchResultsCount.innerHTML = documents.length + ' result'
    searchResultsCount.innerHTML += (documents.length === 1) ? ' ' : 's '
    searchResultsCount.innerHTML += "for '" + searchTerm + "'"
    document.getElementsByName('query')[1].setAttribute('value', searchTerm)
    if (!results.length) return
    var searchPageIndicator = document.getElementById('search-page-indicator')
    searchPageIndicator.style.display = pageResults.length > 1 ? 'flex' : 'none'
    searchPageIndicator.innerHTML = 'Page ' + (currentPageIndex + 1) + ' of ' + pageResults.length
    var searchResults = document.getElementById('search-results')
    searchResults.innerHTML = (function (results) {
      let searchPara = ''
      // var post_data = postsData // Obtain JSON var of all the posts in the site

      // Iterate over the results
      for (let i = 0; i < results.length; i++) {
        // var key = parseInt(results[i].ref)
        // var resultObject = post_data[key]
        var resultElement = results[i]
        var resultDocument = documents.find(documentObj => documentObj.Id === resultElement.ref)
        // var matchMetadata = results[i].matchData.metadata
        var matchMetadata = results[i].matchData.metadata

        var titleTruncateLength = 90
        // var resultTitle = resultObject.title.substring(0, titleTruncateLength)
        var resultTitle = resultDocument.DocumentTitle.Text.substring(0, titleTruncateLength)

        if (resultDocument.DocumentTitle.Text.length > titleTruncateLength) {
          var indexOfLastWord = resultDocument.DocumentTitle.Text.substring(0, titleTruncateLength).lastIndexOf(' ')
          var resultTitle = resultDocument.DocumentTitle.Text.substring(0, indexOfLastWord)
          resultTitle += ' ...'
        }
        // searchPara += '<a class="search-content" href="' + resultObject.url + '">' + ' ' + resultTitle + '</a>'
        searchPara += '<a class="search-content" href="' + '#' + '">' + ' ' + resultTitle + '</a>'

        // Find the position of the earliest keyword in the document
        // var firstPosition = returnFirstKeywordPosition(matchMetadata)

        // // Find the preview start position
        // var previewStartPosition = returnStartOfPreview(resultDocument.DocumentExcerpt.Text, firstPosition)

        // // Process the preview to embolden keywords
        // var processedPreview = highlightKeywords(resultDocument.DocumentExcerpt.Text, previewStartPosition, matchMetadata)
        // var postDate = new Date(resultObject['datestring']).toDateString().substring(4);
        // searchPara += '<p class="search-content permalink">' + resultObject.url + '</p><br>'

        searchPara += '<p class="search-content permalink">' + 'Document ID: ' + resultDocument.DocumentId + '</p><br>'
        // searchPara += '<p class="search-content" > '+ postDate + ' ...' + processedPreview + '...</p><br>';

        // if (processedPreview) {
        //   searchPara += '<p class="search-content" > ' + ' ...' + processedPreview + '...</p><br>'
        // }

        if (resultDocument.DocumentExcerpt.Text) {
          searchPara += '<p class="search-content" > ' + ' ...' + resultDocument.DocumentExcerpt.Text + '...</p><br>'
        }
      }

      return searchPara
    })(pageResults[currentPageIndex])
    document.getElementsByClassName('search-results-display')[0].style.display = 'block'
    if (!results.length || pageResults.length <= 1) return
    displayPagination()
    // --------------------------
  }
}

// -------------------------------- CODE FOR CONTENT SEARCH ----------------------------------------------

// Bolds the keywords in the preview string
function highlightKeywords (content, previewStartPosition, matchMetadata) {
  var matchMap = {}

  // Create an object containing search hit position and length of search hit in the document (for content within preview)
  for (var keyword in matchMetadata) {
    var positionArray

    if (!matchMetadata[keyword].content) {
      return
    }

    positionArray = matchMetadata[keyword].content.position

    for (let positionIndex = 0; positionIndex < positionArray.length; positionIndex++) {
      var hitPosition = positionArray[positionIndex][0]
      if (hitPosition >= previewStartPosition && hitPosition < previewStartPosition + PREVIEW_SIZE) {
        matchMap[hitPosition] = positionArray[positionIndex][1]
      }
    }
  }

  // Go through each search hit and bold it
  if (Object.keys(matchMap).length !== 0) {
    let processedPreview = ''
    let currPosition = previewStartPosition
    for (var wordPosition in matchMap) {
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
  for (var keyword in matchMetadata) {
    if (matchMetadata[keyword].content !== undefined) {
      var positionArray = matchMetadata[keyword].content.position

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
  var post_data = postsData // Obtain JSON var of all the posts in the site

  // Iterate over the results
  for (let i = 0; i < results.length; i++) {
    var key = parseInt(results[i].ref)
    var resultObject = post_data[key]
    var matchMetadata = results[i].matchData.metadata

    var titleTruncateLength = 90
    var resultTitle = resultObject.title.substring(0, titleTruncateLength)

    if (resultObject.title.length > titleTruncateLength) {
      var indexOfLastWord = resultObject.title.substring(0, titleTruncateLength).lastIndexOf(' ')
      var resultTitle = resultObject.title.substring(0, indexOfLastWord)
      resultTitle += ' ...'
    }
    searchPara += '<a class="search-content" href="' + resultObject.url + '">' + ' ' + resultTitle + '</a>'

    // Find the position of the earliest keyword in the document
    var firstPosition = returnFirstKeywordPosition(matchMetadata)
    console.log('>>> firstPosition', firstPosition)
    // Find the preview start position
    var previewStartPosition = returnStartOfPreview(resultObject.content, firstPosition)

    // Process the preview to embolden keywords
    var processedPreview = highlightKeywords(resultObject.content, previewStartPosition, matchMetadata)
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
  var searchResultsCount = document.getElementById('search-results-count')
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
  var searchPageIndicator = document.getElementById('search-page-indicator')
  searchPageIndicator.style.display = pageResults.length > 1 ? 'flex' : 'none'
  searchPageIndicator.innerHTML = 'Page ' + (currentPageIndex + 1) + ' of ' + pageResults.length

  var searchResults = document.getElementById('search-results')
  searchResults.innerHTML = returnResultsList(pageResults[currentPageIndex])
  document.getElementsByClassName('search-results-display')[0].style.display = 'block'
}

function changePage (curr, index) {
  changePageUtil(curr, index)
  paginateSearchResults()
}

// Obtain the query string, load the pre-built lunr index, and perform search
function getQueryVariable (variable) {
  var query = window.location.search.substring(1)
  var vars = query.split('&')

  for (let i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=')

    if (pair[0] === variable) {
      var dirtyString = decodeURIComponent(pair[1].replace(/\+/g, '%20'))
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
