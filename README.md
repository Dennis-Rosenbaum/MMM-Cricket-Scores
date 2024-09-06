# MMM-Cricket-Scores
Shows the cricket scores on a Magic Mirror

![Screenshot 2024-09-05 at 12 40 15](https://github.com/user-attachments/assets/1e551308-0aea-4abd-8d59-7b4e2b42daca)


## Installation

### Install

In your terminal, go to your MagicMirror's Module folder and clone MMM-Cricket-Scores:

```bash
cd ~/MagicMirror/modules
git clone https://github.com/Dennis-Rosenbaum/MMM-Cricket-Scores.git
```

### Update

```bash
cd ~/MagicMirror/modules/MMM-Cricket-Scores
git pull
npm update
```

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
```js
modules: [
    {
        module: 'MMM-Cricket-Scores',
        position: 'lower_third',
        header: "Cricket scores",
        config: {
        }
    }
]
```

## Configuration options

Option|Possible values|Default|Description
------|------|------|-----------
`numberOfDays`|[number]|2|Range between today and today - numberOfDays to show the scores for
`resultSwitchInterval`|[number]|10|Switch to the next result every so seconds

## DOM example
The dom will look like this:

```html
<div class="cricketContainer">
  <div class="result">
    <div class="resultSection">
        RESULT · 
        <span class="title">[title]</span> · 
        <span class="ground">[ground]</span>
    </div>
    <div class="vs">
      <p>VS</p>
    </div>  
    <div class="teams">
      <div class="team">
        <div style="float: left">
          <img class="teamIcon" src="${team.imageUrl}"> 
            <div>
              <span class="teamname">[teamName]</span>
            </div>
            <div>
              <span class="score">[score]</span>
              <div>
                <span class="scoreInfo">[scoreInfo]</span> 
              </div>
            </div> 
          </div>
        </div>
    </div>
    <div>
        <span class="status">[status]</span>
    </div>
  </div>
  <div class="pager">
    <span>&lt; </span>
    <span>view result [current]/[total]</span>
    <span>&gt; </span>
  </div>
</div>
```



[mm]: https://github.com/MichMich/MagicMirror
