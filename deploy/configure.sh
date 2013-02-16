#!/bin/bash

# Makes all of the config.json.skel files are edited and deployed.
# Run from base directory of the app.


# check for the needed commands
for prog in dirname basename; do
	if test `whereis -b $prog|wc -w` -lt 2; then
		echo "This script requires that \"$prog\" is available."
		exit 1
	fi
done

editor=vi

configs=(`find -name config.json.skel`)

for f in ${configs[@]}; do
	
	dirname=`dirname $f`
	basename=`basename $f`
	confname=$dirname/config.json
	
	overwrite=y
	
	if test -e $confname; then
		echo $confname already exists? Overwrite with skeleton?
		read overwrite
	fi
		
		
	if [[ $overwrite =~ [yY] ]]; then
		cp $f $confname
	fi
		

	$editor $confname
	
done
