// This is a (very) quick and (very) dirty re-implementation
// of the awesome Markovify (https://github.com/jsvine/markovify)
// Do Whatever You Want License
// Requires Lodash
// Made by Eliot ANDRES

var BEGIN = '__BEGIN__';
var END = '__END__';
var TRIES = 50;
var MOR = 0.5;
var MOT = 15;

function sentence_split(text) {
  return text.split(/\s*\n\s*/);
}

function wordSplit(sentence) {
  return sentence.split(/\s+/)
}

function generate_corpus(inputText) {
  var sentences = sentence_split(inputText);
  //passing = filter(self.test_sentence_input, sentences)
  var runs = _.map(sentences, wordSplit);
  return runs;
}

function Chain(runs, stateSize) {
  var _this = this;
  _this.model = {};
  var initialState = [];

  _.times(stateSize, function () {
    initialState.push(BEGIN)
  });

  _this.initialState = initialState;

  _.forEach(runs, function (run) {
    var items = [];
    items = _.concat(_this.initialState, run);
    items.push(END);

    _.times(run.length + 1, function (i) {
      var state = tuppleToString(items.slice(i, i + stateSize));
      var follow = items[i+stateSize];
      if (!_this.model.hasOwnProperty(state)) {
        _this.model[state] = {}
      }
      if (!_this.model[state].hasOwnProperty(follow)) {
        _this.model[state][follow] = 0
      }
      _this.model[state][follow]++;
    });
  });

  _this.walk = function (initState) {
    if (initState) {
      // Not implemented
    } else {
      return _this.gen();
    }
  };

  _this.moveIt = function (state) {
    // Pick next word at random
    var modelState = _this.model[tuppleToString(state)];
    var list = [];

    _.forEach(_.keys(modelState), function (key) {
      _.times(modelState[key], function () {
        list.push(key);
      })
    });

    return _.sample(list);
  };

  _this.gen = function () {
    /*"""
     Starting either with a naive BEGIN state, or the provided `init_state`
     (as a tuple), return a generator that will yield successive items
     until the chain reaches the END state.
     """*/
    var state = [];
    _.times(stateSize, function () {
      state.push(BEGIN)
    });

    var words = [];

    while (true)
    {
      // Move was not accepted here ?
      var nextWord = _this.moveIt(state);
      if (nextWord === END) {
        return words;
      }
      words.push(nextWord);
      state = state.slice(1);
      state.push(nextWord);
    }
  }
}

var joinString = '&&&';

function tuppleToString(tupple) {
  return tupple.join(joinString)
}

function Text(inputText, state_size) {
  var _this = this;
  var stateSize;
  if (!state_size) {
    stateSize = 2
  } else {
    stateSize = state_size
  }

  var runs = generate_corpus(inputText);

  _this.rejoined_text = (_.map(runs, function(run){
    return run.join(" ");
  })).join(" ");

  _this.chain =  new Chain(runs, stateSize);


  _this.makeSmallSentence = function (maxLength, minLength) {

    for (var i = 0; i < 50; i++ ) {
      var sentence = _this.makeSentence();
      if (sentence == null) continue;
      if (sentence.length < maxLength && sentence.length > minLength){
        return sentence;
      }
    }
    return null;
  };

  _this.makeSentence = function() {

    _this.testOutput = function (words, mor, mot) {
      // for now
      var overlapRatio = Math.round(mor * words.length);
      var overlapMax = Math.min(mot, overlapRatio);
      var overlapOver = overlapMax + 1;
      var gramCount = Math.max((words.length - overlapMax), 1);
      var grams = _.times(gramCount, function (i) {
        return words.slice(i, i + overlapOver);
      });

      // If any matches, return false
      return !_.some(grams, function (gram) {
        var gramJoined = gram.join(" ");
        if ( _this.rejoined_text.indexOf(gramJoined) !== -1 ) {
          return true;
        }
      });
    };

    var sentence = null;
    for (var i = 0; i < TRIES; i++ ) {
      var words = _this.chain.walk();
      if (_this.testOutput(words, MOR, MOT)){
        sentence = words.join(" ");
        break;
      }
    }
    return sentence;
  }
}
