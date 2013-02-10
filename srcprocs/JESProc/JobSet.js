var JobSet = function()
{
	
	this.set = {};

}


JobSet.prototype.addJob = function(job)
{
	
	this.set[job.id] = job;
	
}


JobSet.prototype.getJob = function(id)
{
	
	return this.set[id];
	
}


module.exports = JobSet;
