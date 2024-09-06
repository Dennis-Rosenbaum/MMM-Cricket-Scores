const node_helper = require("node_helper");
const Log = require("logger");
const { convert } = require("html-to-text");

module.exports = node_helper.create({

    async socketNotificationReceived(notification, payload) {
        const self = this;

        if (notification === "RETRIEVE_RESULTS") {

            let url = `https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current?lang=en&latest=true`

            try {
                const response = await fetch(url)
                const body = await response.json()

                let results = this.cleanJsonResults(body)
                results = this.filterResult(results, payload)

                self.sendSocketNotification("RESULTS_RETRIEVED", results)
            } catch (error) {
                Log.log("Error", error)
                self.sendSocketNotification("RESULTS_RETRIEVED_FAILED", error)
            }
        }
    },
    filterResult(results, payload) {
        let numberOfDays = payload.numberOfDays
        let endRange = new Date()
        // startRange is endRange minus the numberOfDays
        let startRange = new Date(endRange.getTime() - (numberOfDays * 24 * 60 * 60 * 1000))

        //filter the results where the startdate and enddate are somewhere between startRange and endRange
        let filteredResults = results.filter(result => {
            let startDate = new Date(result.startDate)
            let endDate = new Date(result.endDate)
            return (startDate >= startRange && startDate <= endRange) || (endDate >= startRange && endDate <= endRange)
        })

        //status must not be null
        filteredResults = filteredResults.filter(result => result.stage === "FINISHED")

        return filteredResults
    },
    cleanJsonResults(json) {
        // json looks like this, see Documentation/Example_match_result.json for full json
        //
        // {
        //     "matches": [
        //         {
        //             "startDate": "2024-08-30T00:00:00.000Z",
        //             "endDate": "2024-09-03T00:00:00.000Z",
        //             "title": "2nd Test",
        //             "statusText": "Bangladesh won by 6 wickets",
        //             "ground": {
        //                 "smallName": "Rawalpindi",
        //              },
        //             "teams": [
        //                 {
        //                     "team": {
        //                         "abbreviation": "PAK",
        //                         "imageUrl": "db/PICTURES/CMS/381800/381891.png"
        //                     },
        //                     "score": "274 & 172"
        //                     "scoreInfo": "T:185"
        //                 },
        //              ],
        //        }
        //     ]
        // }

        const urlPrefix = "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci"
        const results = []

        json.matches.forEach(match => {

            const teams = []
            match.teams.forEach(team => {
                teams.push({
                    teamName: team.team?.abbreviation,
                    imageUrl: urlPrefix + team.team?.imageUrl,
                    score: team.score,
                    scoreInfo: team.scoreInfo
                })
            })

            const result = {
                startDate: match.startDate,
                endDate: match.endDate,
                title: match.title,
                ground: match.ground?.smallName,
                status: match.statusText,
                stage: match.stage,
                teams: teams
            }
            results.push(result)
        })

        return results
    }
});
