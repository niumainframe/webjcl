# Makefile to build some various things in WebJCL

# Relative path to r.js
rjs = node_modules/requirejs/bin/r.js

# In the future, having the node app do this automatically should suffice.
# http://requirejs.org/docs/node.html#optimizer

all: ${node_modules} client/js/main-built.js client/js/JobProcessing/load.js

rebuild-js: 
	rm -f client/js/main-built.js
	${rjs} -o client/js/build.js

node_modules:
	npm install

# require.js script
${rjs}: node_modules

# Optimized JavaScript file.
client/js/main-built.js: ${rjs} client/js/JobProcessing/load.js
	${rjs} -o client/js/build.js

# JobProcessing client loader js file.
client/js/JobProcessing/load.js: client/js/JobProcessing/build.load.js \
								 client/js/JobProcessing/load.js.skel
	cd client/js/JobProcessing && node build.load.js
	
	
