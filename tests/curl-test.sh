#!/bin/bash

SERVER='127.0.0.1:8000'
INSTANCE='test'
JOBID=30



function request() {
	echo Invoking ${1} ${2}:
	curl -i -X ${1} -d @tester.json -H "Content-Type: application/json"  ${SERVER}${2}
	echo
	echo
}

#request GET /srcprocs/
#request OPTIONS /srcprocs/${INSTANCE}/jobs
#request GET /srcprocs/${INSTANCE}/jobs/30

request POST /srcprocs/JESProc/jobs 

#-H 'content-type:application/json' 
