Module.register('MMM-Cricket-Scores', {

  defaults: {
    numberOfDays: 2, // Range between today and today - numberOfDays to show the scores for
    resultSwitchInterval: 10 // Switch to the next result every so milliseconds
  },

  /**
   * Apply the default quiz styles.
   */
  getStyles() {
    return ['cricket-scores.css']
  },

  /**
   * Pseudo-constructor for our module. Sets the default current page to 0.
   */
  start() {
    this.results = undefined
    this.resultsIndex = 0
    this.startRetrievingResults()

    setInterval(() => {
      this.resultsIndex++
      this.processResult()
    }, this.config.resultSwitchInterval * 1000)
  },

  socketNotificationReceived: function (notification, payload) {
    console.log("Socket notification received", notification)
    if (notification === 'RESULTS_RETRIEVED') {
      Log.log(`[${this.name}] received results from json`, payload)
      this.clearError()
      this.processResults(payload)
    } else if (notification === 'RESULTS_RETRIEVED_FAILED') {
      Log.error(`[${this.name}] Receiving results failed`, payload)
      this.setError("Could not retrieve results")
    }
  },

  getDom() {
    if (this.error)
      return this.getDomError(this.error)

    if (this.results)
      return this.getDomResult()

    return this.getDomLoading()
  },

  getDomError(error) {
    console.log("Render dom error")
    const wrapper = document.createElement('div')
    wrapper.className = 'error-container'
    wrapper.innerHTML = error
    return wrapper
  },

  getDomLoading() {
    console.log("Render loading the results")
    const wrapper = document.createElement('div')
    wrapper.innerHTML = "Loading new results...."
    return wrapper
  },

  getDomResult() {
    const self = this

    const wrapper = document.createElement('div')

    const resultElement = document.createElement("div")
    resultElement.innerHTML = this.getDomMatchResult(this.currentResult)

    const pagerElement = document.createElement("div")
    pagerElement.className = "pager"

    const previousButton = document.createElement("span")
    previousButton.innerHTML = "<"
    previousButton.onclick = function () {
      self.resultsIndex--
      self.processResult()
    }
    pagerElement.appendChild(previousButton)

    const pagerText = document.createElement("span")
    pagerText.innerHTML = `view result ${this.resultsIndex + 1}/${this.results.length}`
    pagerElement.appendChild(pagerText)

    const nextButton = document.createElement("span")
    nextButton.innerHTML = ">"
    nextButton.onclick = function () {
      self.resultsIndex++
      self.processResult()
    }
    pagerElement.appendChild(nextButton)

    wrapper.appendChild(resultElement)
    wrapper.appendChild(pagerElement)

    return wrapper
  },

  getDomMatchResult(result) {
    const html = `<div class="result">
  <div>
    RESULT · 
    <span class="title">${result.title}</span> · 
    <span class="ground">${result.ground}</span>
  </div>
  <div class="teams">
  ${result.teams?.map(team => this.getDomTeamResult(team)).join('')}
  </div>
  <div>
    <span class="status">${result.status}</span>
  </div>
</div>`

    return html
  },
  getDomTeamResult(team) {
    const html = `<div class="team">
    <div style="float: left">
      <img src="${team.imageUrl}" width="20" height="20"> 
      <span class="teamname">${team.teamName}</span>
    </div>
    <div style="float: right">
        <span class="scoreInfo">${team.scoreInfo == null ? '' : `(${team.scoreInfo})`}</span> 
        <span class="score">${team.score}</span>
    </div>
    <div style="clear:both"></div>
  </div>`
    return html
  },
  startRetrievingResults() {
    Log.log(`[${this.name}] get results`, this)
    this.sendSocketNotification('RETRIEVE_RESULTS', {
      numberOfDays: this.config.numberOfDays
    })
  },
  setError(error) {
    this.error = error
    this.updateDom()
  },

  clearError() {
    this.error = undefined
  },

  processResults(processResults) {
    this.results = processResults
    this.resultsIndex = 0

    this.processResult()
  },
  processResult() {
    //check if the resultsIndex is out of bounds and fix it by looping through the items
    if (this.resultsIndex < 0) {
      this.resultsIndex = this.results.length - 1
    } else if (this.resultsIndex >= this.results.length) {
      this.resultsIndex = 0
    }

    if (this.results.length === 0) {
      this.setError("No results found")
      return
    }

    this.currentResult = this.results[this.resultsIndex]
    this.updateDom()
  }
});
