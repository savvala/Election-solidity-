App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // todo: refactor conditional
    if (typeof web3 !== 'undefined') {
      // if a web3 instance is already provided by metamask.
      App.web3provider = web3.currentProvider;
      web3 = new Web3(web3.currentprovider);
    } else {
      // specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Election.json', function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = Trufflecontract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);
      return App.render();
    });
  },
  render: function() {
    var electionInstance;
    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    loader.hide();

    // load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $('#accountAddress').html('Your Account: ' + account);
      }
    });
    // Load Contract data
    App.contracts.Election.deployed().then(function(instance) {
      electionInstance = instance;
      return electionInstance.candidatesCount();
    }).then(function(candidatesCount) {
      var candidatesResults = $('#cadidatesResults');
      candidatesResults.empty();

      for (var i = 1; i <= candidatesCount; i++) {
        electioninstance.candidates(i).then(function(candidate) {
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render candidate Result

          var candidateTemplate = '<tr><th>' + id + '</th><td>' + name + '</td><td>' + voteCount + '</td></tr>'
          candidatesResults.append(candidateTemplate);
        });
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
