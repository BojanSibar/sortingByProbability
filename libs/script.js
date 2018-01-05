(function () {
  var nodes = [],
      places = [],
      sequence = [];
  function Node(num) {
    this.name = toColumnName(num);
    this.wins = [];
    this.loses = [];
    this.possibilities = [];
  }
  //gui
  $('#generator').on('click', function(){
    $(this).prop('disabled', true)
    for(var i = 1; i <= 9; i++){
      nodes.push(new Node(i));
      places.push([]);
    }
    generateSequence();
    //drawNodes();
    goRoundI(goRoundII);
  });

  $('#resolve').on('click', function(){
    $('#realSequence').show();
  });

  function generateSequence() {
    var randomSeq = shuffle([1,2,3,4,5,6,7,8,9]); // zakucano
    for(let i = 0; i < randomSeq.length; i++){
      nodes[i].rank = randomSeq[i];
    }
    drawSequence();
  }

  function drawSequence(){
      var sorted = sortCopy(nodes)
      for(let i = 0; i < sorted.length; i++){
        $('<div/>',{
          class: 'node-unit',
          text: sorted[i].name
        }).appendTo('#realSequence');
      }
  }

  function drawNodes(){
    for(var i = 0; i < nodes.length; i++){
      $('<div/>',{
        'class': 'node-unit',
        'id': nodes[i].name,
        'text': nodes[i].name
      }).appendTo('body')
    }
  }
  //bussines
  function askQuestion(answers, callback){
    var validate = function (){
      var selections = $('select'),
          areAllSelected = true;
      $(selections).each(function(){
          areAllSelected = !!this.value;
          if(!areAllSelected){
            return false;
          }
      });
      return areAllSelected;
    }

    var onChangeFunction = function (el) {
      var selected = $(el),
        selections = $('select'),
        next = selected.next('select'),
        selectedAnswers = [];
      $(selections).each(function(){
        if($(this).val()){
          selectedAnswers.push($(this).val());
        }
      })
      if(next.length && selected.val()){
        next.find('option').remove();
        next.append($("<option>").text(''));
        var answersLeft = answers.filter(function(e){ return selectedAnswers.indexOf(e.name) === -1});
        $(answersLeft).each(function() {
         next.append($("<option>").text(this.name));
        });
      }
    }

    var questionDiv = $('<div/>',{
      'class': 'question-container',
      'text': 'Koji od ponudjenih odgovora je najbolji a koji najlosiji? '
    }).appendTo('body');

    var sel = $('<select>').appendTo(questionDiv);
    sel.append($("<option>").text(''));
    $(answers).each(function() {
     sel.append($("<option>").text(this.name));
    });
    sel.on('change', function(){
      onChangeFunction(this);
    })

    var sel2 = $('<select>').appendTo(questionDiv);
    sel2.append($("<option>").text(''));
    sel2.on('change', function(){
      onChangeFunction(this);
    })

    var sel3 = $('<select>').appendTo(questionDiv);
    sel3.append($("<option>").text(''));
    sel3.on('change', function(){
      onChangeFunction(this);
    })

    var button = $('<button>').text('submit').appendTo(questionDiv).on('click', function(){
      if (validate()){
        var winer = $(sel).val();
        var midle = $(sel2).val();
        var looser = $(sel3).val();

        $('<div/>',{
          'class': 'answers-container',
          'text': winer + ' is better then ' + midle + ' is better then ' + looser
        }).appendTo('body');

        var wNode = nodes.find(function(e){return e.name == winer});
        wNode.wins.push(midle,looser);

        var mNode = nodes.find(function(e){return e.name == midle});
        mNode.wins.push(looser);
        mNode.loses.push(winer);

        var lNode = nodes.find(function(e){return e.name == looser});
        lNode.loses.push(winer, midle);
        questionDiv.remove();
        if(callback){
          callback();
        }

      }
    })

  }

  function goRoundI(nextRoundCallback){
    askQuestion([nodes[0],nodes[1],nodes[2]], function(){
      askQuestion([nodes[3],nodes[4],nodes[5]], function(){
        askQuestion([nodes[6],nodes[7],nodes[8]],function(){
          if(nextRoundCallback){
            nextRoundCallback()
          }
        });
      });
    });
  }

  function goRoundII(){
    nodes.sort(function(a,b){
      return b.wins.length - a.wins.length
    });
    goRoundI(function(){
      nodes.sort(function(a,b){
        return b.wins.length - a.wins.length
      });
      let numberOfNodes = nodes.length;
      let maxMatches = numberOfNodes - 1;
      for(var i = 0; i < numberOfNodes; i++){
        console.log("cao ja sam " + nodes[i].name + " moje pobede:" + extractWins(nodes[i]) + " i moji porazi:" + extractLoses(nodes[i]));
        let node = nodes[i];
        node.wins = extractWins(node);
        node.loses = extractLoses(node);
        let allreadyDone = node.wins.length + node.loses.length;
        let bestCase = numberOfNodes - (node.wins.length + (maxMatches - allreadyDone));
        let worstCase = numberOfNodes - node.wins.length;
        if(bestCase != worstCase){
          for(var j = bestCase; j <= worstCase; j++){
            node.possibilities.push({place: j, prob: 1/(numberOfNodes - allreadyDone)});
            places[j-1].push({name: node.name, prob: 1/(numberOfNodes - allreadyDone)});
          }
        }else {
          node.possibilities.push({place: bestCase, prob: 1});
          places[bestCase-1].push({name: node.name, prob: 1});
        }
      }
      console.log(nodes);
      console.log(places);
      drawPlaces();
    })

  }
  function drawPlaces(){
    var container =  $('<div/>',{
      class: 'places-container'
    }).appendTo('body');
    for(let i = 0; i < places.length; i++){
      let place = places[i];
      var row = $('<div/>',{
        class: 'places-row-container'
      }).appendTo(container);
      for (let j = 0; j < place.length; j++){
        var singlePos = $('<div/>',{
          text: place[j].name + " " + Math.round(place[j].prob * 100)
        }).appendTo(row)
      }
    }
  }
  function extractWins(node){
    var arrayOfExtracts = []
    for(var i = 0; i < node.wins.length; i++){
      if(arrayOfExtracts.indexOf(node.wins[i]) === -1 ){
        arrayOfExtracts.push(node.wins[i]);
      }
      var newNode = nodes.find(function(e){return e.name == node.wins[i]});
      var extract = extractWins(newNode);
      for(var j = 0; j < extract.length; j++){
        if(arrayOfExtracts.indexOf(extract[j]) === -1 ){
          arrayOfExtracts.push(extract[j]);
        }
      }
    }
    return arrayOfExtracts;
  }

  function extractLoses(node){
    var arrayOfExtracts = []
    for(var i = 0; i < node.loses.length; i++){
      if(arrayOfExtracts.indexOf(node.loses[i]) === -1 ){
        arrayOfExtracts.push(node.loses[i]);
      }
      var newNode = nodes.find(function(e){return e.name == node.loses[i]});
      var extract = extractLoses(newNode);
      for(var j = 0; j < extract.length; j++){
        if(arrayOfExtracts.indexOf(extract[j]) === -1 ){
          arrayOfExtracts.push(extract[j]);
        }
      }
    }
    return arrayOfExtracts;
  }
  //helpers methods
  function sortCopy(arr){
    return arr.slice().sort(function(a,b){
      return a.rank - b.rank
    })
  }
  function toColumnName(num) {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret.toUpperCase();
  }
  function shuffle(array) {
    var i = array.length,
        j = 0,
        temp;

    while (i--) {

        j = Math.floor(Math.random() * (i+1));

        // swap randomly chosen element with current element
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;

    }

    return array;
}

})();
