/*
 * To run correctly the tests, you need a MongoDB running on localhost
 * see the dbconfig.json file
 *
 */

var assert = require("assert");
var fileLoader = require("../proxyfileloader");
var dbLoader = require("../proxydbloader");
var dbConfig = require("./dbconfig.json");
var dbStore = require("../mongoDBStore");


describe('Test proxies', function(){


  describe('#DefaultFileisEmpty', function(){
    it('should return an empty list of proxies for the default file', function(done){

     	fileLoader.loadDefaultProxies(function(error, proxies) {

     		 //console.log("Test result : " + proxies.getProxies());
     	 	assert.equal(0, proxies.getNumberOfProxies());

     	 	done();

     	 });
    });
  });


  describe('#isInvalidFormat', function(){

    it('should return an empty list of proxies for the file & an invalid status : invalidformat.txt', function(done){
    	config = fileLoader.config().setProxyFile("./test/files/invalidformat.txt");
    	fileLoader.loadProxyFile(config, function(error, proxies) {
      		assert(error);
      		done();
      	});
    });
  });


  describe('#FileNotExist', function(){

		  it('File should not exist : xxxxx.txt', function(done){
			    config = fileLoader.config().setProxyFile("./test/files/invalidformat.txt");
		    	fileLoader.loadProxyFile(config, function(error, proxies) {
		    		assert(error);
		      		done();
		      	});
		    });
  });


  describe('#isCorrectFormat', function(){

	  	var loadedProxies = null;

	  	before(function(done){
	  		config = fileLoader.config().
                  setProxyFile("./test/files/goodformat.txt").
                  setRemoveInvalidProxies(false);

	  		fileLoader.loadProxyFile(config, function(error, result) {
	  			loadedProxies = result;
	  			done();

	  		});
	  	});

	    it('should be a correct list of proxies', function(){
	    		assert.equal(5, loadedProxies.getNumberOfProxies());
		    	assert.equal(5, loadedProxies.getProxies().length);

	     });

	    it('Invalid domain host or port for the first proxy', function(){
	    	var firstProxy = loadedProxies.getProxy();
	    	assert.equal(false, firstProxy.valid);

	    });


		it('Invalid user or password or url for the second proxy', function(){

	      var proxy = loadedProxies.getProxies()[1];
	      assert.equal(proxy.userName, "usertest");
	      assert.equal(proxy.password, "passwordtest");
	      assert.equal(proxy.getUrl(), "http://usertest:passwordtest@myproxydomaine.com:1235");
	    });


  });



  describe('#DontPassCheckAndKeepInvalid', function(){

	  var loadedProxies = null;

	  before(function(done){
		    config = fileLoader.config().
                    setProxyFile("./test/files/goodformat.txt").
	  		            setRemoveInvalidProxies(false);

        fileLoader.loadProxyFile(config, function(error, result) {
	  			loadedProxies = result;
	  			done();

	  		});
	  });

	  it('Should be all invalid', function(){
		  assert.equal(5, loadedProxies.getNumberOfProxies());
		  for(var i=0;i<loadedProxies.getProxies().length;i++) {
			  assert.equal(false, loadedProxies.getProxies()[i].valid);
		  }

	  });


	  // Add more test - make a difference between a ping and a request error ?
  });


  describe('#DontPassCheckAndRemoveInvalid', function(){

	  it('should return an empty list of proxies', function(done){

		  config = fileLoader.config().setProxyFile("./test/files/goodformat.txt");
		  fileLoader.loadProxyFile(config, function(error, result){
	     		//console.log("Test result : " + proxies.getProxies());
	     	 	assert.equal(0, result.getNumberOfProxies());
	     	 	done();

	     	 });
	    });


  });

  describe('#PersistProxiesInDB', function(){

      var pm = new dbStore.MongoDBProxyStore(dbConfig);

      var config = fileLoader.config().
                      setProxyFile("./test/files/10proxies.txt").
                      setRemoveInvalidProxies(false).
                      setPm(pm);

      before(function(done){
          this.timeout(60000);
          config.pm.connect(function(error){
            if (error) {
              done(error);
              return;
            }

            fileLoader.loadProxyFile(config, function(error, result) {

              done(error);

            });
          });

      });

      it('Invalid Number of proxies in the DB', function(done){
        var collection = config.pm.getCollection();
        collection.stats(function(err, stats) {
          assert.equal(10, stats.count);
          done();

        });

      });


      it('should return 10 proxies from the DB', function(done){

         var config = dbLoader.config().setPm(pm);
         dbLoader.loadProxies(config, function(error, proxies) {
            assert.equal(10, proxies.getNumberOfProxies());
            pm.close(); 
            done();

          });
      });

    // Add more test - make a difference between a ping and a request error ?
  });

});
